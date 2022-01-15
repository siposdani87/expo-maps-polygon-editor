import { useState } from 'react';
export const useSelectedMarker = () => {
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
    const isSelectedMarker = (coordIndex) => {
        return selectedMarkerIndex === coordIndex;
    };
    return {
        selectedMarkerIndex,
        setSelectedMarkerIndex,
        isSelectedMarker,
    };
};
//# sourceMappingURL=useSelectedMarker.js.map