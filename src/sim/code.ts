import { clearOutputWhenRun, delay, output, resetRobot, resetRobotWhenRun } from "../state";
import { get, type Writable, writable } from "svelte/store";
import { generateID } from "./utils";
import { stopRobot } from "./simulator";
import { TankAPI, resetTank } from "./python-modules/tank";
import { ArduinoAPI, resetArduino } from "./python-modules/arduino";
import { Enes100API, Enes100Constants, resetEnes100 } from "./python-modules/enes100";
import { loadMicroPython, runPythonCode } from "./micropython-loader";

let micropython: any = null;
let isInitialized = false;

// Initialize MicroPython on module load
export async function initMicroPython() {
    if (isInitialized) return;
    
    try {
        console.log('Loading MicroPython...');
        micropython = await loadMicroPython();
        
        // Expose APIs to Python via global window object
        (window as any).TankAPI = TankAPI;
        (window as any).ArduinoAPI = ArduinoAPI;
        (window as any).Enes100API = Enes100API;
        (window as any).Enes100Constants = Enes100Constants;
        
        isInitialized = true;
        console.log('MicroPython initialized successfully!');
    } catch (err) {
        console.error('Failed to initialize MicroPython:', err);
        output.update(o => o + '\n❌ Failed to load MicroPython: ' + err + '\n');
        throw err;
    }
}

type Session = {
    stop: () => void;
    running: boolean;
    id: string;
}

export const session: Writable<Session | undefined> = writable(undefined);

let loopInterval: number | undefined;

export async function startCode(code: string, interval: number = 100) {
    if (!isInitialized || !micropython) {
        output.update(o => o + '\n❌ MicroPython not initialized. Please refresh the page.\n');
        return;
    }
    
    if (get(clearOutputWhenRun)) output.set('');
    if (get(resetRobotWhenRun)) {
        resetRobot();
        stopRobot();
        resetTank();
        resetArduino();
        resetEnes100();
    }
    
    const sessionId = generateID();
    session.set({
        stop: stopCodeExecution,
        running: true,
        id: sessionId
    });
    
    try {
        // First, set up the Python environment with wrapper code
        const wrapperCode = `
import js

# Get constants from Enes100
constants = js.Enes100Constants

# Expose all Enes100 constants globally
CRASH_SITE = constants.CRASH_SITE
DATA = constants.DATA
MATERIAL = constants.MATERIAL
FIRE = constants.FIRE
WATER = constants.WATER
SEED = constants.SEED
DIRECTION = constants.DIRECTION
LENGTH = constants.LENGTH
HEIGHT = constants.HEIGHT
NORMAL_X = constants.NORMAL_X
NORMAL_Y = constants.NORMAL_Y
CYCLE = constants.CYCLE
MAGNETISM = constants.MAGNETISM
MAGNETIC = constants.MAGNETIC
NOT_MAGNETIC = constants.NOT_MAGNETIC
WEIGHT = constants.WEIGHT
MATERIAL_TYPE = constants.MATERIAL_TYPE
FOAM = constants.FOAM
PLASTIC = constants.PLASTIC
HEAVY = constants.HEAVY
MEDIUM = constants.MEDIUM
LIGHT = constants.LIGHT
NUM_CANDLES = constants.NUM_CANDLES
TOPOGRAPHY = constants.TOPOGRAPHY
TOP_A = constants.TOP_A
TOP_B = constants.TOP_B
TOP_C = constants.TOP_C
DEPTH = constants.DEPTH
WATER_TYPE = constants.WATER_TYPE
FRESH_UNPOLLUTED = constants.FRESH_UNPOLLUTED
FRESH_POLLUTED = constants.FRESH_POLLUTED
LOCATION = constants.LOCATION
PERCENTAGE = constants.PERCENTAGE

# Create Python wrapper for Tank
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

tank = Tank()

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

enes100 = Enes100()

def coordinate(x, y):
    return js.Enes100API.coordinate(x, y)

_original_print = print
def print(*args, **kwargs):
    message = ' '.join(str(arg) for arg in args)
    enes100.println(message)

# User's code goes here
${code}
`;
        
        console.log('Running setup()...');
        
        // Run the wrapper + user code to define setup() and loop()
        await runPythonCode(micropython, wrapperCode);
        
        // Now call setup() once
        try {
            await runPythonCode(micropython, 'setup()');
            console.log('setup() completed');
        } catch (err: any) {
            if (err.message.includes("name 'setup' is not defined")) {
                output.update(o => o + '\n❌ Error: Your code must define a setup() function\n');
                throw new Error('setup() function not found');
            }
            throw err;
        }
        
        // Now call loop() repeatedly
        console.log('Starting loop()...');
        loopInterval = setInterval(async () => {
            try {
                if (!get(session)) {
                    clearInterval(loopInterval);
                    return;
                }
                await runPythonCode(micropython, 'loop()');
            } catch (err: any) {
                console.error('Error in loop():', err);
                if (err.message.includes("name 'loop' is not defined")) {
                    output.update(o => o + '\n❌ Error: Your code must define a loop() function\n');
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

function stopCodeExecution() {
    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = undefined;
    }
    session.set(undefined);
}

export function stopCode() {
    stopCodeExecution();
}

// Compatibility exports
export const ignored_variables = new Set<string>();
export function addIgnoredVariable(v: string) {
    ignored_variables.add(v);
}