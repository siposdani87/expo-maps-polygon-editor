import { Dispatch, SetStateAction } from 'react';
export declare const useSelectedMarker: () => {
    selectedMarkerIndex: number | null;
    setSelectedMarkerIndex: Dispatch<SetStateAction<number | null>>;
    isSelectedMarker: (_coordIndex: number | null) => boolean;
};
