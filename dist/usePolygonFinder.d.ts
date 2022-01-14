import { MapPolygonExtendedProps, PolygonKey } from './types';
export declare const usePolygonFinder: (polygons: MapPolygonExtendedProps[]) => [(index: number) => PolygonKey, (key: PolygonKey) => number | null, (key: PolygonKey) => MapPolygonExtendedProps | null];
