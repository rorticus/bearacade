enum Colors {
    RoadDark = '#707270',
    RoadLight = '#999799',
    Sky = '#2798D1',
    GrassDark = '#00A400',
    GrassLight = '#00CC00',
    EdgeDark = '#FF3500',
    EdgeLight = '#FFFFFF',
    RoadDivider = '#ffffff'
}

interface ColorPalette {
    road: string;
    grass: string;
    rumble: string;
    lane: string;
}

const colors: { [key: string]: ColorPalette } = {
    'light': {
        road: Colors.RoadLight,
        grass: Colors.GrassLight,
        rumble: Colors.EdgeLight,
        lane: Colors.RoadDivider
    },
    'dark': {
        road: Colors.RoadDark,
        grass: Colors.GrassDark,
        rumble: Colors.EdgeDark,
        lane: ''
    }
};

declare const require: any;

interface Camera {
    height: number;
    fieldOfView: number;
}

interface Coordinate {
    x: number;
    y: number;
    z: number;
}

interface Segment {
    index: number;
    p1: Coordinate;
    p2: Coordinate;
    curve: number;
    palette: ColorPalette;
}

class Track {
    segments: Segment[] = [];
    length: number = 0;

    findSegment(z: number): Segment {
        return this.segments[Math.floor(z / segmentLength) % this.segments.length];
    }

    lastY() {
        return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.y;
    }

    addSegment(curve: number, y: number) {
        const n = this.segments.length;
        this.segments.push({
            index: n,
            p1: {x: 0, y: this.lastY(), z: n * segmentLength},
            p2: {x: 0, y: y, z: (n + 1) * segmentLength},
            curve: curve,
            palette: Math.floor(n / rumbleLength) % 2 ? colors['dark'] : colors['light']
        });
    }

    addRoad(enter: number, hold: number, leave: number, curve: number, y: number = 0) {
        const startY = this.lastY();
        const endY = startY + Math.floor(y * segmentLength);
        const total = enter + hold + leave;
        for (let n = 0; n < enter; n++) {
            this.addSegment(easeFunctions.easeIn(0, curve, n / enter), easeFunctions.easeInOut(startY, endY, n / total));
        }
        for (let n = 0; n < hold; n++) {
            this.addSegment(curve, easeFunctions.easeInOut(startY, endY, (enter + n) / total));
        }
        for (let n = 0; n < leave; n++) {
            this.addSegment(easeFunctions.easeInOut(curve, 0, n / leave), easeFunctions.easeInOut(startY, endY, (enter + hold + n) / total));
        }
    }

    addLowRollingHills(num: number, height: number) {
        this.addRoad(num, num, num, 0, height / 2);
        this.addRoad(num, num, num, 0, -height);
        this.addRoad(num, num, num, 0, height);
        this.addRoad(num, num, num, 0, 0);
        this.addRoad(num, num, num, 0, height / 2);
        this.addRoad(num, num, num, 0, 0);
    }

    addSCurve() {
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM);
    }

    addStraight(num: number) {
        this.addRoad(num, num, num, 0);
    }

    addCurve(num: number, curve: number) {
        this.addRoad(num, num, num, curve);
    }
}

const ROAD = {
    LENGTH: {NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100},
    CURVE: {NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6},
    HILL: {NONE: 0, LOW: 20, MEDIUM: 40, HIGHT: 60}
};

const easeFunctions = {
    easeIn: function (a: number, b: number, percent: number) {
        return a + (b - a) * Math.pow(percent, 2);
    },
    easeOut: function (a: number, b: number, percent: number) {
        return a + (b - a) * (1 - Math.pow(1 - percent, 2));
    },
    easeInOut: function (a: number, b: number, percent: number) {
        return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
    }
};

const segmentLength = 200;
const roadWidth = 2000;
const rumbleLength = 3;
const lanes = 3;
const drawDistance = 300;
const spriteScale = 0.3 * (1 / 150);
const centrifugal = 0.3;

function project(p: Coordinate, cameraX: number, cameraY: number, cameraZ: number, cameraDepth: number, width: number, height: number, roadWidth: number) {
    const cx = p.x - cameraX;
    const cy = p.y - cameraY;
    const cz = p.z - cameraZ;

    const scale = cameraDepth / cz;

    const screenX = Math.round((width / 2) + (scale * cx * width / 2));
    const screenY = Math.round((height / 2) - (scale * cy * height / 2));
    const screenWidth = Math.round(scale * roadWidth * width / 2);

    return {
        screen: {
            x: screenX,
            y: screenY,
            w: screenWidth,
            scale
        },
        camera: {
            x: cx,
            y: cy,
            z: cz
        }
    };
}

