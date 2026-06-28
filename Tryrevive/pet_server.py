#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Tryrevive Desktop Pet Bridge Server
A lightweight, zero-dependency HTTP server running locally on port 5678.
Acts as a bridge between the browser application and local PyQt6 pet processes.
"""

import sys
import os
import json
import subprocess
import signal
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

PORT = 5678
PID_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".pet.pid")
H5_STATE = None
H5_ACTION = None

class PetRequestHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/status':
            self.handle_status()
        elif parsed.path == '/api/pets':
            self.handle_list_pets()
        elif parsed.path == '/api/pet-state':
            self.handle_get_pet_state()
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/toggle':
            self.handle_toggle()
        elif parsed.path == '/api/state':
            self.handle_set_state()
        else:
            self.send_error(404, "Not Found")

    def handle_status(self):
        running, active_pet = is_pet_running()
        response = {
            "connected": True,
            "running": running,
            "active_pet": active_pet
        }
        self.send_json_response(200, response)

    def handle_list_pets(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        pets = []
        
        # Scan folder for any Python files ending in _pet.py or desktop_pet.py
        for file in sorted(os.listdir(current_dir)):
            if file.endswith("_pet.py") or file == "desktop_pet.py":
                # Create user-friendly display name
                if file == "desktop_pet.py":
                    display_name = "Crayon Pet (默认 PyQt6 蜡笔桌宠)"
                else:
                    display_name = file.replace("_pet.py", "").replace("_", " ").title() + " Pet"
                
                pets.append({
                    "filename": file,
                    "name": display_name
                })
        
        self.send_json_response(200, {"pets": pets})

    def handle_toggle(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
        except Exception:
            data = {}

        action = data.get("action")
        pet_filename = data.get("pet", "desktop_pet.py")

        if action == "start":
            success, msg = start_pet(pet_filename)
            status_code = 200 if success else 400
            self.send_json_response(status_code, {"success": success, "message": msg})
        elif action == "stop":
            success, msg = stop_pet()
            status_code = 200 if success else 400
            self.send_json_response(status_code, {"success": success, "message": msg})
        else:
            self.send_json_response(400, {"success": False, "message": "Invalid action"})

    def handle_set_state(self):
        global H5_STATE, H5_ACTION
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
            H5_STATE = data.get("state")
            H5_ACTION = data.get("action")
            success = True
            msg = "State updated"
        except Exception as e:
            success = False
            msg = str(e)
        self.send_json_response(200 if success else 400, {"success": success, "message": msg})

    def handle_get_pet_state(self):
        global H5_STATE, H5_ACTION
        self.send_json_response(200, {"state": H5_STATE, "action": H5_ACTION})


    def send_json_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def log_message(self, format, *args):
        # Prevent default terminal request logging spam
        pass

def is_pet_running():
    if not os.path.exists(PID_FILE):
        return False, None
    try:
        with open(PID_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return False, None
            pid, pet_filename = content.split(",", 1)
            pid = int(pid)
        # Check if process is still alive (SIG_DFL check)
        os.kill(pid, 0)
        return True, pet_filename
    except (OSError, ValueError, FileNotFoundError):
        # Process not running or PID file corrupted, cleanup
        if os.path.exists(PID_FILE):
            try:
                os.remove(PID_FILE)
            except Exception:
                pass
        return False, None

def start_pet(pet_filename):
    running, active_pet = is_pet_running()
    if running:
        if active_pet == pet_filename:
            return True, f"Pet {pet_filename} is already running"
        else:
            # Stop currently running pet
            stop_pet()

    current_dir = os.path.dirname(os.path.abspath(__file__))
    pet_path = os.path.join(current_dir, pet_filename)
    if not os.path.exists(pet_path):
        return False, f"Pet script {pet_filename} not found"

    # Locate the python executable
    venv_python = os.path.join(current_dir, "..", ".venv", "bin", "python")
    if os.path.exists(venv_python):
        python_exe = venv_python
    else:
        python_exe = sys.executable

    try:
        # Launch pet in background detaching process group
        proc = subprocess.Popen(
            [python_exe, pet_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            cwd=current_dir,
            preexec_fn=os.setpgrp
        )
        # Write PID and filename
        with open(PID_FILE, "w") as f:
            f.write(f"{proc.pid},{pet_filename}")
        return True, f"Successfully started {pet_filename}"
    except Exception as e:
        return False, f"Failed to start pet: {str(e)}"

def stop_pet():
    active_filename = "desktop_pet.py"
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    _, active_filename = content.split(",", 1)
        except Exception:
            pass

    try:
        # Stop the specific process group if possible
        if os.path.exists(PID_FILE):
            with open(PID_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    pid, _ = content.split(",", 1)
                    os.kill(int(pid), signal.SIGTERM)
    except Exception:
        pass

    try:
        # Thoroughly kill all running instances of this pet script
        subprocess.run(["pkill", "-f", active_filename], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
        return True, f"Stopped all instances of {active_filename}"
    except Exception as e:
        return False, f"Failed to stop pet: {str(e)}"

def main():
    print(f"Starting Tryrevive Desktop Pet Bridge Server on http://localhost:{PORT}...")
    server = HTTPServer(('127.0.0.1', PORT), PetRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()

if __name__ == '__main__':
    main()
