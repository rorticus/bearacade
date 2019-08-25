import {Coordinate} from "./interfaces";

export interface SpriteCollider {
    (sprite: Sprite): void;
}

export interface Sprite {
    image: any;
    offset: number;
    collider?: SpriteCollider;
    isSolid: boolean;
    yOffset: number;
    hidden: boolean;
    lastRenderPosition?: {
        x: number;
        y: number;
        w: number;
        h: number;
    }
}

export type RoadTexture = string;

export interface RoadType {
    evenRoadColor: RoadTexture;
    oddRoadColor: RoadTexture;
    evenGrassColor: RoadTexture;
    oddGrassColor: RoadTexture;
    rumbleColor: RoadTexture;
    evenLaneColor?: RoadTexture;
    oddLaneColor?: RoadTexture;

    onRoadAccel: number;
    onRoadBreaking: number;
    onRoadDecel: number;
    offRoadDecel: number;
    onRoadMaxSpeed: number;
    offRoadMaxSpeed: number;
}

export interface Segment {
    index: number;
    p1: Coordinate;
    p2: Coordinate;
    curve: number;
    sprites: Sprite[];
    type: RoadType;
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

const segmentLength = 200;

export class Track {
    segments: Segment[] = [];
    length: number = 0;

    constructor() {
    }

    findSegment(z: number): Segment {
        return this.segments[Math.floor(z / segmentLength) % this.segments.length];
    }

    lastY() {
        return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.y;
    }

    addSegment(curve: number, y: number, roadType: RoadType) {
        const n = this.segments.length;
        this.segments.push({
            index: n,
            p1: {x: 0, y: this.lastY(), z: n * segmentLength},
            p2: {x: 0, y: y, z: (n + 1) * segmentLength},
            curve: curve,
            sprites: [],
            type: roadType,
        });
    }

    addRoad(enter: number, hold: number, leave: number, curve: number, y: number = 0, roadType: RoadType) {
        const startY = this.lastY();
        const endY = startY + Math.floor(y * segmentLength);
        const total = enter + hold + leave;
        for (let n = 0; n < enter; n++) {
            this.addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total), roadType);
        }
        for (let n = 0; n < hold; n++) {
            this.addSegment(curve, easeInOut(startY, endY, (enter + n) / total), roadType);
        }
        for (let n = 0; n < leave; n++) {
            this.addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total), roadType);
        }
    }

    addLowRollingHills(num: number, height: number, roadType: RoadType) {
        this.addRoad(num, num, num, 0, height / 2, roadType);
        this.addRoad(num, num, num, 0, -height, roadType);
        this.addRoad(num, num, num, 0, height, roadType);
        this.addRoad(num, num, num, 0, 0, roadType);
        this.addRoad(num, num, num, 0, height / 2, roadType);
        this.addRoad(num, num, num, 0, 0, roadType);
    }

    addSCurve(roadType: RoadType) {
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Easy, 0, roadType);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, Curve.Medium, 0, roadType);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, Curve.Easy, 0, roadType);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Easy, 0, roadType);
        this.addRoad(Length.Medium, Length.Medium, Length.Medium, -Curve.Medium, 0, roadType);
    }

    addStraight(num: number, roadType: RoadType) {
        this.addRoad(num, num, num, 0, 0, roadType);
    }

    addCurve(num: number, curve: number, roadType: RoadType) {
        this.addRoad(num, num, num, curve, 0, roadType);
    }
}
