import {RoadType} from "../../../../engine/Track";

export const streetRoad: RoadType = {
    oddGrassColor: "#914634",
    evenGrassColor: "#914634",
    evenLaneColor: "#FFFF00",
    oddLaneColor: undefined,
    evenRoadColor: "#000000",
    oddRoadColor: "#000000",
    rumbleColor: "#FFFFFF",
    offRoadDecel: (200 * -1) / 2,
    offRoadMaxSpeed: 200 * 1,
    onRoadAccel: 100,
    onRoadBreaking: 200 * -1,
    onRoadDecel: -100,
    onRoadMaxSpeed: 200 * 10
};
