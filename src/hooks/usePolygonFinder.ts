import { useCallback } from 'react';
import { MapPolygonExtendedProps, PolygonKey } from '../lib/types';

export const usePolygonFinder = (
    polygons: MapPolygonExtendedProps[],
): {
    getKeyByIndex: (index: number) => PolygonKey;
    getIndexByKey: (key: PolygonKey) => number | null;
    getPolygonByKey: (key: PolygonKey) => MapPolygonExtendedProps | null;
} => {
    const getKeyByIndex = useCallback(
        (index: number): PolygonKey => {
            const polygon = polygons[index];
            return polygon?.key;
        },
        [polygons],
    );

    const getIndexByKey = useCallback(
        (key: PolygonKey): number | null => {
            const index = polygons.findIndex((polygon) => polygon.key === key);
            return index === -1 ? null : index;
        },
        [polygons],
    );

    const getPolygonByKey = useCallback(
        (key: PolygonKey): MapPolygonExtendedProps | null => {
            const index = getIndexByKey(key);
            if (index != null) {
                return polygons[index];
            }
            return null;
        },
        [getIndexByKey, polygons],
    );

    return { getKeyByIndex, getIndexByKey, getPolygonByKey };
};
