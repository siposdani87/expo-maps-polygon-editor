import { LatLng, MapPolygonProps } from 'react-native-maps';
export declare type PolygonKey = string | number | null;
export declare type PolygonEditorRef = {
    setCoordinate: (coordinate: LatLng) => void;
    startPolygon: () => void;
    selectPolygonByKey: (key: PolygonKey) => void;
    selectPolygonByIndex: (index: number) => void;
    resetAll: () => void;
};
export declare type MapPolygonExtendedProps = MapPolygonProps & {
    key: PolygonKey;
};
