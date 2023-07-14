import React from 'react';
import { MarkerDragEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export declare const SubCircleMarkers: (props: {
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MarkerDragStartEndEvent) => void;
    onDrag: (index: number) => (e: MarkerDragEvent) => void;
    onDragEnd: (index: number) => (e: MarkerDragStartEndEvent) => void;
}) => React.JSX.Element;
