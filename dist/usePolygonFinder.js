import { useCallback } from 'react';
export const usePolygonFinder = (polygons) => {
    const getKeyByIndex = useCallback((index) => {
        const polygon = polygons[index];
        return polygon?.key;
    }, [polygons]);
    const getIndexByKey = useCallback((key) => {
        const index = polygons.findIndex((polygon) => polygon.key === key);
        return index === -1 ? null : index;
    }, [polygons]);
    const getPolygonByKey = useCallback((key) => {
        const index = getIndexByKey(key);
        if (index != null) {
            return polygons[index];
        }
        return null;
    }, [getIndexByKey, polygons]);
    return [getKeyByIndex, getIndexByKey, getPolygonByKey];
};
//# sourceMappingURL=usePolygonFinder.js.map