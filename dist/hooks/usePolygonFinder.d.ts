import { MapPolygonExtendedProps, PolygonKey } from '../lib/types';
export declare const usePolygonFinder: (polygons: MapPolygonExtendedProps[]) => {
    getKeyByIndex: (index: number) => PolygonKey;
    getIndexByKey: (key: PolygonKey) => number | null;
    getPolygonByKey: (key: PolygonKey) => MapPolygonExtendedProps | null;
};
