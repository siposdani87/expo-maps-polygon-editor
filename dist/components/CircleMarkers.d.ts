/// <reference types="react" />
import { MapEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function CircleMarkers(props: {
    selectedMarkerIndex: number | null;
    polygon: MapPolygonExtendedProps;
    onMarkerDragStart: (_index: number) => (e: MapEvent) => void;
    onMarkerDrag: (_index: number) => (e: MapEvent) => void;
    onMarkerDragEnd: (_index: number) => (e: MapEvent) => void;
    onMarkerPress: (_index: number) => (e: MapEvent) => void;
}): JSX.Element;
