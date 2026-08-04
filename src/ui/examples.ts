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

export const testExample = `# TBD
`

export const basicExample = `# Basic Example - Drive Forward
# This example shows the fundamental setup/loop pattern

def setup():
    """Initialize robot and start driving"""
    # Always initialize enes100 first
    enes100.begin("Simulator", FIRE, 3)
    
    # Then initialize tank
    tank.begin()
    
    # Print startup message
    enes100.println("🚀 Starting simulator...")
    enes100.println("Robot will drive forward")
    
    # Set motors to full speed forward
    tank.set_left_motor_pwm(255)
    tank.set_right_motor_pwm(255)

def loop():
    """Print position repeatedly"""
    # Get current position
    x = enes100.get_x()
    y = enes100.get_y()
    theta = enes100.get_theta()
    
    # Print formatted position
    enes100.print("Position: X=")
    enes100.print(x)
    enes100.print(" Y=")
    enes100.print(y)
    enes100.print(" θ=")
    enes100.println(theta)
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
    enes100.begin("Team", CRASH_SITE, 1)
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
    
    enes100.println("✅ All missions tested!")

def loop():
    time(1)
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
