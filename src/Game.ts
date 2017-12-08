import {Camera, Coordinate} from "./interfaces";
import {Curve, Hill, Length, Sprite, Track} from "./Track";
import {Renderer, spriteScale} from "./Renderer";
import {bear1, bear2, bear3, bear4, bearDead, layer1, layer2, layer3, log, pineTree, player, sky} from "./Assets";

enum Colors {
    RoadDark = '#888688',
    RoadLight = '#999799',
    GrassDark = '#00BB00',
    GrassLight = '#00CC00',
    EdgeDark = '#CCCCCC',
    EdgeLight = '#FFFFFF',
    RoadDivider = '#ffffff'
}

interface Animation {
    startTime: number;
    duration: number;
    renderFrame: (t: number) => void;
    onComplete?: () => void;
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

const segmentLength = 200;
const roadWidth = 2000;
const rumbleLength = 3;
const lanes = 2;
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

function overlap(x1: number, w1: number, x2: number, w2: number, percent: number = 1) {
    const half = (percent) / 2;
    const min1 = x1 - (w1 * half);
    const max1 = x1 + (w1 * half);
    const min2 = x2 - (w2 * half);
    const max2 = x2 + (w2 * half);
    return !((max1 < min2) || (min1 > max2));
}

function bearCollider(this: Game, sprite: Sprite) {
    if (!sprite.hidden) {
        this.points++;
        sprite.hidden = true;

        if(sprite.lastRenderPosition) {
            let startX = sprite.lastRenderPosition.x + sprite.lastRenderPosition.w / 2;
            let startY = sprite.lastRenderPosition.y + sprite.lastRenderPosition.h / 2;

            let endX = Math.round(Math.random() * this.width * 1.2 - this.width * 0.1);
            let endY = Math.random() * (this.height / 4);

            this.animate(0.5, (t: number) => {
                const x = startX + (endX - startX) * t;
                const y = startY + (endY - startY) * t;

                this.context.drawImage(bearDead, x, y);
            });
        }
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
    animations: Animation[];

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

    layer1Offset: number;
    layer2Offset: number;
    layer3Offset: number;
    points: number;
    gameTime: number;

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
        this.gameTime = 0;
        this.animations = [];
        this.points = 0;
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

        this.layer1Offset = 0;
        this.layer2Offset = 0;
        this.layer3Offset = 0;

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
        const playerW = player.width * spriteScale;

        this.gameTime += deltaInSeconds;

        this.layer1Offset = Math.min(this.layer1Offset + 0.0001 * playerSegment.curve * speedPercent, 1);
        this.layer2Offset = Math.min(this.layer2Offset + 0.0005 * playerSegment.curve * speedPercent, 1);
        this.layer3Offset = Math.min(this.layer3Offset + 0.001 * playerSegment.curve * speedPercent, 1);

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

        playerSegment.sprites.forEach(sprite => {
            if (sprite.hidden) {
                return;
            }
            // get the player sprite bounds
            const spriteWidth = sprite.image.width * spriteScale;

            if (overlap(this.position.x, playerW, sprite.offset, spriteWidth)) {
                if (sprite.collider) {
                    sprite.collider.call(this, sprite);
                }

                if (sprite.isSolid) {
                    this.speed = this.maxSpeed / 5;
                    this.position.z = playerSegment.p1.z - this.playerZ;
                }
            }
        });

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

        while (playerSegment.index + drawDistance > this.track.segments.length) {
            this.generateOneTrack();
        }
    }

    private render() {
        this.context.clearRect(0, 0, this.width, this.height);

        // draw the background
        this.renderer.background(sky, this.width, this.height, 0);
        this.renderer.background(layer1, this.width, this.height, this.layer1Offset);
        this.renderer.background(layer3, this.width, this.height, this.layer2Offset);
        this.renderer.background(layer2, this.width, this.height, this.layer3Offset);

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

            segmentCoords[n] = {p1, p2, clip: maxY};

            x += dx;
            dx += segment.curve;

            if (p1.camera.z <= this.cameraDepth || p2.screen.y >= maxY || p2.screen.y >= p1.screen.y) {
                continue;
            }

            this.renderer.segment(this.width, lanes, p1.screen.x, p1.screen.y, p1.screen.w, p2.screen.x, p2.screen.y, p2.screen.w, 1, segment.palette);

            maxY = p1.screen.y;
        }

        for (let n = (drawDistance - 1); n > 0; n--) {
            const segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length];

            segment.sprites.forEach(sprite => {
                if (sprite.hidden) {
                    return;
                }

                const coords = segmentCoords[n];

                const spriteScale = coords.p1.screen.scale;
                const spriteX = coords.p1.screen.x + (spriteScale * sprite.offset * roadWidth * this.width / 2);
                const spriteY = coords.p1.screen.y;

                sprite.lastRenderPosition = this.renderer.sprite(this.width, this.height, roadWidth, sprite.image, spriteScale, spriteX, spriteY, -0.5, sprite.yOffset, coords.clip);
            });
        }