function rumbleWidth(projectedRoadWidth: number, lanes: number) {
    return projectedRoadWidth / Math.max(6, 2 * lanes);
}

function laneMarkerWidth(projectedRoadWidth: number, lanes: number) {
    return projectedRoadWidth / Math.max(32, 8 * lanes);
}

function polygon(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.lineTo(x4, y4);
    context.closePath();
    context.fill();
}

function renderSegment(context: CanvasRenderingContext2D, width: number, lanes: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, fog: number, palette: ColorPalette) {
    const r1 = rumbleWidth(w1, lanes);
    const r2 = rumbleWidth(w2, lanes);
    const l1 = laneMarkerWidth(w1, lanes);
    const l2 = laneMarkerWidth(w2, lanes);

    // draw the background
    context.fillStyle = palette.grass;
    context.fillRect(0, y2, width, y1 - y2);

    // draw the rumble strips
    polygon(context, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, palette.rumble);
    polygon(context, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, palette.rumble);

    // draw the road
    polygon(context, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, palette.road);

    // draw the road divider
    if (palette.lane) {
        const lanew1 = w1 * 2 / lanes;
        const lanew2 = w2 * 2 / lanes;
        let lanex1 = x1 - w1 + lanew1;
        let lanex2 = x2 - w2 + lanew2;

        for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
            polygon(context, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, palette.lane);
        }
    }
}

function renderSprite(context: CanvasRenderingContext2D, width: number, height: number, roadWidth: number, image: any, scale: number, destX: number, destY: number, offsetX?: number, offsetY?: number, clipY?: number) {
    const destW = (image.width * scale * width / 2) * (spriteScale * roadWidth);
    const destH = (image.height * scale * width / 2) * (spriteScale * roadWidth);

    const x = destX + (destW * (offsetX || 0));
    const y = destY + (destH * (offsetY || 0));

    const clipH = clipY ? Math.max(0, y, destH - clipY) : 0;
    if (clipH < destH) {
        context.drawImage(image, 0, 0, image.width, image.height - (image.height * clipH / destH), x, y, destW, destH - clipH);
    }
}

function renderBackground(context: CanvasRenderingContext2D, background: any, width: number, height: number, layer: any, offset: number) {
    const imageW = layer.w / 2;
    const imageH = layer.h;

    const sourceX = Math.floor(layer.w * offset);
    const sourceY = 0;
    const sourceW = Math.min(imageW, layer.w - sourceX);
    const sourceH = imageH;

    const destX = 0;
    const destY = 0;
    const destW = Math.floor(width * (sourceW / imageW));
    const destH = height;

    context.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    if (sourceW < imageW) {
        context.drawImage(background, 0, sourceY, imageW - sourceW, sourceH, destW - 1, destY, width - destW, destH);
    }
}

export class Game {
    fps = 60;
    step = 1 / this.fps;

    camera: Camera;
    cameraDepth: number;
    track: Track;
    position: Coordinate;
    speed: number;
    maxSpeed: number;
    playerZ: number;

    context: CanvasRenderingContext2D;
    width = 640;
    height = 480;

    leftKey = false;
    rightKey = false;
    forwardKey = false;
    reverseKey = false;

    accel: number;
    breaking: number;
    roadDecel: number;
    offRoadDecel: number;
    offRoadLimit: number;

    backgroundOffset: number;
    foregroundOffset: number;

    private _assets = {
        background: require('./assets/furtherest-background.jpg'),
        backgroundForeground: require('./assets/background-foreground.png'),
        player: require('./assets/player.png')
    };

