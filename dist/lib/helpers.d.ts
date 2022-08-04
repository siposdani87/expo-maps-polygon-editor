import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from './types';
export declare const addCoordinateToPolygon: (polygon: MapPolygonExtendedProps, coordinate: LatLng, coordIndex?: number) => MapPolygonExtendedProps;
export declare const getMiddleCoordinates: (coordinates: LatLng[]) => LatLng[];
export declare const debounce: (func: () => void, wait?: number) => void;
