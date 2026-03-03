import { clearOutputWhenRun, delay, output, resetRobot, resetRobotWhenRun } from "../state";
import { get, type Writable, writable } from "svelte/store";
import { generateID, sleep } from "./utils";
import { stopRobot } from "./simulator";
import { TankAPI, resetTank } from "./python-modules/tank";
import { ArduinoAPI } from "./python-modules/arduino";
import { Enes100API } from "./python-modules/enes100";
import { loadMicroPython, runPythonCode } from "./micropython-loader";

let micropython: any = null;
let isInitialized = false;

// Initialize MicroPython on module load
export async function initMicroPython() {
    if (isInitialized) return;
    
    try {
        console.log('Loading MicroPython...');
        micropython = await loadMicroPython();
        
        // Expose Tank API to Python via global window object
        (window as any).TankAPI = TankAPI;
        (window as any).ArduinoAPI = ArduinoAPI;
        (window as any).Enes100API = Enes100API;
        
        isInitialized = true;
        console.log('MicroPython initialized successfully!');
    } catch (err) {
        console.error('Failed to initialize MicroPython:', err);
        output.update(o => o + '\nFailed to load MicroPython: ' + err);
        throw err;
    }
}

type Session = {
    stop: () => void;
    running: boolean;
    id: string;
}

export const session: Writable<Session | undefined> = writable(undefined);

export async function startCode(code: string, interval: number = 100) {
    if (!isInitialized || !micropython) {
        output.update(o => o + '\nMicroPython not initialized. Please refresh the page.\n');
        return;
    }
    
    if (get(clearOutputWhenRun)) output.set('');
    if (get(resetRobotWhenRun)) {
        resetRobot();
        stopRobot();
        resetTank();
    }
    
    const sessionId = generateID();
    session.set({
        stop: () => session.set(undefined),
        running: true,
        id: sessionId
    });
    
    try {
        // Wrap user's code with Python imports and wrapper classes
        const wrappedCode = `
import js
import time

# Create Python wrapper for Tank
class Tank:
    @staticmethod
    def begin():
        js.TankAPI.begin()
    
    @staticmethod
    def turn_off_motors():
        js.TankAPI.turnOffMotors()
    
    @staticmethod
    def set_left_motor_pwm(pwm):
        js.TankAPI.setLeftMotorPWM(pwm)
    
    @staticmethod
    def set_right_motor_pwm(pwm):
        js.TankAPI.setRightMotorPWM(pwm)
    
    @staticmethod
    def read_distance_sensor(sensor_id):
        return js.TankAPI.readDistanceSensor(sensor_id)
    
    @staticmethod
    def read_bump_sensor(sensor_id):
        return js.TankAPI.readBumpSensor(sensor_id)

# Create instance
tank = Tank

# Arduino functions
def delay(ms):
    js.ArduinoAPI.delay(ms)

# Enes100 functions  
class Enes100:
    @staticmethod
    def print(value):
        js.Enes100API.print(value)
    
    @staticmethod
    def println(value):
        js.Enes100API.println(value)

enes100 = Enes100

# ===== USER CODE STARTS HERE =====
${code}
`;
        
        // Run the Python code
        const stdout = await runPythonCode(micropython, wrappedCode);
        
        // Add stdout to output if there was any
        if (stdout) {
            output.update(o => o + stdout);
        }
        
        output.update(o => o + '\nProgram finished\n');
        
    } catch (err: any) {
        console.error('Python execution error:', err);
        output.update(o => o + '\nError: ' + (err.message || String(err)) + '\n');
    } finally {
        if (get(session)?.id === sessionId) {
            session.set(undefined);
        }
    }
}

export function stopCode() {
    session.set(undefined);
}

// Compatibility exports (these are no longer used but kept to avoid breaking changes)
export const ignored_variables = new Set<string>();
export function addIgnoredVariable(v: string) {
    ignored_variables.add(v);
}