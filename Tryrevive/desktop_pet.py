#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Tryrevive macOS Crayon Desk Pet (桌宠)
A native desktop widget rendering a hand-drawn crayon/chalk avatar using PyQt6.
Supports frameless transparent background, topmost floating window, mouse dragging,
double-click styling toggles, screen patrol, and automatic active window tracking via AppleScript.
"""

import sys
import os
import math
import random
import time
import subprocess
import threading
from PyQt6.QtWidgets import QApplication, QWidget, QLabel
from PyQt6.QtCore import Qt, QTimer, QPoint
from PyQt6.QtGui import QPixmap, QImage, QMouseEvent
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Global State
current_state = "gray"      # "gray" (healing), "white" (focus), "black" (distracted)
current_action = "walk"     # "walk", "idle", "drag", "think", "jump", "cry"
pet_style = "B"             # "A" (plain), "B" (sprouted leaves + blushing cheeks)
frame_count = 0
dx = 2                      # Horizontal walking speed
tears = []                  # Particle array for crying state

# Setup window dimensions
WINDOW_WIDTH = 160
WINDOW_HEIGHT = 160

# Jitter function to simulate organic boiling lines (hand-drawn crayon vibe)
def j(val, max_offset=0.8):
    return val + math.sin(frame_count * 0.35 + val * 0.1) * max_offset

# Crayon stroke renderer
def draw_crayon_stroke(draw, coords, thickness, stroke_color):
    if len(coords) < 2:
        return
    r, g, b, a = stroke_color
    # Draw 3 layers of slightly offset lines to simulate thick textured brush strokes
    for layer in range(3):
        width = max(1, int(thickness - layer * 1.5))
        layer_alpha = int(a * (0.85 - layer * 0.15))
        color_with_alpha = (r, g, b, layer_alpha)
        
        dx_offset = (random.random() - 0.5) * 1.2
        dy_offset = (random.random() - 0.5) * 1.2
        
        flat_coords = []
        for x, y in coords:
            flat_coords.append(j(x + dx_offset, 0.4))
            flat_coords.append(j(y + dy_offset, 0.4))
        
        draw.line(flat_coords, fill=color_with_alpha, width=width, joint="round")

# Main drawing routine matching JS logic
def render_avatar_frame():
    global frame_count, tears
    frame_count += 1
    
    # Create empty transparent canvas
    img = Image.new("RGBA", (WINDOW_WIDTH, WINDOW_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Center coordinates
    x = WINDOW_WIDTH // 2
    y = WINDOW_HEIGHT // 2 - 5
    head_radius = 24
    
    # Determine state variables
    state_name = current_state
    action_name = current_action
    
    speed_factor = 0.12
    if state_name == "black":
        speed_factor = 0.05
    elif state_name == "white":
        speed_factor = 0.18
        
    cycle = frame_count * speed_factor
    head_x = x
    head_y = y - 10
    body_offset_y = 0
    
    # Color mapping
    if state_name == "black":
        head_color = (34, 36, 43, 255)            # dirty dark gray
        body_stroke = (110, 95, 95, 242)          # dirty pink-gray
    elif state_name == "white":
        head_color = (255, 255, 255, 255)         # pure clean white
        body_stroke = (255, 215, 215, 250)         # clean pink
    else:
        head_color = (243, 244, 246, 255)         # warm off-white
        body_stroke = (244, 214, 214, 242)         # soft pastel pink
        
    # Draw floor shadow
    shadow_size = 42 if state_name == "black" else (28 if state_name == "white" else 34)
    draw.ellipse([x - shadow_size, y + 42 - 6, x + shadow_size, y + 42 + 6], fill=(0, 0, 0, 30))
    
    # Setup coordinates based on action state
    torso_coords = []
    left_arm_coords = []
    right_arm_coords = []
    left_leg_coords = []
    right_leg_coords = []
    
    if state_name == "black":
        if action_name == "cry":
            body_offset_y = math.sin(cycle * 0.5) * 1.0
            head_y += 12 + body_offset_y
            
            torso_coords = [(x, head_y + head_radius - 4), (x, y + 15)]
            left_arm_coords = [(x - 8, y + 6), (head_x - 12, head_y + 8)]
            right_arm_coords = [(x + 8, y + 6), (head_x + 12, head_y + 8)]
            left_leg_coords = [(x - 6, y + 14), (x - 18, y + 20), (x - 12, y + 24)]
            right_leg_coords = [(x + 6, y + 14), (x + 18, y + 20), (x + 12, y + 24)]
            
            # Spawn tears
            if random.random() < 0.12:
                tears.append({"x": head_x - 8, "y": head_y + 4, "vy": 1.5, "alpha": 1.0})
                tears.append({"x": head_x + 8, "y": head_y + 4, "vy": 1.5, "alpha": 1.0})
        else:
            # Crawling/drag pose for distracted state
            body_offset_y = math.sin(cycle) * 1.5
            head_x += 8
            head_y += 18 + body_offset_y
            
            torso_coords = [(x - 10, y + 15), (x + 8, y + 15)]
            left_arm_coords = [(x - 8, y + 15), (x - 22, y + 25 + int(math.sin(cycle) * 4))]
            right_arm_coords = [(x + 8, y + 15), (x + 20, y + 25 - int(math.sin(cycle) * 4))]
            left_leg_coords = [(x - 12, y + 15), (x - 26, y + 28 + int(math.cos(cycle) * 4))]
            right_leg_coords = [(x - 2, y + 15), (x - 14, y + 28 - int(math.cos(cycle) * 4))]
            
    elif state_name == "white":
        if action_name == "jump":
            body_offset_y = -abs(math.sin(cycle * 0.8)) * 20
            head_y += body_offset_y
            
            torso_coords = [(x, head_y + head_radius - 2), (x, y + body_offset_y + 18)]
            left_arm_coords = [(x, y + body_offset_y + 4), (x - 24, y + body_offset_y - 12)]
            right_arm_coords = [(x, y + body_offset_y + 4), (x + 24, y + body_offset_y - 12)]
            left_leg_coords = [(x - 6, y + body_offset_y + 16), (x - 14, y + body_offset_y + 28)]
            right_leg_coords = [(x + 6, y + body_offset_y + 16), (x + 16, y + body_offset_y + 28)]
        else:
            # Waving/Dancing
            body_offset_y = math.sin(cycle * 2.0) * 1.5
            head_y += body_offset_y
            
            torso_coords = [(x, head_y + head_radius - 2), (x, y + body_offset_y + 18)]
            left_arm_coords = [(x, y + body_offset_y + 4), (x - 22, y + body_offset_y + int(math.sin(cycle * 2.5) * 8))]
            right_arm_coords = [(x, y + body_offset_y + 4), (x + 22, y + body_offset_y - 10 + int(math.sin(cycle * 3) * 8))]
            left_leg_coords = [(x - 6, y + body_offset_y + 16), (x - 12 + int(math.sin(cycle) * 4), y + body_offset_y + 32)]
            right_leg_coords = [(x + 6, y + body_offset_y + 16), (x + 12 - int(math.sin(cycle) * 4), y + body_offset_y + 32)]
            
    else:
        # Gray normal state
        if action_name == "think":
            body_offset_y = math.sin(cycle * 0.6) * 1.2
            head_y += 8 + body_offset_y
            
            torso_coords = [(x, head_y + head_radius - 2), (x, y + 16)]
            left_arm_coords = [(x, y + 6), (x - 18, y + 12 + int(math.sin(cycle) * 3))]
            right_arm_coords = [(x, y + 6), (x + 18, y + 6 - int(math.sin(cycle) * 3))]
            left_leg_coords = [(x - 6, y + 15), (x - 20, y + 20)]
            right_leg_coords = [(x + 6, y + 15), (x + 20, y + 20)]
        elif action_name == "drag":
            # Dragging pose: hands up, legs hanging
            torso_coords = [(x, head_y + head_radius - 2), (x, y + 25)]
            left_arm_coords = [(x, y + 4), (x - 24, y - 10)]
            right_arm_coords = [(x, y + 4), (x + 24, y - 10)]
            left_leg_coords = [(x - 5, y + 20), (x - 12, y + 36)]
            right_leg_coords = [(x + 5, y + 20), (x + 8, y + 36)]
        else:
            # Walking state
            body_offset_y = math.sin(cycle * 2.0) * 1.5
            head_y += body_offset_y
            
            torso_coords = [(x, head_y + head_radius - 2), (x, y + body_offset_y + 18)]
            left_arm_coords = [(x, y + body_offset_y + 4), (x - 20, y + body_offset_y + 14 + int(math.sin(cycle) * 3))]
            right_arm_coords = [(x, y + body_offset_y + 4), (x + 20, y + body_offset_y + 14 - int(math.sin(cycle) * 3))]
            
            walk_phase = math.sin(cycle)
            if walk_phase > 0:
                left_leg_coords = [(x - 5, y + body_offset_y + 17), (x - 10, y + body_offset_y + 32)]
                right_leg_coords = [(x + 5, y + body_offset_y + 17), (x + 16, y + body_offset_y + 24), (x + 12, y + 33)]
            else:
                left_leg_coords = [(x - 5, y + body_offset_y + 17), (x - 16, y + body_offset_y + 24), (x - 12, y + 33)]
                right_leg_coords = [(x + 5, y + body_offset_y + 17), (x + 10, y + body_offset_y + 32)]

    # Draw solid head core (slightly smaller)
    draw.ellipse([head_x - head_radius * 0.82, head_y - head_radius * 0.82,
                  head_x + head_radius * 0.82, head_y + head_radius * 0.82], fill=head_color)
                  
    # Scatter loop for chalk particles on the head boundary
    for _ in range(180):
        angle = random.uniform(0, math.pi * 2)
        dist = head_radius * (0.8 + random.uniform(0, 0.26))
        dot_x = head_x + math.cos(angle) * dist
        dot_y = head_y + math.sin(angle) * dist
        dot_r = random.uniform(0.5, 1.8)
        
        jx = j(dot_x, 0.4)
        jy = j(dot_y, 0.4)
        draw.ellipse([jx - dot_r, jy - dot_r, jx + dot_r, jy + dot_r], fill=head_color)
        
    # Layered interior cross-hatch scribbles for head texture
    for _ in range(8):
        offset_angle = random.uniform(0, math.pi * 2)
        start_dist = random.uniform(0, head_radius * 0.7)
        end_dist = random.uniform(0, head_radius * 0.7)
        start_x = j(head_x + math.cos(offset_angle) * start_dist)
        start_y = j(head_y + math.sin(offset_angle) * start_dist)
        end_x = j(head_x - math.cos(offset_angle) * end_dist)
        end_y = j(head_y - math.sin(offset_angle) * end_dist)
        draw.line([start_x, start_y, end_x, end_y], fill=head_color, width=2)
        
    # Option B: Blushing cheeks & sprout leaves
    is_option_b = (pet_style == "B")
    if is_option_b and state_name != "black":
        # Draw cheeks (soft pink)
        draw.ellipse([j(head_x - 15), j(head_y + 1), j(head_x - 7), j(head_y + 5)], fill=(244, 63, 94, 70))
        draw.ellipse([j(head_x + 7), j(head_y + 1), j(head_x + 15), j(head_y + 5)], fill=(244, 63, 94, 70))
        
    if state_name == "white" or (is_option_b and state_name == "gray"):
        sprout_x = head_x
        sprout_y = head_y - head_radius
        # Stem
        draw_crayon_stroke(draw, [(sprout_x, sprout_y), (sprout_x + int(math.sin(cycle)*3), sprout_y - 12)], 3.5, (16, 185, 129, 255))
        # Left leaf
        draw.ellipse([j(sprout_x - 6 + math.sin(cycle)*3), j(sprout_y - 14), 
                      j(sprout_x - 1 + math.sin(cycle)*3), j(sprout_y - 10)], fill=(52, 211, 153, 220))
        # Right leaf
        draw.ellipse([j(sprout_x + 1 + math.sin(cycle)*3), j(sprout_y - 14), 
                      j(sprout_x + 6 + math.sin(cycle)*3), j(sprout_y - 10)], fill=(52, 211, 153, 220))

    # Draw body strokes
    draw_crayon_stroke(draw, torso_coords, 13, body_stroke)
    draw_crayon_stroke(draw, left_arm_coords, 11, body_stroke)
    draw_crayon_stroke(draw, right_arm_coords, 11, body_stroke)
    draw_crayon_stroke(draw, left_leg_coords, 11, body_stroke)
    draw_crayon_stroke(draw, right_leg_coords, 11, body_stroke)
    
    # Render tears (black state)
    if state_name == "black":
        for tear in tears[:]:
            tear["y"] += tear["vy"]
            tear["alpha"] -= 0.025
            if tear["alpha"] <= 0:
                if tear in tears:
                    tears.remove(tear)
            else:
                alpha_val = int(255 * tear["alpha"])
                draw.ellipse([tear["x"] - 2, tear["y"] - 2, tear["x"] + 2, tear["y"] + 2], fill=(96, 165, 250, alpha_val))

    # Apply organic filters: Gaussian Blur & Contrast Enhancement
    img = img.filter(ImageFilter.GaussianBlur(1.4))
    contrast_enhancer = ImageEnhance.Contrast(img)
    img = contrast_enhancer.enhance(1.2)
    
    return img

class DesktopPetApp(QWidget):
    def __init__(self):
        super().__init__()
        
        # Borderless, stays on top, translucent
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_MacAlwaysShowToolWindow)
        
        # Display label
        self.label = QLabel(self)
        self.label.setGeometry(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
        
        # Position bottom-right of screen
        screen = QApplication.primaryScreen().geometry()
        screen_w, screen_h = screen.width(), screen.height()
        start_x = screen_w - WINDOW_WIDTH - 80
        start_y = screen_h - WINDOW_HEIGHT - 120
        self.setGeometry(start_x, start_y, WINDOW_WIDTH, WINDOW_HEIGHT)
        
        # Animation loop (50ms = 20fps)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_animation)
        self.timer.start(50)
        
        # Start activity tracking background thread
        self.start_system_monitor()

    # Drag support
    def mousePressEvent(self, event: QMouseEvent):
        global current_action
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            current_action = "drag"
            event.accept()

    def mouseMoveEvent(self, event: QMouseEvent):
        if event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()

    def mouseReleaseEvent(self, event: QMouseEvent):
        global current_action
        if current_state == "black":
            current_action = "cry"
        else:
            current_action = "walk"
        event.accept()

    def mouseDoubleClickEvent(self, event: QMouseEvent):
        global pet_style
        pet_style = "B" if pet_style == "A" else "A"
        event.accept()

    def update_animation(self):
        global current_action, dx
        
        # Auto patrol walking logic
        if current_action == "walk":
            current_x = self.x()
            new_x = current_x + dx
            screen = QApplication.primaryScreen().geometry()
            
            if new_x < 0:
                dx = abs(dx)
            elif new_x > screen.width() - WINDOW_WIDTH:
                dx = -abs(dx)
                
            self.move(new_x, self.y())
            
            if random.random() < 0.008:
                current_action = "idle"
        elif current_action == "idle":
            if random.random() < 0.02:
                current_action = "walk"
                
        # Draw frame
        img = render_avatar_frame()
        
        # Convert PIL RGBA image to PyQt QPixmap
        # Must retain a reference to the raw bytes on the widget instance to prevent premature GC deallocation
        self.current_rgba_data = img.tobytes("raw", "RGBA")
        qimg = QImage(self.current_rgba_data, img.width, img.height, QImage.Format.Format_RGBA8888)
        pixmap = QPixmap.fromImage(qimg)
        
        self.label.setPixmap(pixmap)

    def start_system_monitor(self):
        t = threading.Thread(target=self.monitor_activity_loop, daemon=True)
        t.start()

    def monitor_activity_loop(self):
        global current_state, current_action
        
        distraction_keywords = [
            "bilibili", "wechat", "微信", "youtube", "douyin", "抖音", 
            "weibo", "微博", "v2ex", "xiaohongshu", "小红书", 
            "twitter", "x.com", "facebook", "instagram", "netflix"
        ]
        productive_keywords = [
            "visual studio code", "vscode", "cursor", "obsidian", 
            "terminal", "iterm", "xcode", "antigravity", "python", "github"
        ]
        
        while True:
            try:
                # 0. Check H5 override state from the local server
                import urllib.request
                try:
                    req = urllib.request.Request("http://127.0.0.1:5678/api/pet-state")
                    with urllib.request.urlopen(req, timeout=1.0) as response:
                        res_data = json.loads(response.read().decode())
                        h5_state = res_data.get("state")
                        h5_action = res_data.get("action")
                        if h5_state:
                            current_state = h5_state
                            if h5_action and current_action != "drag":
                                current_action = h5_action
                            time.sleep(2.0)
                            continue
                except Exception:
                    pass

                # 1. Get active application name via AppleScript
                cmd = "osascript -e 'tell application \"System Events\" to get name of first process whose frontmost is true'"
                app_name = subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
                
                # 2. If browser, get active tab title
                tab_title = ""
                if app_name in ["Google Chrome", "Google Chrome Canary"]:
                    browser_cmd = "osascript -e 'tell application \"Google Chrome\" to get title of active tab of first window'"
                    tab_title = subprocess.check_output(browser_cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
                elif app_name == "Safari":
                    browser_cmd = "osascript -e 'tell application \"Safari\" to get name of current tab of first window'"
                    tab_title = subprocess.check_output(browser_cmd, shell=True, stderr=subprocess.DEVNULL).decode().strip()
                
                activity_text = f"{app_name} {tab_title}".lower()
                
                is_distracted = any(kw in activity_text for kw in distraction_keywords)
                is_productive = any(pw in activity_text for pw in productive_keywords)
                
                if is_distracted:
                    current_state = "black"
                    if current_action not in ["drag"]:
                        current_action = "cry"
                elif is_productive:
                    current_state = "white"
                    if current_action not in ["drag", "jump", "walk"]:
                        current_action = random.choice(["jump", "walk"])
                else:
                    current_state = "gray"
                    if current_action not in ["drag", "walk", "think", "idle"]:
                        current_action = "walk"
            except Exception:
                pass
            time.sleep(2.0)

def main():
    app = QApplication(sys.argv)
    pet = DesktopPetApp()
    pet.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
