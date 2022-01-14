import { useCallback } from 'react';
import { MapPolygonExtendedProps, PolygonKey } from './types';

export const usePolygonFinder = (
    polygons: MapPolygonExtendedProps[],
): [
    (index: number) => PolygonKey,
    (key: PolygonKey) => number | null,
    (key: PolygonKey) => MapPolygonExtendedProps | null,
] => {
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

    return [getKeyByIndex, getIndexByKey, getPolygonByKey];
};
