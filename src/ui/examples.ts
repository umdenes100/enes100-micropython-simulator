export const basicExample = `# Basic example - drive forward and print position

def setup():
    # Initialize Enes100 and Tank
    enes100.begin("Simulator", FIRE, 3)
    tank.begin()
    
    # Start driving
    enes100.println("Starting driving")
    tank.set_left_motor_pwm(255)
    tank.set_right_motor_pwm(255)

def loop():
    # Print position repeatedly
    enes100.print("X = ")
    enes100.print(enes100.get_x())
    enes100.print(", Y = ")
    enes100.print(enes100.get_y())
    enes100.print(", Theta = ")
    enes100.println(enes100.get_theta())`

export const testExample = `# Test all functions

def setup():
    enes100.begin("Simulator", FIRE, 3)
    tank.begin()
    
    # Test printing
    enes100.println("=== Testing Enes100 ===")
    enes100.println(257)
    enes100.println(True)
    enes100.println("Hello, World!")
    
    # Test position
    enes100.print("X: ")
    enes100.println(enes100.get_x())
    enes100.print("Y: ")
    enes100.println(enes100.get_y())
    
    # Test mission
    enes100.mission(NUM_CANDLES, 5)
    
    # Test tank
    enes100.println("=== Testing Tank ===")
    tank.set_left_motor_pwm(100)
    tank.set_right_motor_pwm(100)

def loop():
    # Print position each loop iteration
    enes100.print("Position: ")
    enes100.print(enes100.get_x())
    enes100.print(", ")
    enes100.println(enes100.get_y())`

export const turnExample = `# Turn in a circle

def setup():
    enes100.begin("Turn Test", FIRE, 1)
    tank.begin()
    enes100.println("Starting to turn...")
    tank.set_left_motor_pwm(150)
    tank.set_right_motor_pwm(-150)

def loop():
    theta = enes100.get_theta()
    enes100.print("Angle: ")
    enes100.println(theta)`

export const stopExample = `# Stop the robot after checking position

def setup():
    enes100.begin("Stop Test", FIRE, 1)
    tank.begin()
    tank.set_left_motor_pwm(200)
    tank.set_right_motor_pwm(200)
    enes100.println("Moving forward...")

def loop():
    x = enes100.get_x()
    enes100.print("X position: ")
    enes100.println(x)
    
    # Stop when we reach x > 2.0
    if x > 2.0:
        tank.turn_off_motors()
        enes100.println("Reached target! Stopping.")
        enes100.println("Click STOP button to end program")`