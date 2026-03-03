export const basicExample = `import time

# Basic example - drive forward and print position

# Initialize Enes100 and Tank
enes100.begin("Simulator", FIRE, 3)
tank.begin()

# Start driving
enes100.println("Starting driving")
tank.set_left_motor_pwm(255)
tank.set_right_motor_pwm(255)

# Main loop - print position every second
while True:
    time.sleep(1)
    enes100.print("X = ")
    enes100.println(enes100.get_x())
    enes100.print("Y = ")
    enes100.println(enes100.get_y())
    enes100.print("Theta = ")
    enes100.println(enes100.get_theta())`

export const testExample = `import time

# Test example - tests all Enes100 functions

# Test basic printing
enes100.begin("Simulator", DATA, 3)
enes100.println(257)
enes100.println(True)
enes100.println("Hello, World!")
enes100.println(1.0)

# Test position functions
x = enes100.get_x()
enes100.println(x)
enes100.println(enes100.get_y())
enes100.println(enes100.get_theta())
enes100.println(enes100.is_visible())
enes100.println(enes100.is_connected())

# Test CRASH_SITE mission
enes100.begin("Simulator", CRASH_SITE, 3)
enes100.mission(LENGTH, 1000)
enes100.mission(HEIGHT, 1000)
enes100.mission(DIRECTION, NORMAL_X)
enes100.mission(DIRECTION, NORMAL_Y)

# Test DATA mission
enes100.begin("Simulator", DATA, 3)
enes100.mission(CYCLE, 10)
enes100.mission(MAGNETISM, MAGNETIC)
enes100.mission(MAGNETISM, NOT_MAGNETIC)

# Test MATERIAL mission
enes100.begin("Simulator", MATERIAL, 3)
enes100.mission(WEIGHT, HEAVY)
enes100.mission(WEIGHT, MEDIUM)
enes100.mission(WEIGHT, LIGHT)
enes100.mission(MATERIAL_TYPE, FOAM)
enes100.mission(MATERIAL_TYPE, PLASTIC)

# Test FIRE mission
enes100.begin("Simulator", FIRE, 3)
enes100.mission(NUM_CANDLES, 3)
enes100.mission(TOPOGRAPHY, TOP_A)
enes100.mission(TOPOGRAPHY, TOP_B)
enes100.mission(TOPOGRAPHY, TOP_C)

# Test WATER mission
enes100.begin("Simulator", WATER, 3)
enes100.mission(DEPTH, 1000)
enes100.mission(WATER_TYPE, FRESH_UNPOLLUTED)
enes100.mission(WATER_TYPE, FRESH_POLLUTED)

# Test SEED mission
enes100.begin("Simulator", SEED, 3)
enes100.mission(PERCENTAGE, 100)
enes100.mission(LOCATION, coordinate(100, 100))
enes100.mission(LOCATION, coordinate(200, 200))

# Test Tank functions
tank.begin()
tank.set_left_motor_pwm(100)
tank.set_right_motor_pwm(100)

time.sleep(1)
tank.turn_off_motors()

# Loop test
while True:
    time.sleep(1)
    enes100.println("Hello, World! (from loop)")`