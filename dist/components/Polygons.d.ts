/// <reference types="react" />
import { MapPolygonExtendedProps } from '../lib/types';
export declare type PolygonPressEvent = any;
export default function Polygons(props: {
    polygons: MapPolygonExtendedProps[];
    onPolygonClick: (_index: number, _polygon: MapPolygonExtendedProps) => (e: PolygonPressEvent) => void;
}): JSX.Element;
