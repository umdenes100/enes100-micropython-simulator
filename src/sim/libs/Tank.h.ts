import type {CRuntime} from "../JSCPPTypes";
import {robot} from "../../state";
import type {Robot} from "../Types";
import {clamp} from "../utils";
import {distanceSensor} from "../simulator";

let $robot: Robot;
robot.subscribe(value => $robot = value);


let begun = false;
//  void begin();  // required on startup for setting pinModes
function begin(rt: CRuntime, _this: any) {
    begun = true;
}
//   // Functions available on both simulator and physical tanks
//   void turnOffMotors();  // sets all motor speeds to 0
const lastSet = {left: 0, right: 0}
function turnOffMotors(rt: CRuntime, _this: any) {
    if (!begun) throw new Error('You must call Tank.begin() before calling Tank.turnOffMotors()')
    robot.set({...$robot, v: 0, w: 0})
    lastSet.left = 0
    lastSet.right = 0
}

function calculateRobot() {
    robot.set({...$robot, v: (lastSet.left + lastSet.right) / 4, w: (lastSet.right - lastSet.left)})
}

let straightTimeout: number | undefined;
//   void setLeftMotorPWM(int pwm);   // sets motors 1 and 2 speeds to specified pwm (pwm: -255 to 255)
function setLeftMotorPWM(rt: CRuntime, _this: any, pwm: any) {
    if (!begun) throw new Error('You must call Tank.begin() before calling Tank.setLeftMotorPWM()')
    if (pwm.v !== clamp(pwm.v, -255, 255)) throw new Error(`In function Tank.setLeftMotorPWM(), PWM values must be between -255 and 255. You used ${pwm.v}.`)
    lastSet.left = pwm.v / 255
    clearTimeout(straightTimeout);
    // in the case where lastSet.right is 0, delay the start of the robot to allow the other wheel to be set.
    // if (lastSet.right === 0) {
    straightTimeout = setTimeout(calculateRobot, 110)
    // } else
    //     calculateRobot()
}
//   void setRightMotorPWM(int pwm);  // sets motors 3 and 4 speeds to specified pwm (pwm: -255 to 255)
function setRightMotorPWM(rt: CRuntime, _this: any, pwm: any) {
    if (!begun) throw new Error('You must call Tank.begin() before calling Tank.setRightMotorPWM()')
    if (pwm.v !== clamp(pwm.v, -255, 255)) throw new Error(`In function Tank.setRightMotorPWM(), PWM values must be between -255 and 255. You used ${pwm.v}.`)
    lastSet.right = pwm.v / 255
    clearTimeout(straightTimeout);
    // in the case where lastSet.right is 0, delay the start of the robot to allow the other wheel to be set.
    if (lastSet.left === 0) {
        straightTimeout = setTimeout(calculateRobot, 110)
    } else
        calculateRobot()
}
//   float readDistanceSensor(int sensorId);  // reads and returns distance in meters (maximum of 1) from specified ultrasonic distance sensor (only valid for sensorIds 1 or 7)
function readDistanceSensor(rt: CRuntime, _this: any, sensorId: any) {
    if (!begun) throw new Error('You must call Tank.begin() before calling Tank.readDistanceSensor()')
    let sensorID: number = sensorId.v
    if (sensorID !== clamp(sensorID, 1, 7)) {
        throw new Error(`In function readDistanceSensor, you set sensorId to ${sensorID}. Valid values are 1-7`)
    }
    const val = distanceSensor(0, 1)
    return rt.val(rt.floatTypeLiteral, val, false)
}

//   int readBumpSensor(int sensorId);  // reads and returns the state of the specified infrared sensor (only valid for sensorIds 1 or 7)
function readBumpSensor(rt: CRuntime, _this: any, sensorId: any) {
    if (!begun) throw new Error('You must call Tank.begin() before calling Tank.readBumpSensor()')
    let sensorID: number = sensorId.v
    if (sensorID !== clamp(sensorID, 1, 7)) {
        throw new Error(`In function readBumpSensor, you set sensorId to ${sensorID}. Valid values are 1-7`)
    }
    const val = distanceSensor(0, 0.1)  // if -1, then false, else true
    return rt.val(rt.boolTypeLiteral, val !== -1 && val < 0.05, false)
}

//   // Functions only available on physical tanks
//   void setMotorPWM(int motorId, int pwm);  // sets the speed of the specifed motor to the specified pwm (only valid for motorIds 1 through 4) (pwm: -255 to 255)
function setMotorPWM(rt: CRuntime, _this: any, motorId: any, pwm: any) {
    throw new Error('setMotorPWM is not supported in the simulator!')
}
//   int readIrSensor(int sensorId);  // reads and returns the state of the specified infrared sensor (only valid for sensorIds 1 through 4)
function readIrSensor(rt: CRuntime, _this: any, sensorId: any) {
    throw new Error('readIrSensor is not supported in the simulator!')
}

export const TankH = {
    // @ts-ignore
    load(rt: CRuntime) {
        begun = false;
        lastSet.left = 0
        lastSet.right = 0
        // @ts-ignore
        const typeTankClient = rt.newClass("TankClient", []);
        const typeSig = rt.getTypeSignature(typeTankClient);
        rt.types[typeSig].father = "object";

        // Make sure to update completers in completers.ts!!!
        rt.regFunc(begin, typeTankClient, "begin", [], rt.voidTypeLiteral);
        rt.regFunc(turnOffMotors, typeTankClient, "turnOffMotors", [], rt.voidTypeLiteral);
        rt.regFunc(setLeftMotorPWM, typeTankClient, "setLeftMotorPWM", [rt.intTypeLiteral], rt.voidTypeLiteral);
        rt.regFunc(setRightMotorPWM, typeTankClient, "setRightMotorPWM", [rt.intTypeLiteral], rt.voidTypeLiteral);
        rt.regFunc(readDistanceSensor, typeTankClient, "readDistanceSensor", [rt.intTypeLiteral], rt.floatTypeLiteral);
        rt.regFunc(setMotorPWM, typeTankClient, "setMotorPWM", [rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);
        rt.regFunc(readIrSensor, typeTankClient, "readIrSensor", [rt.intTypeLiteral], rt.intTypeLiteral);
        rt.regFunc(readBumpSensor, typeTankClient, "readBumpSensor", [rt.intTypeLiteral], rt.boolTypeLiteral);

        // Make an instance of the class called enes100
        rt.defVar("Tank", typeTankClient, rt.defaultValue(typeTankClient, false));
    }
}