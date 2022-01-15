import { useEffect, useState } from 'react';
import { MapPolygonExtendedProps } from '../lib/types';

export const usePolygons = (
    oldPolygons: MapPolygonExtendedProps[],
): MapPolygonExtendedProps[] => {
    const [polygons, setPolygons] =
        useState<MapPolygonExtendedProps[]>(oldPolygons);

    useEffect(() => {
        setPolygons(oldPolygons);
    }, [oldPolygons]);

    return polygons;
};
