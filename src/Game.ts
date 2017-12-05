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

declare const require: any;

interface RenderConfig {
    fov: number;
    cameraHeight: number;
    roadWidth: number;
    segmentMultiplier: number;
    edgeThickness: number;
    dividerThickness: number;
}

enum TrackType {
    Straight = 'straight',
    GentleLeft = 'gentle-left',
    GentleRight = 'gentle-right',
    HardLeft = 'hard-left',
    HardRight = 'hard-right'
}

interface Track {
    z: number;
    endZ: number;
    type: TrackType;
}

interface Camera {
    height: number;
    distanceToScreen: number;
    distanceFromCar: number;
}

interface Coordinate {
    x: number;
    y: number;
    z: number;
}

interface Width {
    w: number;
}

export class Game {
    fps = 60;
    step = 1 / this.fps;

    context: CanvasRenderingContext2D;
    width = 640;
    height = 480;
    position = 0;

    private _renderConfig: RenderConfig = {
        fov: 60,
        cameraHeight: 150,
        roadWidth: 400,
        segmentMultiplier: 10,
        edgeThickness: 0.05,
        dividerThickness: 0.025
    };

    private _zMap: any;
    private _assets = {
        background: require('./assets/furtherest-background.jpg'),
        backgroundForeground: require('./assets/background-foreground.png'),
        player: require('./assets/player.png')
    };

    private _track: Track[] = [];

    async start() {
        this._buildZMap();

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
        this.position += 0.01;

        this._track = this._track.filter(track => track.endZ >= this.position - 15);
    }

    private render() {
        // draw the background
        const backgroundImage = new Image();
        backgroundImage.src = this._assets.background;

        const foregroundImage = new Image();
        foregroundImage.src = this._assets.backgroundForeground;

        const playerImage = new Image();
        playerImage.src = this._assets.player;

        const baseZ = this.position + this._zMap[450];
        const baseTrack = this._getTrackAt(baseZ);
        const baseTrackDx = this._getTrackDx(baseTrack, baseZ);

        this.context.drawImage(backgroundImage, 0 - 640 / 2 - baseTrackDx * 640, 0);

        this.context.drawImage(foregroundImage, 0 - 640 / 2 - baseTrackDx * 1280, 10);

        let currentX = this.width / 2;
        let dx = 0;
        let ddx = 0;

        // draw the road
        for (let y = this.height; y >= this.height / 2 + 1; y--) {
            const z = this._zMap[y];
            const n = this.position + z;
            let i = Math.abs(Math.round(n * this._renderConfig.segmentMultiplier)) % 2;
            const roadWidth = this._renderConfig.roadWidth / z;

            const track = this._getTrackAt(n);

            dx = this._getTrackDx(track, n);
            ddx += dx;
            currentX += ddx;

            const center = currentX;
            const left = center - roadWidth / 2;

            this.context.fillStyle = i ? Colors.GrassDark : Colors.GrassLight;
            this.context.fillRect(0, y, this.width, 1);

            this.context.fillStyle = i ? Colors.RoadLight : Colors.RoadDark;
            this.context.fillRect(left, y, roadWidth, 1);

            // draw the left edge
            this.context.fillStyle = i ? Colors.EdgeDark : Colors.EdgeLight;
            this.context.fillRect(left, y, roadWidth * this._renderConfig.edgeThickness, 1);

            // draw the right edge
            this.context.fillStyle = i ? Colors.EdgeDark : Colors.EdgeLight;
            this.context.fillRect(left + roadWidth - roadWidth * this._renderConfig.edgeThickness, y, roadWidth * this._renderConfig.edgeThickness, 1);

            // draw the divider
            if (i) {
                const dividerWidth = roadWidth * this._renderConfig.dividerThickness;

                this.context.fillStyle = Colors.RoadDivider;
                this.context.fillRect(center - dividerWidth / 2, y, dividerWidth, 1);
            }
        }

        // draw the player
        this.context.drawImage(playerImage, this.width / 2 - playerImage.width / 2,  this.height - playerImage.height);
    }

    private _getTrackAt(z: number): Track {
        const index = Math.floor(z);
        const types = [
            TrackType.Straight,
            TrackType.Straight,
            TrackType.Straight,
            TrackType.Straight,
            TrackType.Straight,
            TrackType.Straight,
            TrackType.GentleLeft,
            TrackType.GentleLeft,
            TrackType.GentleRight,
            TrackType.GentleRight,
            TrackType.HardLeft,
            TrackType.HardRight
        ];

        while (index >= this._track.length) {
            this._track.push({
                z: Math.floor(z),
                endZ: Math.floor(z) + 1,
                type: types[Math.floor(Math.random() * types.length)]
            });
        }

        return this._track[index];
    }

    private _getTrackDx(track: Track, z: number): number {
        const t = (z - track.z) / (track.endZ - track.z);

        switch (track.type) {
            case TrackType.Straight:
                return 0;
            case TrackType.GentleLeft:
                return -Math.sin(t * Math.PI) / 32;
            case TrackType.GentleRight:
                return Math.sin(t * Math.PI) / 32;
            case TrackType.HardLeft:
                return -Math.sin(t * Math.PI) / 16;
            case TrackType.HardRight:
                return Math.sin(t * Math.PI) / 16;
        }
        return 0;
    }

    private _buildZMap() {
        this._zMap = [];

        for (let y = this.height / 2 + 1; y <= this.height; y++) {
            this._zMap[y] = -(0 - this._renderConfig.cameraHeight) / (y - (this.height / 2));
        }

        console.log(this._zMap);
    }
}
