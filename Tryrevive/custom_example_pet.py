#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Tryrevive Custom Desk Pet Example
To write your own desktop pet, create a Python script in this directory
with a filename ending in "_pet.py" (e.g., "kitty_pet.py" or "zen_pet.py").
The Tryrevive local bridge server will automatically discover it and list it in the settings UI.
"""

import sys
import time

def main():
    print("Custom Example Pet running in background...")
    # Keep running to simulate a pet loop
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Custom Example Pet stopped.")

if __name__ == '__main__':
    main()
