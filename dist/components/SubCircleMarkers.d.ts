/// <reference types="react" />
import { MapEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function SubCircleMarkers(props: {
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MapEvent) => void;
    onDrag: (index: number) => (e: MapEvent) => void;
    onDragEnd: (index: number) => (e: MapEvent) => void;
}): JSX.Element;
