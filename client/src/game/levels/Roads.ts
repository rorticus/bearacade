import {RoadType} from "../../../../engine/Track";

export const streetRoad: RoadType = {
    evenGrassColor: "#00BB00",
    oddGrassColor: "#00AA00",
    evenLaneColor: "#FFFF00",
    oddLaneColor: undefined,
    evenRoadColor: "#333333",
    oddRoadColor: "#222222",
    rumbleColor: "#FFFFFF",
    offRoadDecel: (200 * -1) / 2,
    offRoadMaxSpeed: 200 * 1,
    onRoadAccel: 100,
    onRoadBreaking: 200 * -1,
    onRoadDecel: -100,
    onRoadMaxSpeed: 200 * 10
};
