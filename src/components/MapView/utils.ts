function getBounds(waypoints: Array<[number, number]>): {southWest: [number, number]; northEast: [number, number]} {
    const lngs = waypoints.map((waypoint) => waypoint[0]);
    const lats = waypoints.map((waypoint) => waypoint[1]);

    return {
        southWest: [Math.min(...lngs), Math.min(...lats)],
        northEast: [Math.max(...lngs), Math.max(...lats)],
    };
}

export default {
    getBounds,
};
