import {Track} from "../../../../engine/Track";

export interface Level {
    generateTrack(track: Track): void;
}