        // render the player
        this.renderer.sprite(this.width, this.height, roadWidth, player, this.cameraDepth / this.playerZ, this.width / 2, this.height, -0.5, -1);

        // score
        this.renderer.score(this.width, this.height, this.points);

        // render the animations
        this.animations = this.animations.filter((animation, index: number) => {
            let t = (this.gameTime - animation.startTime) / animation.duration;

            if (t > 1) {
                t = 1;
            }

            animation.renderFrame(t);

            if (t >= 1) {
                if (animation.onComplete) {
                    animation.onComplete();
                }

                return false;
            }

            return true;
        });
    }

    private resetRoad() {
        const track = new Track(segmentLength, rumbleLength, colors.light, colors.dark);

        track.length = track.segments.length * segmentLength;

        this.track = track;

        this.generateOneTrack();
    }

    generateOneTrack() {
        let originalSize = this.track.segments.length;
        const size = 300;

        let curves = [
            Curve.None,
            Curve.None,
            Curve.None,
            Curve.None,
            Curve.None,
            Curve.Easy,
            Curve.Easy,
            Curve.Medium,
            Curve.Hard
        ];

        let hills = [
            Hill.None,
            Hill.None,
            Hill.None,
            Hill.None,
            Hill.None,
            Hill.Low,
            Hill.Low,
            Hill.Medium,
            Hill.Medium,
            Hill.High
        ];

        const bearSprites = [bear1, bear2, bear3, bear4];

        const split1 = Math.round((size / 2) * Math.random());
        const split2 = Math.round(((size - split1) / 2) * Math.random());
        const split3 = size - split1 - split2;

        this.track.addRoad(split1, split2, split3, curves[Math.floor(Math.random() * curves.length)], hills[Math.floor(Math.random() * hills.length)]);

        for (let i = originalSize; i < this.track.segments.length; i++) {
            const trees = Math.round(Math.random() * 2);
            for (let n = 0; n < trees; n++) {
                const side = Math.random() * 100 < 50 ? -1 : 1;
                const offset = 1.5 + Math.random() * 6;

                this.track.addSprite(pineTree, i, side * offset, true, -0.95);
            }

            const hasLog = (Math.random() * 1000) < 10;
            const hasBear = (Math.random() * 1000) < 20;

            if (hasLog) {
                this.track.addSprite(log, i, Math.random() * 2 - 1);
            }

            if (hasBear) {
                this.track.addSprite(bearSprites[Math.floor(Math.random() * bearSprites.length)], i, Math.random() * 3 - 1.5, false, -1, <any> bearCollider);
            }
        }

        this.track.length = this.track.segments.length * segmentLength;
    }

    animate(duration: number, frame: (t: number) => void, complete?: () => void) {
        this.animations.push({
            startTime: this.gameTime,
            duration,
            renderFrame: frame,
            onComplete: complete
        });
    }
}
