// Renders an arena based on an arena state and a robot state.

import type {Arena, Robot} from "./Types";
import {arena, draggingRobot, robot, robotDimensions} from "../state";
import {physics} from "./simulator";

const resolution = 400; // pixels per meter (4 meters = 2000 pixels)
const arenaColor = "#40484f";

let ctx: CanvasRenderingContext2D | undefined;
let $arena: Arena, $robot: Robot, $draggingRobot: boolean;
arena.subscribe(value => $arena = value);
robot.subscribe(value => $robot = value);
draggingRobot.subscribe(value => $draggingRobot = value);

export function startRender(_ctx: CanvasRenderingContext2D) {
    ctx = _ctx;
    ctx.canvas.width = $arena.width * resolution;
    ctx.canvas.height = $arena.height * resolution;
    last = performance.now();
    render();
}

let last = 0;
let i = 0;

function render() {
    if (!ctx) return;
    const now = performance.now();
    // if (i%10 == 0) {
        physics((now - last) / 1000);
        last = now;
    // }
    i++;

    // console.log('frame2')
    ctx.canvas.width = $arena.width * resolution;
    ctx.canvas.height = $arena.height * resolution;
    ctx.fillStyle = arenaColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render the obstacles
    ctx.fillStyle = "white";
    ctx.lineWidth = .006*resolution;
    ctx.strokeStyle = "#2f2f2f";
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = -5;
    for (const obstacle of $arena.obstacles) {
        ctx.strokeRect(obstacle.left * resolution, obstacle.top * resolution, obstacle.width * resolution, obstacle.height * resolution);
        ctx.fillRect(obstacle.left * resolution, obstacle.top * resolution, obstacle.width * resolution, obstacle.height * resolution);
        if (!obstacle.collisions) {
            ctx.strokeRect((obstacle.left + obstacle.width/3)*resolution, obstacle.top*resolution, obstacle.width/3*resolution, obstacle.height*resolution);
        }
    }

    // Render the log. Rect from x=3.4, goes from y=0 to y=1. Log is .1 wide (so 3.35 to 3.45)
    ctx.fillStyle = "#B87333";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = -1;
    ctx.fillRect(3.35 * resolution, 0, .1 * resolution, resolution);
    // Limbo top and bottom
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(3.35 * resolution, resolution, .1 * resolution, .03 * resolution);
    ctx.fillRect(3.35 * resolution, 1.97 * resolution, .1 * resolution, .03 * resolution);

    // Render the robot
    ctx.fillStyle = "white";

    // Given an X and a Y, (center the points) draw a robot. Rotated by angle which is angle in radians.
    const x = $robot.x * resolution, y = $robot.y * resolution;
    const angle = $robot.angle;
    const size = 0.1; // meters

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if ($draggingRobot) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
    } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
    }
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = -5;

    //Border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(-robotDimensions.length / 2 * resolution, -robotDimensions.width / 2 * resolution, robotDimensions.length * resolution, robotDimensions.width * resolution);

    // Tracks, two rectangles of grey.
    ctx.fillStyle = "#2f2f2f";
    const center = {x: 0, y: (-.025 - robotDimensions.width / 2) * resolution, width: robotDimensions.length * 1.2 * resolution, height: .03 * resolution};
    ctx.fillRect(center.x - center.width / 2, center.y - center.height / 2, center.width, center.height);
    ctx.fillRect(center.x - center.width / 2, -center.y - center.height / 2, center.width, center.height);

    // Body last for shadow
    ctx.fillStyle = "white";
    ctx.fillRect(-robotDimensions.length / 2 * resolution, -robotDimensions.width / 2 * resolution, robotDimensions.length * resolution, robotDimensions.width * resolution);

    // Line from center to front of robot
    // black
    ctx.strokeStyle = "black";
    //4 px
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * resolution, 0);
    ctx.stroke();
    ctx.restore();

    // Now limbo, which is y=1 to y=2. only .05 wide.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(3.375 * resolution, 1.03 * resolution, .05 * resolution, resolution * .94);

    requestAnimationFrame(render);
}

export function stopRender() {
    ctx = undefined;
}