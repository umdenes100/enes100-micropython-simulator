# ENES100 MicroPython Simulator

A web-based robot simulator for ENES100 that runs Python code directly in the browser using MicroPython WebAssembly.

🔗 **Live Simulator:** https://umdenes100.github.io/enes100-simulator/

## Features

- ✅ **Python Programming** - Write robot control code in Python
- ✅ **Real-time Simulation** - See your robot move in real-time
- ✅ **Browser-Based** - No installation required
- ✅ **Vision System** - Get robot position (X, Y, θ)
- ✅ **Tank Controls** - Differential drive motors
- ✅ **Distance Sensors** - Ultrasonic distance measurement
- ✅ **Mission System** - Support for all 6 ENES100 missions
- ✅ **Examples** - Built-in example programs

## Quick Start

### Basic Example

```python
def setup():
    # Initialize systems
    enes100.begin("Team Name", FIRE, 3)
    tank.begin()
    
    # Start driving
    tank.set_left_motor_pwm(255)
    tank.set_right_motor_pwm(255)

def loop():
    # Print position
    enes100.print("X: ")
    enes100.println(enes100.get_x())
```

## API Reference

### Enes100 Functions

```python
# Initialization
enes100.begin(team_name, mission_type, marker_id)

# Position
x = enes100.get_x()        # Get X position (meters)
y = enes100.get_y()        # Get Y position (meters)
theta = enes100.get_theta() # Get angle (radians)

# Communication
enes100.print(message)     # Print without newline
enes100.println(message)   # Print with newline

# Mission
enes100.mission(type, value)

# Status
visible = enes100.is_visible()
connected = enes100.is_connected()
```

### Tank Functions

```python
# Initialization
tank.begin()

# Motors (PWM: -255 to 255)
tank.set_left_motor_pwm(speed)
tank.set_right_motor_pwm(speed)
tank.turn_off_motors()

# Sensors
distance = tank.read_distance_sensor(sensor_id)  # Returns meters or -1
pressed = tank.read_bump_sensor(sensor_id)       # Returns True/False
```

### Mission Constants

```python
# Mission Types
CRASH_SITE, DATA, MATERIAL, FIRE, WATER, SEED

# Crash Site
DIRECTION, LENGTH, HEIGHT, NORMAL_X, NORMAL_Y

# Data
CYCLE, MAGNETISM, MAGNETIC, NOT_MAGNETIC

# Material
WEIGHT, MATERIAL_TYPE, FOAM, PLASTIC, HEAVY, MEDIUM, LIGHT

# Fire
NUM_CANDLES, TOPOGRAPHY, TOP_A, TOP_B, TOP_C

# Water
DEPTH, WATER_TYPE, FRESH_UNPOLLUTED, FRESH_POLLUTED

# Seed
LOCATION, PERCENTAGE
```

## Code Structure

Your code must define two functions:

- **`setup()`** - Runs once when you click Run
- **`loop()`** - Runs repeatedly (controlled by speed buttons)

## Controls

- **▶️ Run** - Start executing code
- **⏸️ Stop** - Stop execution and return to editing
- **🐢 1x / 🐇 2x / ⚡ 3x** - Control execution speed
- **📋 Examples** - Load example programs
- **💾 Save** - Save code to browser (auto-saves every 5 seconds)

## Development

### Setup

```bash
git clone https://github.com/umdenes100/enes100-simulator.git
cd enes100-simulator
npm install
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
```

Output goes to `dist/` directory.

### Deploy

Push to `main` branch - GitHub Actions automatically deploys to GitHub Pages.

## Technical Details

- **Frontend Framework:** Svelte + TypeScript
- **Build Tool:** Vite
- **Python Runtime:** MicroPython WebAssembly
- **Physics Engine:** Custom differential drive simulation
- **Graphics:** HTML5 Canvas

## File Structure

```
enes100-simulator/
├── public/
│   └── micropython/          # MicroPython WASM files
├── src/
│   ├── sim/
│   │   ├── python-modules/   # Python API (Tank, Enes100, Arduino)
│   │   ├── code.ts           # Execution engine
│   │   ├── simulator.ts      # Physics simulation
│   │   └── render.ts         # Graphics rendering
│   ├── ui/                   # User interface components
│   └── state.ts              # Global state management
└── index.html
```

## Limitations

- **No time.sleep()** - Use the setup/loop pattern instead
- **No pin I/O** - Use Tank API instead of digitalWrite/analogWrite
- **No file system** - All code runs in memory
- **Browser-only** - Cannot interact with real hardware

## Migrating from C++

The simulator previously used C++/Arduino. Here are the key differences:

| C++ | Python |
|-----|--------|
| `void setup()` | `def setup():` |
| `void loop()` | `def loop():` |
| `Tank.begin()` | `tank.begin()` |
| `Enes100.getX()` | `enes100.get_x()` |
| `delay(1000)` | Not supported - use loop() pattern |
| `#include "Tank.h"` | Not needed - APIs built-in |

## Support

- **Documentation:** See Help button in simulator
- **Examples:** Click Examples button for sample code
- **Issues:** https://github.com/umdenes100/enes100-simulator/issues

## Contributors

- Forrest Milner - Original C++ simulator
- ENES100 Team - MicroPython migration

## License

MIT License - See LICENSE file for details

---

**University of Maryland ENES100 - Introduction to Engineering Design**