    start() {
        this.camera = {
            height: 1000,
            fieldOfView: 100
        };
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        this.speed = 0;
        this.maxSpeed = segmentLength / this.step;
        this.resetRoad();
        this.cameraDepth = 1 / Math.tan((this.camera.fieldOfView / 2) * Math.PI / 180);
        this.playerZ = this.camera.height * this.cameraDepth;

        this.accel = this.maxSpeed / 5;
        this.breaking = -this.maxSpeed;
        this.roadDecel = -this.maxSpeed / 5;
        this.offRoadDecel = -this.maxSpeed / 2;
        this.offRoadLimit = this.maxSpeed / 4;

        this.backgroundOffset = 0;
        this.foregroundOffset = 0;

        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 37) {
                this.leftKey = true;
            } else if (event.keyCode === 39) {
                this.rightKey = true;
            }
            else if (event.keyCode === 38) {
                this.forwardKey = true;
            }
            else if (event.keyCode === 40) {
                this.reverseKey = true;
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.keyCode === 37) {
                this.leftKey = false;
            } else if (event.keyCode === 39) {
                this.rightKey = false;
            }
            else if (event.keyCode === 38) {
                this.forwardKey = false;
            }
            else if (event.keyCode === 40) {
                this.reverseKey = false;
            }
        });

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
        const playerSegment = this.track.findSegment(this.position.z + this.playerZ);
        const speedPercent = this.speed / this.maxSpeed;
        const dx = deltaInSeconds * 2 * speedPercent;

        this.backgroundOffset = Math.min(this.backgroundOffset + 0.001 * playerSegment.curve * speedPercent, 1);
        this.foregroundOffset = Math.min(this.foregroundOffset + 0.002 * playerSegment.curve * speedPercent, 1);

        this.position.z = this.position.z + deltaInSeconds * this.speed;

        if (this.leftKey) {
            this.position.x -= dx;
        } else if (this.rightKey) {
            this.position.x += dx;
        }

        this.position.x -= dx * speedPercent * playerSegment.curve * centrifugal;

        if (this.forwardKey) {
            this.speed += this.accel * deltaInSeconds;
        } else if (this.reverseKey) {
            this.speed += this.breaking * deltaInSeconds;
        } else {
            this.speed += this.roadDecel * deltaInSeconds;
        }

        if ((this.position.x < -1 || this.position.x > 1) && this.speed > this.offRoadLimit) {
            this.speed += this.offRoadDecel * deltaInSeconds;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        if (this.speed < 0) {
            this.speed = 0;
        }

        if (this.position.x < -2) {
            this.position.x = -2;
        }
        if (this.position.x > 2) {
            this.position.x = 2;
        }
    }

    private render() {
        // draw the background
        const backgroundImage = new Image();
        backgroundImage.src = this._assets.background;

        const foregroundImage = new Image();
        foregroundImage.src = this._assets.backgroundForeground;

        const playerImage = new Image();
        playerImage.src = this._assets.player;

        renderBackground(this.context, backgroundImage, this.width, this.height, {
            w: backgroundImage.width,
            h: backgroundImage.height
        }, this.backgroundOffset);
        renderBackground(this.context, foregroundImage, this.width, this.height, {
            w: foregroundImage.width,
            h: foregroundImage.height
        }, this.foregroundOffset);

        // render the road
        const baseSegment = this.track.findSegment(this.position.z);
        const basePercent = (this.position.z % segmentLength) / segmentLength;
        const playerSegment = this.track.findSegment(this.position.z + this.playerZ);
        const playerPercent = ((this.position.z + this.playerZ) % segmentLength) / segmentLength;
        const playerY = playerSegment.p1.y + (playerSegment.p2.y - playerSegment.p1.y) * playerPercent;
        let dx = -(baseSegment.curve * basePercent);
        let x = 0;
        let maxY = this.height;

        for (let n = 0; n < drawDistance; n++) {
            const segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length];

            const p1 = project(segment.p1, this.position.x * roadWidth - x, playerY + this.camera.height, this.position.z, this.cameraDepth, this.width, this.height, roadWidth);
            const p2 = project(segment.p2, this.position.x * roadWidth - x - dx, playerY + this.camera.height, this.position.z, this.cameraDepth, this.width, this.height, roadWidth);

            x += dx;
            dx += segment.curve;

            if (p1.camera.z <= this.cameraDepth || p2.screen.y >= maxY || p2.screen.y >= p1.screen.y) {
                continue;
            }

            renderSegment(this.context, this.width, lanes, p1.screen.x, p1.screen.y, p1.screen.w, p2.screen.x, p2.screen.y, p2.screen.w, 1, segment.palette);

            maxY = p2.screen.y;
        }

        // render the player
        renderSprite(this.context, this.width, this.height, roadWidth, playerImage, this.cameraDepth / this.playerZ, this.width / 2, this.height, -0.5, -1);
    }

    private resetRoad() {
        const track = new Track();

        track.addStraight(ROAD.LENGTH.SHORT / 4);
        track.addSCurve();
        track.addLowRollingHills(ROAD.LENGTH.MEDIUM, ROAD.HILL.MEDIUM);
        track.addStraight(ROAD.LENGTH.LONG);
        track.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM);
        track.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM);
        track.addStraight(ROAD.LENGTH.MEDIUM);
        track.addSCurve();
        track.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM);
        track.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM);
        track.addStraight(ROAD.LENGTH.MEDIUM);
        track.addSCurve();
        track.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.EASY);

        track.length = track.segments.length * segmentLength;

        this.track = track;
    }
}
