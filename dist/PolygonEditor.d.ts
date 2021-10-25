import React from 'react';
import { MapPolygonExtendedProps } from './utils';
declare const _default: React.ForwardRefExoticComponent<{
    polygons: MapPolygonExtendedProps[];
    newPolygon?: MapPolygonExtendedProps | undefined;
    onPolygonChange?: ((_i: number | null, _p: MapPolygonExtendedProps | null) => void) | undefined;
    onPolygonCreate?: ((_p: MapPolygonExtendedProps) => void) | undefined;
    onPolygonRemove?: ((_i: number | null) => void) | undefined;
    onPolygonSelect?: ((_i: number, _p: MapPolygonExtendedProps) => void) | undefined;
    onPolygonUnselect?: ((_i: number | null, _p: MapPolygonExtendedProps) => void) | undefined;
    disabled?: boolean | undefined;
} & React.RefAttributes<unknown>>;
export default _default;
