import { useState } from 'react';
export const useNewPolygon = (newPolygon, onPolygonCreate) => {
    const [polygon, setPolygon] = useState(null);
    const [allowCreation, setAllowCreation] = useState(false);
    const startPolygon = () => {
        setAllowCreation(true);
        setPolygon(null);
    };
    const resetPolygon = () => {
        setAllowCreation(false);
        setPolygon(null);
    };
    const buildPolygon = (coordinate) => {
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
//# sourceMappingURL=useNewPolygon.js.map