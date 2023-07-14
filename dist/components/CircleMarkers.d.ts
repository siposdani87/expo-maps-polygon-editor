import React from 'react';
import { MarkerDragEvent, MarkerDragStartEndEvent, MarkerPressEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export declare const CircleMarkers: (props: {
    selectedMarkerIndex: number | null;
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MarkerDragStartEndEvent) => void;
    onDrag: (index: number) => (e: MarkerDragEvent) => void;
    onDragEnd: (index: number) => (e: MarkerDragStartEndEvent) => void;
    onPress: (index: number) => (e: MarkerPressEvent) => void;
}) => React.JSX.Element;
