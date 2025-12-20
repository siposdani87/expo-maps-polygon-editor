import { LatLng } from 'react-native-maps';
import type { Feature, Point, Polygon } from 'geojson';
export declare const isPointInPolygon: (coordinate: LatLng, coordinates: LatLng[]) => boolean;
export declare const getPointFromCoordinate: (coordinate: LatLng) => Feature<Point>;
export declare const getPolygonFromCoordinates: (coordinates: LatLng[]) => Feature<Polygon> | null;
export declare const getMidpointFromCoordinates: (coordinate1: LatLng, coordinate2: LatLng) => LatLng;
