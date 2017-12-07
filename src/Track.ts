import {ColorPalette, Coordinate} from "./interfaces";

export interface Sprite {
    image: any;
    offset: number;
}

export interface Segment {
    index: number;
    p1: Coordinate;
    p2: Coordinate;
    curve: number;
    sprites: Sprite[];
    palette: ColorPalette;
}

export enum Length {
    None = 0,
    Short = 25,
    Medium = 50,
    Long = 100
}

export enum Curve {
    None = 0,
    Easy = 2,
    Medium = 4,
    Hard = 6
}

export enum Hill {
    None = 0,
    Low = 20,
    Medium = 40,
    High = 60
}

function easeIn(a: number, b: number, percent: number) {
    return a + (b - a) * Math.pow(percent, 2);
}

function easeOut(a: number, b: number, percent: number) {
    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
}

function easeInOut(a: number, b: number, percent: number) {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
}

export class Track {
    segments: Segment[] = [];
    length: number = 0;

    constructor(public segmentLength: number, public rumbleLength: number, public lightPalette: ColorPalette, public darkPalette: ColorPalette) {
    }

    findSegment(z: number): Segment {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    }

    lastY() {
        return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.y;
    }

    addSegment(curve: number, y: number) {
        const n = this.segments.length;
        this.segments.push({
            index: n,
            p1: {x: 0, y: this.lastY(), z: n * this.segmentLength},
            p2: {x: 0, y: y, z: (n + 1) * this.segmentLength},
            curve: curve,
            sprites: [],
            palette: Math.floor(n / this.rumbleLength) % 2 ? this.darkPalette : this.lightPalette
        });
    }

    addRoad(enter: number, hold: number, leave: number, curve: number, y: number = 0) {
        const startY = this.lastY();
        const endY = startY + Math.floor(y * this.segmentLength);
        const total = enter + hold + leave;
        for (let n = 0; n < enter; n++) {
            this.addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
        }
        for (let n = 0; n < hold; n++) {
            this.addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
        }
        for (let n = 0; n < leave; n++) {
            this.addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
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
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Easy);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, Curve.Medium);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, Curve.Easy);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Easy);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Medium);
    }

    addStraight(num: number) {
        this.addRoad(num, num, num, 0);
    }

    addCurve(num: number, curve: number) {
        this.addRoad(num, num, num, curve);
    }

    addSprite(image: any, index: number, offset: number) {
        this.segments[index].sprites.push({
            image,
            offset
        });
    }
}
