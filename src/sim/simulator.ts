// The simulator takes an arena (writable) and a current robot state and returns a new robot state and sets the

import {arena, draggingRobot, robot, robotDimensions} from "../state";
import type {Arena, Obstacle, Robot} from "./Types";
import {round} from "./utils";

type Point = [number, number];
type Line = [Point, Point];

function boxContains(box: Obstacle, point: Point): number | false {
    //
    if (point[0] >= box.left && point[0] <= box.left + box.width && point[1] >= box.top && point[1] <= box.top + box.height) {
        // Should be distance that the point is inside the box by.
        const distances = [point[0] - box.left,
            box.left + box.width - point[0],
            point[1] - box.top,
            box.top + box.height - point[1]]
        return Math.min(...distances);
    }
    return false;
}

function normalizeVector(v: Point, len: number = 1): Point {
    const m = Math.hypot(...v) / len;
    return [v[0] / m, v[1] / m]
}

export function stopRobot() {
    robot.update(r => ({...r, v: 0, w: 0}));
}

let $robot: Robot, $arena: Arena, $draggingRobot: boolean;
robot.subscribe(value => $robot = value);
arena.subscribe(value => $arena = value);
draggingRobot.subscribe(value => $draggingRobot = value);

/**
 * Propagate the robot's movement and check for collisions.
 * @param dt The time since the last frame in seconds.
 */
export function physics(dt: number) {
    if (dt > 0.05) return; // Don't do physics if the frame is too long.
    // Propagate movement
    if (!$draggingRobot) {
        // Pause when dragging the robot.
        $robot.angle = ($robot.angle + $robot.w * dt);

        $robot.x = $robot.x + Math.cos($robot.angle) * $robot.v * dt
        $robot.y = $robot.y + Math.sin($robot.angle) * $robot.v * dt
    }

    // Make sure the robot is within the bounds of the arena
    let corners: Point[] = [
        [-robotDimensions.length / 2, -robotDimensions.width / 2],
        [-robotDimensions.length / 2, robotDimensions.width / 2],
        [robotDimensions.length / 2, -robotDimensions.width / 2],
        [robotDimensions.length / 2, robotDimensions.width / 2]
    ].map(([x, y]) => {
        return [
            $robot.x + x * Math.cos($robot.angle) - y * Math.sin($robot.angle),
            $robot.y + x * Math.sin($robot.angle) + y * Math.cos($robot.angle)
        ];
    })
    for (const corner of corners) {
        if (corner[0] < 0) {
            // X is left of the arena
            $robot.x += -corner[0];
        }
        if (corner[0] > $arena.width) {
            // X is right of the arena
            $robot.x -= corner[0] - $arena.width;
        }
        if (corner[1] < 0) {
            // Y is above the arena
            $robot.y += -corner[1];
        }
        if (corner[1] > $arena.height) {
            // Y is below the arena
            $robot.y -= corner[1] - $arena.height;
        }
    }

    for (const obstacle of $arena.obstacles.filter(ob => ob.collisions && !$draggingRobot)) {
        // Check if a corner of the
        // We will detect if the robot is inside the obstacle.
        const containedCorners: [Point, number][] = corners
            .map((c) => [c, boxContains(obstacle, c)])
            .filter(e => e[1] !== false) as any;
        if (containedCorners.length === 0) continue;
        // console.log(containedCorners.length, 'corners', containedCorners)
        // Direction vector is the average vector of the contained corners to the COM.
        const COM: Point = [$robot.x, $robot.y]
        const dir = containedCorners
            .map(([cor, mag]) => normalizeVector([COM[0] - cor[0], COM[1] - cor[1]], mag))
            .reduce((sum: Point, c: Point): Point => {
                return [sum[0] + c[0], sum[1] + c[1]]
            }, [0, 0]);
        // console.log('magnitude is', Math.hypot(...dir).toFixed(3), dir)
        $robot.x += dir[0]
        $robot.y += dir[1]
    }
    for (const obstacle of $arena.obstacles.filter(ob => !ob.collisions && !$draggingRobot)) {
        // For obstacles that are not colliding, give a nice little sinisiodal (time / 1000) push.
        const containedCorners: [Point, number][] = corners
            .map((c) => [c, boxContains(obstacle, c)])
            .filter(e => e[1] !== false) as any;
        if (containedCorners.length === 0) continue;

        const t = performance.now() / 100;
        let err = Math.cos(t) * Math.sqrt($robot.v) * .01;
        $robot.angle += err; // If slow don't do it.
    }

    // Sanity check
    if ($robot.x < 0) $robot.x = 0;
    if ($robot.y < 0) $robot.y = 0;
    if ($robot.x > $arena.width) $robot.x = $arena.width;
    if ($robot.y > $arena.height) $robot.y = $arena.height;

    $robot.x = round($robot.x, 4);
    $robot.y = round($robot.y, 4);
    // Make sure it is from -PI to PI
    $robot.angle = (($robot.angle + Math.PI * 3) % (2 * Math.PI) - Math.PI);
    $robot.angle = round($robot.angle, 4);
    $robot.w = round($robot.w, 4);
    $robot.v = round($robot.v, 4);
    robot.set($robot);
}

