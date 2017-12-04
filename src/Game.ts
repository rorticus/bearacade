interface CameraCoordinate {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
}

interface Coordinate {
    world: CameraCoordinate;
    camera?: CameraCoordinate;
    screen?: CameraCoordinate;
}

interface Segment {
    index: number;
    p1: Coordinate;
    p2: Coordinate;
    color: string;
}

const COLORS = {
    DARK: '#333333',
    LIGHT: '#eeeeee'
};

export class Game {
    fps = 60;
    step = 1 / 60;
    width = 1024;
    height = 768;
    segments: Segment[];
    canvas: HTMLCanvasElement;
    context: any;
    roadWidth = 2000;
    segmentLength = 200;
    rumbleLength = 3;
    trackLength = null;
    lanes = 3;
    fieldOfView = 100;
    cameraHeight = 1000;
    cameraDepth = null;
    drawDistance = 300;
    playerX = 0;
    playerZ = null;
    fogDensity = 5;
    position = 0;
    speed = 0;
    maxSpeed = this.segmentLength / this.step;
    accel = this.maxSpeed / 5;
    breaking = this.maxSpeed;
    decel = -this.maxSpeed / 5;
    offRoadDecel = -this.maxSpeed / 2;
    offRoadLimit = this.maxSpeed / 4;
    keyLeft: boolean;
    keyRight: boolean;
    keyFaster: boolean;
    keySlower: boolean;

    start() {
        let last = Date.now();
        let gdt = 0;

        const frame = () => {
            const now = Date.now();
            const dt = Math.min(1, (now - last) / 1000);
            gdt = gdt + dt;

            while (gdt > this.step) {
                gdt = gdt - this.step;
                this.update(this.step);
            }
            this.render();

            last = now;

            requestAnimationFrame(frame);
        };

        frame();
    }

    private update(deltaInSeconds: number) {
        this.position = this.position + deltaInSeconds * this.speed;

        const dx = deltaInSeconds * 2 * (this.speed / this.maxSpeed);

        if (this.keyLeft) {
            this.playerX = this.playerX - dx;
        } else if (this.keyRight) {
            this.playerX = this.playerX + dx;
        }

        if (this.keyFaster) {
            this.speed += this.accel * deltaInSeconds;
        } else if (this.keySlower) {
            this.speed += this.breaking * deltaInSeconds;
        } else {
            this.speed += this.decel * deltaInSeconds;
        }

        if ((this.playerX < 01 || this.playerX > 1) && (this.speed > this.offRoadLimit)) {
            this.speed += this.offRoadDecel * deltaInSeconds;
        }
    }

    private render() {
        // clear the screen
        this.context.clearRect(0, 0, this.width, this.height);

        // draw the background

        // draw the road
        const baseSegment = this.findSegment(this.position);
        let maxY = this.height;

        for (let i = 0; i < this.drawDistance; i++) {
            const segment = this.segments[(baseSegment.index + i) % this.segments.length];

            this.project(segment.p1, this.playerX * this.roadWidth, this.cameraHeight, this.position, this.cameraDepth, this.width, this.height, this.roadWidth);
            this.project(segment.p2, this.playerX * this.roadWidth, this.cameraHeight, this.position, this.cameraDepth, this.width, this.height, this.roadWidth);

            if (segment.p1.camera.z <= this.cameraDepth || segment.p2.screen.y >= maxY) {
                continue;
            }

            this.renderSegment(this.lanes, segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w, segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w, segment.color)

            maxY = segment.p2.screen.y;
        }
    }

    private renderSegment(...args) {
    }

    private project(coord: Coordinate, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
        coord.camera = {
            x: (coord.world.x || 0) - cameraX,
            y: (coord.world.y || 0) - cameraY,
            z: (coord.world.z || 0) - cameraZ,
        };

        const scale = cameraDepth / coord.camera.z;
        coord.screen = {
            scale: cameraDepth / coord.camera.z,
            x: Math.round((width / 2) + (scale * coord.camera.x * width / 2)),
            y: Math.round((height / 2) + (scale * coord.camera.y * height / 2)),
            z: Math.round((scale *  roadWidth * width / 2)),
        };
    }

    private findSegment(z: number) {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    }

    private resetRoad() {
        const segments: Segment[] = [];

        for (let i = 0; i < 500; i++) {
            segments.push({
                index: i,
                p1: {world: {z: i * this.segmentLength}},
                p2: {world: {z: (i + 1) * this.segmentLength}},
                color: Math.floor(i / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT
            });
        }

        this.segments = segments;
        this.trackLength = segments.length * this.segmentLength;
    }
}
