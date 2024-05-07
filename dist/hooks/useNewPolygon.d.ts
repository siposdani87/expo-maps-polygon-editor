import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export declare const useNewPolygon: (newPolygon?: MapPolygonExtendedProps, onPolygonCreate?: (polygon: MapPolygonExtendedProps) => void) => [() => void, () => void, (coordinate: LatLng) => void];
