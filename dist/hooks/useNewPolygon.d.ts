import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export declare const useNewPolygon: (newPolygon?: MapPolygonExtendedProps | undefined, onPolygonCreate?: ((polygon: MapPolygonExtendedProps) => void) | undefined) => [() => void, () => void, (coordinate: LatLng) => void];
