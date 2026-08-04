/**
 * ENES100 MicroPython Simulator - Main Execution Engine
 * 
 * This file handles running student Python code in the browser using MicroPython WASM.
 * It implements a setup/loop execution model similar to Arduino:
 * - setup() runs once when code starts
 * - loop() runs repeatedly at a configurable interval
 * 
 * @author ENES100 Team
 * @version 2.0 (MicroPython)
 */

import { clearOutputWhenRun, output, resetRobot, resetRobotWhenRun } from "../state";
import { get, type Writable, writable } from "svelte/store";
import { generateID } from "./utils";
import { stopRobot } from "./simulator";
import { TankAPI, resetTank } from "./python-modules/tank";
import { ArduinoAPI, resetArduino } from "./python-modules/arduino";
import { Enes100API, Enes100Constants, resetEnes100 } from "./python-modules/enes100";
import { loadMicroPython, runPythonCode } from "./micropython-loader";

// Global MicroPython instance (initialized once on page load)
let micropython: any = null;
let isInitialized = false;

/**
 * Initialize MicroPython and expose JavaScript APIs to Python
 * Called once when the application loads
 */
export async function initMicroPython() {
    if (isInitialized) return;
    
    try {
        micropython = await loadMicroPython();
        
        // Expose our JavaScript APIs to Python via global window object
        // Python can access these via: js.TankAPI.begin(), js.Enes100API.println(), etc.
        (window as any).TankAPI = TankAPI;
        (window as any).ArduinoAPI = ArduinoAPI;
        (window as any).Enes100API = Enes100API;
        (window as any).Enes100Constants = Enes100Constants;
        
        isInitialized = true;
    } catch (err) {
        console.error('Failed to initialize MicroPython:', err);
        output.update(o => o + '\n❌ Failed to load MicroPython. Please refresh the page.\n');
        throw err;
    }
}

/**
 * Session represents a running code execution
 * - stop: function to halt execution
 * - running: whether loop() is currently executing
 * - id: unique identifier for this session
 */
type Session = {
    stop: () => void;
    running: boolean;
    id: string;
}

// Svelte store tracking current execution session (undefined = no code running)
export const session: Writable<Session | undefined> = writable(undefined);

// Interval handle for loop() execution
let loopInterval: number | undefined;

/**
 * Start executing student code
 * 
 * @param code - Student's Python code (must define setup() and loop() functions)
 * @param interval - Milliseconds between loop() calls (default 100ms)
 * 
 * Execution flow:
 * 1. Reset robot state if configured
 * 2. Inject Python wrapper code (Tank, Enes100 classes, constants)
 * 3. Run student's code to define setup() and loop()
 * 4. Call setup() once
 * 5. Call loop() repeatedly every {interval} milliseconds
 */
