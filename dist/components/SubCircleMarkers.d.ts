/// <reference types="react" />
import { MarkerDragEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function SubCircleMarkers(props: {
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MarkerDragStartEndEvent) => void;
    onDrag: (index: number) => (e: MarkerDragEvent) => void;
    onDragEnd: (index: number) => (e: MarkerDragStartEndEvent) => void;
}): JSX.Element;
