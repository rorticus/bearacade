export interface Asset {
    name: string;
}

export interface ColorPalette {
    road: string;
    grass: string;
    rumble: string;
    lane: string;
}

export interface Camera {
    height: number;
    fieldOfView: number;
}

export interface Coordinate {
    x: number;
    y: number;
    z: number;
}
