import { LatLng, MapPolygonProps } from 'react-native-maps';

export type PolygonKey = string | number | null;

export type PolygonEditorRef = {
    setCoordinate: (coordinate: LatLng) => void;
    startPolygon: () => void;
    selectPolygonByKey: (key: PolygonKey) => void;
    selectPolygonByIndex: (index: number) => void;
    resetAll: () => void;
};

export type MapPolygonExtendedProps = MapPolygonProps & { key: PolygonKey };
