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
        segmentMultiplier: 14,
        edgeThickness: 0.05,
        dividerThickness: 0.025
    };

    private _zMap: any;
    private _assets = {
        background: require('./assets/furtherest-background.jpg')
    };

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
    }

    private render() {
        // clear the screen
        this.context.clearRect(0, 0, this.width, this.height);

        // draw the background
        const backgroundImage = new Image();
        backgroundImage.src = this._assets.background;

        this.context.drawImage(backgroundImage, 0, 0);

        // draw the road
        for (let y = this.height; y >= this.height / 2; y--) {
            const z = this._zMap[y];
            let i = Math.round((this.position - z) * this._renderConfig.segmentMultiplier) % 2;
            const roadWidth = this._renderConfig.roadWidth / z;
            const center = this.width / 2;
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
                this.context.fillRect(this.width / 2 - dividerWidth / 2, y, dividerWidth, 1);
            }
        }
    }

    private _buildZMap() {
        this._zMap = [];

        for (let y = 0; y < this.height; y++) {
            this._zMap[y] = (1 - this._renderConfig.cameraHeight) / (y - (this.height / 2));
        }
    }
}
