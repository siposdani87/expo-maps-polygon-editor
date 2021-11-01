import React from 'react';
import { MapPolygonExtendedProps } from './utils';
declare const _default: React.ForwardRefExoticComponent<{
    polygons: MapPolygonExtendedProps[];
    newPolygon?: MapPolygonExtendedProps | undefined;
    onPolygonChange?: ((_index: number, _polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonCreate?: ((_polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonRemove?: ((_index: number) => void) | undefined;
    onPolygonSelect?: ((_index: number, _polygon: MapPolygonExtendedProps) => void) | undefined;
    onPolygonUnselect?: ((_index: number, _polygon: MapPolygonExtendedProps) => void) | undefined;
    disabled?: boolean | undefined;
} & React.RefAttributes<unknown>>;
export default _default;
