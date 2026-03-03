import { robot } from "../../state";
import type { Robot } from "../Types";
import { clamp } from "../utils";
import { distanceSensor } from "../simulator";

let $robot: Robot;
robot.subscribe(value => $robot = value);

let begun = false;
const lastSet = { left: 0, right: 0 };

function calculateRobot() {
    robot.set({
        ...$robot,
        v: (lastSet.left + lastSet.right) / 4,
        w: (lastSet.right - lastSet.left)
    });
}

let straightTimeout: number | undefined;

// Export functions that Python will call
export const TankAPI = {
    begin: () => {
        begun = true;
    },

    turnOffMotors: () => {
        if (!begun) throw new Error('You must call tank.begin() before calling tank.turn_off_motors()');
        robot.set({ ...$robot, v: 0, w: 0 });
        lastSet.left = 0;
        lastSet.right = 0;
    },

    setLeftMotorPWM: (pwm: number) => {
        if (!begun) throw new Error('You must call tank.begin() before calling tank.set_left_motor_pwm()');
        if (pwm !== clamp(pwm, -255, 255)) {
            throw new Error(`PWM must be -255 to 255, got ${pwm}`);
        }
        lastSet.left = pwm / 255;
        clearTimeout(straightTimeout);
        straightTimeout = setTimeout(calculateRobot, 110);
    },

    setRightMotorPWM: (pwm: number) => {
        if (!begun) throw new Error('You must call tank.begin() before calling tank.set_right_motor_pwm()');
        if (pwm !== clamp(pwm, -255, 255)) {
            throw new Error(`PWM must be -255 to 255, got ${pwm}`);
        }
        lastSet.right = pwm / 255;
        clearTimeout(straightTimeout);
        if (lastSet.left === 0) {
            straightTimeout = setTimeout(calculateRobot, 110);
        } else {
            calculateRobot();
        }
    },

    readDistanceSensor: (sensorId: number) => {
        if (!begun) throw new Error('You must call tank.begin() before calling tank.read_distance_sensor()');
        if (sensorId !== clamp(sensorId, 1, 7)) {
            throw new Error(`sensorId must be 1-7, got ${sensorId}`);
        }
        return distanceSensor(0, 1);
    },

    readBumpSensor: (sensorId: number) => {
        if (!begun) throw new Error('You must call tank.begin() before calling tank.read_bump_sensor()');
        if (sensorId !== clamp(sensorId, 1, 7)) {
            throw new Error(`sensorId must be 1-7, got ${sensorId}`);
        }
        const val = distanceSensor(0, 0.1);
        return val !== -1 && val < 0.05;
    },

    setMotorPWM: () => {
        throw new Error('set_motor_pwm is not supported in the simulator!');
    },

    readIrSensor: () => {
        throw new Error('read_ir_sensor is not supported in the simulator!');
    }
};

export function resetTank() {
    begun = false;
    lastSet.left = 0;
    lastSet.right = 0;
    clearTimeout(straightTimeout);
}