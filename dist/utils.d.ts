import * as turfHelpers from '@turf/helpers';
import { LatLng, MapPolygonProps } from 'react-native-maps';
export declare function getRandomPolygonColors(): string[];
export declare type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void;
    startPolygon: () => void;
    selectPolygonByKey: (_key: any) => void;
    selectPolygonByIndex: (_index: number) => void;
    resetAll: () => void;
};
export declare type MapPolygonExtendedProps = MapPolygonProps & {
    key: any;
};
export declare function isPointInPolygon(coordinate: LatLng, coordinates: LatLng[]): boolean;
export declare function getPointFromCoordinate(coordinate: LatLng): turfHelpers.Feature<turfHelpers.Point>;
export declare function getPolygonFromCoordinates(coordinates: LatLng[]): turfHelpers.Feature<turfHelpers.Polygon> | null;
export declare function getMidpointFromCoordinates(coordinate1: LatLng, coordinate2: LatLng): LatLng;
export declare function debounce(func: () => void, wait?: number): void;