export async function startCode(code: string, interval: number = 100) {
    // Verify MicroPython is ready
    if (!isInitialized || !micropython) {
        output.update(o => o + '\n❌ MicroPython not initialized. Please refresh the page.\n');
        return;
    }
    
    // Clear output and reset robot if settings enabled
    if (get(clearOutputWhenRun)) output.set('');
    if (get(resetRobotWhenRun)) {
        resetRobot();
        stopRobot();
        resetTank();
        resetArduino();
        resetEnes100();
    }
    
    // Create new session
    const sessionId = generateID();
    session.set({
        stop: stopCodeExecution,
        running: true,
        id: sessionId
    });
    
    try {
        // === STEP 1: Inject Python wrapper code ===
        // This code creates Tank and Enes100 classes that wrap our JavaScript APIs
        // It also exposes all constants (FIRE, WATER, etc.)
        const wrapperCode = `
import js

# === ENES100 CONSTANTS ===
# Mission types
CRASH_SITE = ${Enes100Constants.CRASH_SITE}
DATA = ${Enes100Constants.DATA}
MATERIAL = ${Enes100Constants.MATERIAL}
FIRE = ${Enes100Constants.FIRE}
WATER = ${Enes100Constants.WATER}
SEED = ${Enes100Constants.SEED}

# Crash site
DIRECTION = ${Enes100Constants.DIRECTION}
LENGTH = ${Enes100Constants.LENGTH}
HEIGHT = ${Enes100Constants.HEIGHT}
NORMAL_X = ${Enes100Constants.NORMAL_X}
NORMAL_Y = ${Enes100Constants.NORMAL_Y}

# Data
CYCLE = ${Enes100Constants.CYCLE}
MAGNETISM = ${Enes100Constants.MAGNETISM}
MAGNETIC = ${Enes100Constants.MAGNETIC}
NOT_MAGNETIC = ${Enes100Constants.NOT_MAGNETIC}

# Material
WEIGHT = ${Enes100Constants.WEIGHT}
MATERIAL_TYPE = ${Enes100Constants.MATERIAL_TYPE}
FOAM = ${Enes100Constants.FOAM}
PLASTIC = ${Enes100Constants.PLASTIC}
HEAVY = ${Enes100Constants.HEAVY}
MEDIUM = ${Enes100Constants.MEDIUM}
LIGHT = ${Enes100Constants.LIGHT}

# Fire
NUM_CANDLES = ${Enes100Constants.NUM_CANDLES}
TOPOGRAPHY = ${Enes100Constants.TOPOGRAPHY}
TOP_A = ${Enes100Constants.TOP_A}
TOP_B = ${Enes100Constants.TOP_B}
TOP_C = ${Enes100Constants.TOP_C}

# Water
DEPTH = ${Enes100Constants.DEPTH}
WATER_TYPE = ${Enes100Constants.WATER_TYPE}
FRESH_UNPOLLUTED = ${Enes100Constants.FRESH_UNPOLLUTED}
FRESH_POLLUTED = ${Enes100Constants.FRESH_POLLUTED}

# Seed
LOCATION = ${Enes100Constants.LOCATION}
PERCENTAGE = ${Enes100Constants.PERCENTAGE}

# === TANK CLASS ===
# Wrapper around JavaScript TankAPI
class Tank:
    @staticmethod
    def begin():
        return js.TankAPI.begin()
    
    @staticmethod
    def turn_off_motors():
        return js.TankAPI.turnOffMotors()
    
    @staticmethod
    def set_left_motor_pwm(pwm):
        return js.TankAPI.setLeftMotorPWM(pwm)
    
    @staticmethod
    def set_right_motor_pwm(pwm):
        return js.TankAPI.setRightMotorPWM(pwm)
    
    @staticmethod
    def read_distance_sensor(sensor_id):
        return js.TankAPI.readDistanceSensor(sensor_id)
    
    @staticmethod
    def read_bump_sensor(sensor_id):
        return js.TankAPI.readBumpSensor(sensor_id)

# Create global tank instance
tank = Tank()

# === ENES100 CLASS ===
# Wrapper around JavaScript Enes100API
class Enes100:
    @staticmethod
    def begin(team_name, team_type, marker_id, room=0, tx=0, rx=0):
        return js.Enes100API.begin(team_name, team_type, marker_id, room, tx, rx)
    
    @staticmethod
    def get_x():
        return js.Enes100API.getX()
    
    @staticmethod
    def get_y():
        return js.Enes100API.getY()
    
    @staticmethod
    def get_theta():
        return js.Enes100API.getTheta()
    
    @staticmethod
    def is_visible():
        return js.Enes100API.isVisible()
    
    @staticmethod
    def is_connected():
        return js.Enes100API.isConnected()
    
    @staticmethod
    def print(value):
        return js.Enes100API.print(str(value))
    
    @staticmethod
    def println(value):
        return js.Enes100API.println(str(value))
    
    @staticmethod
    def mission(mission_type, message):
        return js.Enes100API.mission(mission_type, message)

# Create global enes100 instance
enes100 = Enes100()

# === HELPER FUNCTIONS ===
def coordinate(x, y):
    """Convert x,y coordinates to mission coordinate format"""
    return js.Enes100API.coordinate(x, y)

# Override built-in print to use enes100.println
_original_print = print
def print(*args, **kwargs):
    message = ' '.join(str(arg) for arg in args)
    enes100.println(message)

# === USER CODE STARTS HERE ===
${code}
`;
        
        // === STEP 2: Run wrapper + user code to define setup() and loop() ===
        await runPythonCode(micropython, wrapperCode);
        
        // === STEP 3: Call setup() once ===
        try {
            await runPythonCode(micropython, 'setup()');
        } catch (err: any) {
            if (err.message.includes("name 'setup' is not defined")) {
                output.update(o => o + '\n❌ Error: Your code must define a setup() function\n\nExample:\ndef setup():\n    tank.begin()\n    enes100.begin("Team", FIRE, 1)\n');
                session.set(undefined);
                return;
            }
            throw err;
        }
        
        // === STEP 4: Call loop() repeatedly ===
        loopInterval = setInterval(async () => {
            // Check if session still active
            if (!get(session)) {
                clearInterval(loopInterval);
                return;
            }
            
            try {
                await runPythonCode(micropython, 'loop()');
            } catch (err: any) {
                console.error('Error in loop():', err);
                if (err.message.includes("name 'loop' is not defined")) {
                    output.update(o => o + '\n❌ Error: Your code must define a loop() function\n\nExample:\ndef loop():\n    enes100.println("Running...")\n');
                } else {
                    output.update(o => o + '\n❌ Error in loop(): ' + err.message + '\n');
                }
                clearInterval(loopInterval);
                session.set(undefined);
            }
        }, interval);
        
    } catch (err: any) {
        console.error('Python execution error:', err);
        const errorMsg = err.message || String(err);
        output.update(o => o + '\n❌ Error: ' + errorMsg + '\n');
        session.set(undefined);
    }
}

/**
 * Stop code execution
 * - Clears the loop() interval
 * - Resets session to undefined
 * - Allows user to edit code again
 */
function stopCodeExecution() {
    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = undefined;
    }
    session.set(undefined);
}

/**
 * Public stop function (called by UI buttons)
 */
export function stopCode() {
    stopCodeExecution();
}

// === LEGACY EXPORTS ===
// These are kept for backwards compatibility but not actively used
export const ignored_variables = new Set<string>();
export function addIgnoredVariable(v: string) {
    ignored_variables.add(v);
}
