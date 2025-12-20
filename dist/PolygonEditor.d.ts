import React from 'react';
import { MapPolygonExtendedProps } from './lib/types';
export declare const PolygonEditor: React.ForwardRefExoticComponent<{
    polygons: MapPolygonExtendedProps[];
    newPolygon?: MapPolygonExtendedProps;
    onPolygonCreate?: (polygon: MapPolygonExtendedProps) => void;
    onPolygonChange?: (index: number, polygon: MapPolygonExtendedProps) => void;
    onPolygonRemove?: (index: number) => void;
    onPolygonSelect?: (index: number, polygon: MapPolygonExtendedProps) => void;
    onPolygonUnselect?: (index: number, polygon: MapPolygonExtendedProps) => void;
    disabled?: boolean;
} & React.RefAttributes<unknown>>;
