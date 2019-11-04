import {Track} from "../../../../engine/Track";
import { Background } from "../../../../engine/renderer/Renderer";

export interface Level {
    generateTrack(track: Track): void;
    getBackgrounds(): Background[];
}