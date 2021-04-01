import * as turfHelpers from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import midpoint from '@turf/midpoint';
import { LatLng } from 'react-native-maps';

export function isPointInPolygon(coordinate: LatLng, coordinates: LatLng[]): boolean {
    const point = getPointFromCoordinate(coordinate);
    const polygon = getPolygonFromCoordinates(coordinates);
    if (polygon !== null) {
        return booleanPointInPolygon(point, polygon);
    }
    return false;
}

export function getPointFromCoordinate(coordinate: LatLng): turfHelpers.Feature<turfHelpers.Point> {
    return turfHelpers.point([coordinate.latitude, coordinate.longitude]);
}

export function getPolygonFromCoordinates(coordinates: LatLng[]): turfHelpers.Feature<turfHelpers.Polygon> | null {
    if (coordinates.length < 3) {
        return null;
    }
    const linearRing = coordinates.map((c) => [c.latitude, c.longitude]);
    const firstCoordinate = coordinates[0];
    linearRing.push([firstCoordinate.latitude, firstCoordinate.longitude]);
    return turfHelpers.polygon([linearRing]);
}

export function getMidpointFromCoordinates(coordinate1: LatLng, coordinate2: LatLng): LatLng {
    const point1 = turfHelpers.point([coordinate1.latitude, coordinate1.longitude]);
    const point2 = turfHelpers.point([coordinate2.latitude, coordinate2.longitude]);
    const { geometry: { coordinates } } = midpoint(point1, point2);
    return {
        latitude: coordinates[0],
        longitude: coordinates[1],
    };
}

let timeout = null;
export function debounce(func, wait) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        timeout = null;
        func();
    }, wait);
}
