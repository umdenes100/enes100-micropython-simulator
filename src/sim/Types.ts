export type Obstacle = {
    left: number, // meters
    top: number, // meters
    width: number, // meters
    height: number, // meters
    collisions: boolean, // true if the robot should collide with this obstacle and ultrasonics should see it.
}

export type Arena = {
    width: number, // meters
    height: number, // meters
    obstacles: Obstacle[],
}

export type Robot = {
    x: number, // meters
    y: number, // meters
    angle: number, // radians
    v: number, // m/s
    w: number, // rad/s
}
