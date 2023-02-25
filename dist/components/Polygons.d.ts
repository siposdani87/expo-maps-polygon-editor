/// <reference types="react" />
import { MapPolygonExtendedProps } from '../lib/types';
export type PolygonPressEvent = any;
export default function Polygons(props: {
    polygons: MapPolygonExtendedProps[];
    onPolygonClick: (index: number, polygon: MapPolygonExtendedProps) => (e: PolygonPressEvent) => void;
}): JSX.Element;
