import { Dispatch, SetStateAction, useState } from 'react';
import { MapPolygonExtendedProps, PolygonKey } from '../lib/types';
import { usePolygonFinder } from './usePolygonFinder';

export const useSelectedKey = (
    polygons: MapPolygonExtendedProps[],
): [
    PolygonKey,
    Dispatch<SetStateAction<PolygonKey>>,
    (key: PolygonKey) => void,
    (index: number) => void,
] => {
    const [selectedKey, setSelectedKey] = useState<PolygonKey>(null);

    const { getKeyByIndex } = usePolygonFinder(polygons);

    const selectPolygonByKey = (key: PolygonKey): void => {
        if (selectedKey !== key) {
            setSelectedKey(key);
        }
    };

    const selectPolygonByIndex = (index: number): void => {
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
