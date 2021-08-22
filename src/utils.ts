import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turfHelpers from '@turf/helpers';
import midpoint from '@turf/midpoint';
import { LatLng, MapPolygonProps } from 'react-native-maps';

function getRandomNumber(min: number, max: number): number {
    return (Math.random() * max) + min;
}

export function getRandomPolygonColors(): string[] {
    const red = Math.floor(getRandomNumber(0, 255));
    const green = Math.floor(getRandomNumber(0, 255));
    const blue = Math.floor(getRandomNumber(0, 255));
    return [`rgb(${red}, ${green}, ${blue})`, `rgba(${red}, ${green}, ${blue}, 0.2)`];
}

export type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void,
    startPolygon: () => void,
    selectPolygonByKey: (key: any) => void,
    selectPolygonByIndex: (index: number) => void,
    resetAll: () => void,
};

export type MapPolygonExtendedProps = MapPolygonProps & { key: any };

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

let timeout: any = null;
export function debounce(func: () => void, wait?: number) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        timeout = null;
        func();
    }, wait);
}
