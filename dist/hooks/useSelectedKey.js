import { useState } from 'react';
import { usePolygonFinder } from './usePolygonFinder';
export const useSelectedKey = (polygons) => {
    const [selectedKey, setSelectedKey] = useState(null);
    const { getKeyByIndex } = usePolygonFinder(polygons);
    const selectPolygonByKey = (key) => {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };
    const selectPolygonByIndex = (index) => {
        const key = getKeyByIndex(index);
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };
    return [
        selectedKey,
        setSelectedKey,
        selectPolygonByKey,
        selectPolygonByIndex,
    ];
};
//# sourceMappingURL=useSelectedKey.js.map