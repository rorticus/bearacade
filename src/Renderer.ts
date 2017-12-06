import {ColorPalette} from "./interfaces";

const spriteScale = 0.3 * (1 / 150);

export class Renderer {
    constructor(public context: CanvasRenderingContext2D) {
    }

    rumbleWidth(projectedRoadWidth: number, lanes: number) {
        return projectedRoadWidth / Math.max(6, 2 * lanes);
    }

    laneMarkerWidth(projectedRoadWidth: number, lanes: number) {
        return projectedRoadWidth / Math.max(32, 8 * lanes);
    }

    polygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
        const context = this.context;

        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.closePath();
        context.fill();
    }

    segment(width: number, lanes: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, fog: number, palette: ColorPalette) {
        const context = this.context;

        const r1 = this.rumbleWidth(w1, lanes);
        const r2 = this.rumbleWidth(w2, lanes);
        const l1 = this.laneMarkerWidth(w1, lanes);
        const l2 = this.laneMarkerWidth(w2, lanes);

        // draw the background
        context.fillStyle = palette.grass;
        context.fillRect(0, y2, width, y1 - y2);

        // draw the rumble strips
        this.polygon(x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, palette.rumble);
        this.polygon(x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, palette.rumble);

        // draw the road
        this.polygon(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, palette.road);

        // draw the road divider
        if (palette.lane) {
            const lanew1 = w1 * 2 / lanes;
            const lanew2 = w2 * 2 / lanes;
            let lanex1 = x1 - w1 + lanew1;
            let lanex2 = x2 - w2 + lanew2;

            for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
                this.polygon(lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, palette.lane);
            }
        }
    }

    sprite(width: number, height: number, roadWidth: number, image: any, scale: number, destX: number, destY: number, offsetX?: number, offsetY?: number, clipY?: number) {
        const context = this.context;

        const destW = (image.width * scale * width / 2) * (spriteScale * roadWidth);
        const destH = (image.height * scale * width / 2) * (spriteScale * roadWidth);

        const x = destX + (destW * (offsetX || 0));
        const y = destY + (destH * (offsetY || 0));

        const clipH = clipY ? Math.max(0, y, destH - clipY) : 0;
        if (clipH < destH) {
            context.drawImage(image, 0, 0, image.width, image.height - (image.height * clipH / destH), x, y, destW, destH - clipH);
        }
    }

    background(background: any, width: number, height: number, layer: any, offset: number) {
        const context = this.context;

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
}