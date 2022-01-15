import { LatLng, MapPolygonProps } from 'react-native-maps';
export declare type PolygonKey = string | number | null;
export declare type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void;
    startPolygon: () => void;
    selectPolygonByKey: (_key: PolygonKey) => void;
    selectPolygonByIndex: (_index: number) => void;
    resetAll: () => void;
};
export declare type MapPolygonExtendedProps = MapPolygonProps & {
    key: PolygonKey;
};
