/**
 * Example Python Programs
 * 
 * These examples demonstrate proper usage of the ENES100 Python API.
 * All examples use the setup/loop model:
 * - setup() runs once when code starts
 * - loop() runs repeatedly (controlled by speed buttons)
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

export const testExample = `# Test Example - Complete example with every single Enes100 function.

def setup():
    enes100.begin("Simulator", DATA, 3, 1116, 8, 9)
    enes100.println(257)
    enes100.println(True)
    enes100.println("Hello, World!")
    enes100.println(1.0)
    x = enes100.get_x()
    enes100.println(x)
    enes100.println(enes100.get_y())
    enes100.println(enes100.get_theta())
    enes100.println(enes100.is_visible())
    enes100.println(enes100.is_connected())

    # A little test script that should put the simulator through its paces.
    enes100.begin("Simulator", CRASH_SITE, 3, 1116, 8, 9)
    enes100.mission(LENGTH, 1000)
    enes100.mission(HEIGHT, 1000)
    enes100.mission(DIRECTION, NORMAL_X)
    enes100.mission(DIRECTION, NORMAL_Y)

    enes100.begin("Simulator", DATA, 3, 1116, 8, 9)
    enes100.mission(CYCLE, 10)
    enes100.mission(MAGNETISM, MAGNETIC)
    enes100.mission(MAGNETISM, NOT_MAGNETIC)

    enes100.begin("Simulator", MATERIAL, 3, 1116, 8, 9)
    enes100.mission(WEIGHT, HEAVY)
    enes100.mission(WEIGHT, MEDIUM)
    enes100.mission(WEIGHT, LIGHT)
    enes100.mission(MATERIAL_TYPE, FOAM)
    enes100.mission(MATERIAL_TYPE, PLASTIC)

    enes100.begin("Simulator", FIRE, 3, 1116, 8, 9)
    enes100.mission(NUM_CANDLES, 3)
    enes100.mission(TOPOGRAPHY, TOP_A)
    enes100.mission(TOPOGRAPHY, TOP_B)
    enes100.mission(TOPOGRAPHY, TOP_C)

    enes100.begin("Simulator", WATER, 3, 1116, 8, 9)
    enes100.mission(DEPTH, 1000)
    enes100.mission(WATER_TYPE, FRESH_UNPOLLUTED)
    enes100.mission(WATER_TYPE, FRESH_POLLUTED)

    enes100.begin("Simulator", SEED, 3, 1116, 8, 9)
    enes100.mission(PERCENTAGE, 100)
    # In the simulator, coordinate only works in this way. You cannot declare coordinate objects.
    enes100.mission(LOCATION, coordinate(100, 100))
    enes100.mission(LOCATION, coordinate(200, 200))

    enes100.begin("Simulator", HYDROGEN, 3, 1116, 8, 9)
    enes100.mission(LED_COLOR, WHITE)
    enes100.mission(LED_COLOR, RED)
    enes100.mission(LED_COLOR, YELLOW)
    enes100.mission(LED_COLOR, GREEN)
    enes100.mission(LED_COLOR, BLUE)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_1)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_2)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_3)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_4)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_5)

    tank.begin()
    tank.set_left_motor_pwm(100)
    tank.set_right_motor_pwm(100)

    time.sleep(1)
    tank.turn_off_motors()

def loop():
    time.sleep(1)
    enes100.println("Hello, World! (from loop)")
`

export const basicExample = `# Basic Example

def setup():
    enes100.begin("Simulator", FIRE, 3, 1116, 8, 9)
    tank.begin()
    
    enes100.println("Starting driving")
    tank.set_left_motor_pwm(255)
    tank.set_right_motor_pwm(255)

def loop():
    time.sleep(1)
    enes100.print("X = ")
    enes100.println(enes100.get_x())
    enes100.print("Y = ")
    enes100.println(enes100.get_y())
    enes100.print("Theta = ")
    enes100.println(enes100.get_theta())
`

export const turnExample = `# Turn Example - Spin in Place
# Demonstrates differential drive by setting motors to opposite speeds

def setup():
    """Initialize and start turning"""
    enes100.begin("Turn Test", FIRE, 1)
    tank.begin()
    
    enes100.println("🔄 Starting turn...")
    
    # Left motor forward, right motor backward = turn right
    tank.set_left_motor_pwm(150)
    tank.set_right_motor_pwm(-150)

def loop():
    """Print angle while turning"""
    theta = enes100.get_theta()
    enes100.print("Angle: ")
    enes100.println(theta)
`

export const sensorExample = `# Sensor Example - Obstacle Avoidance
# Uses distance sensor to detect and avoid obstacles

def setup():
    """Initialize robot"""
    enes100.begin("Sensor Test", DATA, 2)
    tank.begin()
    enes100.println("🔍 Starting sensor test...")
    
    # Start driving forward
    tank.set_left_motor_pwm(200)
    tank.set_right_motor_pwm(200)

def loop():
    """Read sensor and react to obstacles"""
    # Read distance sensor (returns -1 if nothing detected)
    distance = tank.read_distance_sensor(1)
    
    if distance < 0:
        # No obstacle - drive forward
        enes100.println("✓ Path clear")
        tank.set_left_motor_pwm(200)
        tank.set_right_motor_pwm(200)
    elif distance < 0.3:
        # Obstacle close - turn right
        enes100.println("⚠️ Obstacle detected! Turning...")
        tank.set_left_motor_pwm(150)
        tank.set_right_motor_pwm(-150)
    else:
        # Obstacle ahead - slow down
        enes100.println("⚡ Slowing down...")
        tank.set_left_motor_pwm(100)
        tank.set_right_motor_pwm(100)
`

export const missionExample = `# Mission Example - Test All Mission Types
# Demonstrates mission transmission for all 6 mission types

import time

def setup():
    """Test all mission types"""
    enes100.begin("Team", CRASH_SITE, 1)
    enes100.println("📡 Testing all missions...")
    enes100.println("")
    
    # Test CRASH_SITE mission
    enes100.println("=== CRASH_SITE Mission ===")
    enes100.mission(DIRECTION, NORMAL_X)
    enes100.mission(LENGTH, 1000)
    enes100.mission(HEIGHT, 500)
    enes100.println("")
    
    # Test DATA mission
    enes100.println("=== DATA Mission ===")
    enes100.begin("Team", DATA, 1)
    enes100.mission(CYCLE, 75)
    enes100.mission(MAGNETISM, MAGNETIC)
    enes100.println("")
    
    # Test MATERIAL mission
    enes100.println("=== MATERIAL Mission ===")
    enes100.begin("Team", MATERIAL, 1)
    enes100.mission(WEIGHT, MEDIUM)
    enes100.mission(MATERIAL_TYPE, PLASTIC)
    enes100.println("")
    
    # Test FIRE mission
    enes100.println("=== FIRE Mission ===")
    enes100.begin("Team", FIRE, 1)
    enes100.mission(NUM_CANDLES, 3)
    enes100.mission(TOPOGRAPHY, TOP_B)
    enes100.println("")
    
    # Test WATER mission
    enes100.println("=== WATER Mission ===")
    enes100.begin("Team", WATER, 1)
    enes100.mission(DEPTH, 850)
    enes100.mission(WATER_TYPE, FRESH_POLLUTED)
    enes100.println("")
    
    # Test SEED mission
    enes100.println("=== SEED Mission ===")
    enes100.begin("Team", SEED, 1)
    enes100.mission(PERCENTAGE, 42)
    enes100.mission(LOCATION, coordinate(150, 200))
    enes100.println("")

    # Test HYDROGEN mission
    enes100.println("=== HYDROGEN Mission ===")
    enes100.begin("Team", HYDROGEN, 1)
    enes100.mission(LED_COLOR, BLUE)
    enes100.mission(VOLTAGE_OUTPUT, VOLTAGE_3)
    enes100.println("")
    
    enes100.println("All missions tested!")

def loop():
    time.sleep(1)
`

export const stopExample = `# Stop Example - Conditional Motor Control
# Demonstrates stopping when reaching a target position

def setup():
    """Initialize and start moving"""
    enes100.begin("Stop Test", FIRE, 1)
    tank.begin()
    
    enes100.println("🎯 Target: X > 2.0 meters")
    enes100.println("Starting...")
    
    # Start driving
    tank.set_left_motor_pwm(200)
    tank.set_right_motor_pwm(200)

def loop():
    """Check position and stop when target reached"""
    x = enes100.get_x()
    
    enes100.print("Current X: ")
    enes100.println(x)
    
    # Check if we've reached target
    if x > 2.0:
        # Stop motors
        tank.turn_off_motors()
        enes100.println("🎉 Target reached! Stopped.")
        enes100.println("(Click STOP button to end)")
`