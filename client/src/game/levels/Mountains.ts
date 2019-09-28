import {Curve, Hill, Track} from "../../../../engine/Track";
import {streetRoad} from "./Roads";
import {Level} from "./Level";

export class Mountains implements Level {
    generateTrack(track: Track) {
        const size = 300;

        let curves = [
            Curve.None,
            Curve.None,
            Curve.None,
            Curve.Easy,
            Curve.Easy,
            Curve.Medium,
            Curve.Hard,
            Curve.Medium,
            Curve.Hard,
            -Curve.Easy,
            -Curve.Easy,
            -Curve.Medium,
            -Curve.Hard,
            -Curve.Medium,
            -Curve.Hard
        ];

        let hills = [
            Hill.None,
            Hill.None,
            Hill.Low,
            Hill.Low,
            Hill.Medium,
            Hill.Medium,
            Hill.High
        ];

        const split1 = Math.round((size / 2) * Math.random());
        const split2 = Math.round(((size - split1) / 2) * Math.random());
        const split3 = size - split1 - split2;

        track.addRoad(split1, split2, split3, curves[Math.floor(Math.random() * curves.length)], hills[Math.floor(Math.random() * hills.length)], streetRoad);
    }
}