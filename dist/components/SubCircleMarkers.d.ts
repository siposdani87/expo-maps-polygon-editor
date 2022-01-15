/// <reference types="react" />
import { MapEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function SubCircleMarkers(props: {
    polygon: MapPolygonExtendedProps;
    onSubMarkerDragStart: (_index: number) => (e: MapEvent) => void;
    onMarkerDrag: (_index: number) => (e: MapEvent) => void;
    onMarkerDragEnd: (_index: number) => (e: MapEvent) => void;
}): JSX.Element;
