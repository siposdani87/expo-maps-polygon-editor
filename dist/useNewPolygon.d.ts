import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from './types';
export declare const useNewPolygon: (newPolygon?: MapPolygonExtendedProps | undefined, onPolygonCreate?: ((_polygon: MapPolygonExtendedProps) => void) | undefined) => [() => void, () => void, (_coordinate: LatLng) => void];
