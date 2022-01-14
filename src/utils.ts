import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turfHelpers from '@turf/helpers';
import midpoint from '@turf/midpoint';
import { LatLng } from 'react-native-maps';

const getRandomNumber = (min: number, max: number): number => {
    return Math.random() * max + min;
};

export const getRandomPolygonColors = (): [string, string] => {
    const red = Math.floor(getRandomNumber(0, 255));
    const green = Math.floor(getRandomNumber(0, 255));
    const blue = Math.floor(getRandomNumber(0, 255));

    const strokeColor = `rgb(${red}, ${green}, ${blue})`;
    const fillColor = `rgba(${red}, ${green}, ${blue}, 0.2)`;

    return [strokeColor, fillColor];
};

export const isPointInPolygon = (
    coordinate: LatLng,
    coordinates: LatLng[],
): boolean => {
    const point = getPointFromCoordinate(coordinate);
    const polygon = getPolygonFromCoordinates(coordinates);
    if (polygon !== null) {
        return booleanPointInPolygon(point, polygon);
    }
    return false;
};

export const getPointFromCoordinate = (
    coordinate: LatLng,
): turfHelpers.Feature<turfHelpers.Point> => {
    return turfHelpers.point([coordinate.latitude, coordinate.longitude]);
};

export const getPolygonFromCoordinates = (
    coordinates: LatLng[],
): turfHelpers.Feature<turfHelpers.Polygon> | null => {
    if (coordinates.length < 3) {
        return null;
    }
    const linearRing = coordinates.map((c) => [c.latitude, c.longitude]);
    const firstCoordinate = coordinates[0];
    linearRing.push([firstCoordinate.latitude, firstCoordinate.longitude]);
    return turfHelpers.polygon([linearRing]);
};

export const getMidpointFromCoordinates = (
    coordinate1: LatLng,
    coordinate2: LatLng,
): LatLng => {
    const point1 = turfHelpers.point([
        coordinate1.latitude,
        coordinate1.longitude,
    ]);
    const point2 = turfHelpers.point([
        coordinate2.latitude,
        coordinate2.longitude,
    ]);
    const {
        geometry: { coordinates },
    } = midpoint(point1, point2);
    return {
        latitude: coordinates[0],
        longitude: coordinates[1],
    };
};

export const getMiddleCoordinates = (coordinates: LatLng[]): LatLng[] => {
    const middleCoordinates = [
        getMidpointFromCoordinates(
            coordinates[0],
            coordinates[coordinates.length - 1],
        ),
    ];
    for (let i = 1; i < coordinates.length; i++) {
        const coordinate = getMidpointFromCoordinates(
            coordinates[i - 1],
            coordinates[i],
        );
        middleCoordinates.push(coordinate);
    }
    return middleCoordinates;
};

let timeout: any = null;
export const debounce = (func: () => void, wait?: number): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        timeout = null;
        func();
    }, wait);
};
