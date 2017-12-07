import {Camera, Coordinate} from "./interfaces";
import {Curve, Hill, Length, Track} from "./Track";
import {Renderer} from "./Renderer";

enum Colors {
    RoadDark = '#888688',
    RoadLight = '#999799',
    GrassDark = '#00A400',
    GrassLight = '#00CC00',
    EdgeDark = '#FF3500',
    EdgeLight = '#FFFFFF',
    RoadDivider = '#ffffff'
}

const colors = {
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

const segmentLength = 200;
const roadWidth = 2000;
const rumbleLength = 3;
const lanes = 3;
const drawDistance = 300;
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
    renderer: Renderer;
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
        player: require('./assets/player.png'),
        pineTree1: require('./assets/pine-tree.png')
    };

    start() {
        this.renderer = new Renderer(this.context);
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

        this.context.clearRect(0, 0, this.width, this.height);

        // this.renderer.background(backgroundImage, this.width, this.height, {
        //     w: backgroundImage.width,
        //     h: backgroundImage.height
        // }, this.backgroundOffset);
        // this.renderer.background(foregroundImage, this.width, this.height, {
        //     w: foregroundImage.width,
        //     h: foregroundImage.height
        // }, this.foregroundOffset);

        // render the road
        const baseSegment = this.track.findSegment(this.position.z);
        const basePercent = (this.position.z % segmentLength) / segmentLength;
        const playerSegment = this.track.findSegment(this.position.z + this.playerZ);
        const playerPercent = ((this.position.z + this.playerZ) % segmentLength) / segmentLength;
        const playerY = playerSegment.p1.y + (playerSegment.p2.y - playerSegment.p1.y) * playerPercent;
        let dx = -(baseSegment.curve * basePercent);
        let x = 0;
        let maxY = this.height;

        const segmentCoords: any[] = [];

        for (let n = 0; n < drawDistance; n++) {
            const segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length];

            const p1 = project(segment.p1, this.position.x * roadWidth - x, playerY + this.camera.height, this.position.z, this.cameraDepth, this.width, this.height, roadWidth);
            const p2 = project(segment.p2, this.position.x * roadWidth - x - dx, playerY + this.camera.height, this.position.z, this.cameraDepth, this.width, this.height, roadWidth);

            segmentCoords[n] = { p1, p2, clip: maxY };

            x += dx;
            dx += segment.curve;

            if (p1.camera.z <= this.cameraDepth || p2.screen.y >= maxY || p2.screen.y >= p1.screen.y) {
                continue;
            }

            this.renderer.segment(this.width, lanes, p1.screen.x, p1.screen.y, p1.screen.w, p2.screen.x, p2.screen.y, p2.screen.w, 1, segment.palette);

            maxY = p1.screen.y;
        }

        for(let n = (drawDistance - 1); n > 0; n--) {
            const segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length];

            segment.sprites.forEach(sprite => {
                const coords = segmentCoords[n];

                const spriteScale = coords.p1.screen.scale;
                const spriteX = coords.p1.screen.x + (spriteScale * sprite.offset * roadWidth * this.width / 2);
                const spriteY = coords.p1.screen.y;

                this.renderer.sprite(this.width, this.height, roadWidth, sprite.image, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, coords.clip);
            });
        }

        // render the player
        this.renderer.sprite(this.width, this.height, roadWidth, playerImage, this.cameraDepth / this.playerZ, this.width / 2, this.height, -0.5, -1);
    }

    private resetRoad() {
        const track = new Track(segmentLength, rumbleLength, colors.light, colors.dark);

        track.addStraight(Length.Short / 4);
        track.addSCurve();
        track.addLowRollingHills(Length.Medium, Hill.Medium);
        track.addStraight(Length.Long);
        track.addCurve(Length.Medium, Curve.Medium);
        track.addCurve(Length.Long, Curve.Medium);
        track.addStraight(Length.Medium);
        track.addSCurve();
        track.addCurve(Length.Long, -Curve.Medium);
        track.addCurve(Length.Long, Curve.Medium);
        track.addStraight(Length.Medium);
        track.addSCurve();
        track.addCurve(Length.Long, -Curve.Easy);

        const image = new Image();
        image.src = this._assets.pineTree1;

        for(let i = 0; i < 1000; i++) {
            let n = Math.floor(Math.random() * track.segments.length);

            track.addSprite(image, n, Math.random() + Math.random() < 0.6 ? -2 : 2);
        }

        track.length = track.segments.length * segmentLength;

        this.track = track;
    }
}
