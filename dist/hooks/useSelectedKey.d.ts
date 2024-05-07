import { Dispatch, SetStateAction } from 'react';
import { MapPolygonExtendedProps, PolygonKey } from '../lib/types';
export declare const useSelectedKey: (polygons: MapPolygonExtendedProps[]) => [
    PolygonKey,
    Dispatch<SetStateAction<PolygonKey>>,
    (key: PolygonKey) => void,
    (index: number) => void
];
