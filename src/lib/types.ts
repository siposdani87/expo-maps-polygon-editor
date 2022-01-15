import { LatLng, MapPolygonProps } from 'react-native-maps';

export type PolygonKey = string | number | null;

export type PolygonEditorRef = {
    setCoordinate: (_coordinate: LatLng) => void;
    startPolygon: () => void;
    selectPolygonByKey: (_key: PolygonKey) => void;
    selectPolygonByIndex: (_index: number) => void;
    resetAll: () => void;
};

export type MapPolygonExtendedProps = MapPolygonProps & { key: PolygonKey };
