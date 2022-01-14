import * as turfHelpers from '@turf/helpers';
import { LatLng } from 'react-native-maps';
export declare const getRandomPolygonColors: () => [string, string];
export declare const isPointInPolygon: (coordinate: LatLng, coordinates: LatLng[]) => boolean;
export declare const getPointFromCoordinate: (coordinate: LatLng) => turfHelpers.Feature<turfHelpers.Point>;
export declare const getPolygonFromCoordinates: (coordinates: LatLng[]) => turfHelpers.Feature<turfHelpers.Polygon> | null;
export declare const getMidpointFromCoordinates: (coordinate1: LatLng, coordinate2: LatLng) => LatLng;
export declare const getMiddleCoordinates: (coordinates: LatLng[]) => LatLng[];
export declare const debounce: (func: () => void, wait?: number | undefined) => void;
