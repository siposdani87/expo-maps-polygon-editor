import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from './types';
import { getMidpointFromCoordinates } from './geospatials';

export const addCoordinateToPolygon = (
    polygon: MapPolygonExtendedProps,
    coordinate: LatLng,
    coordIndex?: number,
): MapPolygonExtendedProps => {
    const i = coordIndex ?? polygon.coordinates.length ?? -1;
    const coordinates = [...polygon.coordinates];
    coordinates.splice(i, 0, coordinate);
    return { ...polygon, coordinates };
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
