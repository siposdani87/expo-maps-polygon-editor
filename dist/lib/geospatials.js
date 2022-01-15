import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turfHelpers from '@turf/helpers';
import midpoint from '@turf/midpoint';
export const isPointInPolygon = (coordinate, coordinates) => {
    const point = getPointFromCoordinate(coordinate);
    const polygon = getPolygonFromCoordinates(coordinates);
    if (polygon !== null) {
        return booleanPointInPolygon(point, polygon);
    }
    return false;
};
export const getPointFromCoordinate = (coordinate) => {
    return turfHelpers.point([coordinate.latitude, coordinate.longitude]);
};
export const getPolygonFromCoordinates = (coordinates) => {
    if (coordinates.length < 3) {
        return null;
    }
    const linearRing = coordinates.map((c) => [c.latitude, c.longitude]);
    const firstCoordinate = coordinates[0];
    linearRing.push([firstCoordinate.latitude, firstCoordinate.longitude]);
    return turfHelpers.polygon([linearRing]);
};
export const getMidpointFromCoordinates = (coordinate1, coordinate2) => {
    const point1 = turfHelpers.point([
        coordinate1.latitude,
        coordinate1.longitude,
    ]);
    const point2 = turfHelpers.point([
        coordinate2.latitude,
        coordinate2.longitude,
    ]);
    const { geometry: { coordinates }, } = midpoint(point1, point2);
    return {
        latitude: coordinates[0],
        longitude: coordinates[1],
    };
};
//# sourceMappingURL=geospatials.js.map