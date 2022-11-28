import React from 'react';
import { MapPolygonExtendedProps } from './lib/types';
declare const _default: React.ForwardRefExoticComponent<{
    polygons: MapPolygonExtendedProps[];
    newPolygon?: MapPolygonExtendedProps | undefined;
    onPolygonCreate?: ((polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonChange?: ((index: number, polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonRemove?: ((index: number) => void) | undefined;
    onPolygonSelect?: ((index: number, polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonUnselect?: ((index: number, polygon: MapPolygonExtendedProps) => void) | undefined;
    disabled?: boolean | undefined;
} & React.RefAttributes<unknown>>;
export default _default;
