/// <reference types="react" />
import { MapEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function CircleMarkers(props: {
    selectedMarkerIndex: number | null;
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MapEvent) => void;
    onDrag: (index: number) => (e: MapEvent) => void;
    onDragEnd: (index: number) => (e: MapEvent) => void;
    onPress: (index: number) => (e: MapEvent) => void;
}): JSX.Element;
