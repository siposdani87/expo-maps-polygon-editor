import { useState } from 'react';
import { LatLng } from 'react-native-maps';
import { MapPolygonExtendedProps } from './types';

export const useNewPolygon = (
    newPolygon?: MapPolygonExtendedProps,
    onPolygonCreate?: (_polygon: MapPolygonExtendedProps) => void,
): [() => void, () => void, (_coordinate: LatLng) => void] => {
    const [polygon, setPolygon] = useState<MapPolygonExtendedProps | null>(
        null,
    );

    const [allowCreation, setAllowCreation] = useState<boolean>(false);

    const startPolygon = (): void => {
        setAllowCreation(true);
        setPolygon(null);
    };

    const resetPolygon = (): void => {
        setAllowCreation(false);
        setPolygon(null);
    };

    const buildPolygon = (coordinate: LatLng): void => {
        if (!allowCreation || !newPolygon) {
            return;
        }
        const starterPolygon = polygon ?? {
            ...newPolygon,
            coordinates: [],
        };
        const changedPolygon = {
            ...starterPolygon,
            coordinates: [...starterPolygon.coordinates, coordinate],
        };
        setPolygon(changedPolygon);
        if (changedPolygon.coordinates.length === 3) {
            setAllowCreation(false);
            onPolygonCreate?.(changedPolygon);
        }
    };

    return [startPolygon, resetPolygon, buildPolygon];
};