export function distanceSensor(angle: number, maxDistance: number): number {
    // console.log('here')
    const offset = robotDimensions.length / 2;
    const angle_ABS = $robot.angle + angle;
    let dir = [Math.cos(angle_ABS), Math.sin(angle_ABS)] as Point;
    const startDelta = normalizeVector(dir, offset);
    const endDelta = normalizeVector(dir, maxDistance + offset);

    const start: Point = [$robot.x + startDelta[0], $robot.y + startDelta[1]];
    const end: Point = [start[0] + endDelta[0], start[1] + endDelta[1]];
    const line: Line = [start, end];
    function crossProduct(o: Point, a: Point, b: Point): number {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
    function lineIntersects(a: Line, b: Line) {
        const p1 = a[0], p2 = a[1], q1 = b[0], q2 = b[1];
        const d1 = crossProduct(p1, p2, q1);
        const d2 = crossProduct(p1, p2, q2);
        const d3 = crossProduct(q1, q2, p1);
        const d4 = crossProduct(q1, q2, p2);
        return ((d1 >= 0 && d2 <= 0) || (d1 <= 0 && d2 >= 0)) && ((d3 >= 0 && d4 <= 0) || (d3 <= 0 && d4 >= 0));
    }
    function lines_intersection_point(a: Line, b: Line): Point {
        const dC = crossProduct(b[0], b[1], a[0]);
        const dD = crossProduct(b[0], b[1], a[1]);
        const t = dC / (dC - dD);
        const x = a[0][0] + t * (a[1][0] - a[0][0]);
        const y = a[0][1] + t * (a[1][1] - a[0][1]);
        return [x, y];
    }

    const lines: Line[] = [];
    const p1: Point = [0,0], p2: Point = [0, $arena.height], p3: Point = [$arena.width, $arena.height], p4: Point = [$arena.width, 0];
    lines.push([p1, p2], [p2, p3], [p3, p4], [p4, p1]);
    for (const obstacle of $arena.obstacles.filter(ob => ob.collisions)) {
        const box: Point[] = [[obstacle.left, obstacle.top], [obstacle.left + obstacle.width, obstacle.top],
            [obstacle.left + obstacle.width, obstacle.top + obstacle.height], [obstacle.left, obstacle.top + obstacle.height]];
        for (let i = 0; i < 4; i++) {
            lines.push([box[i], box[(i + 1) % 4]]);
        }
    }
    let intersections = lines.filter(l => lineIntersects(line, l)).map(l => {
        const p = lines_intersection_point(line, l);
        return Math.hypot(p[0] - start[0], p[1] - start[1]);
    });
    const val = Math.min(maxDistance, ...intersections)
    if (val == maxDistance) return -1
    return val;
}

// todo randomize obstacles
// todo randomize position of robot (high or low)