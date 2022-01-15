/// <reference types="react" />
import { MapEvent } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
export default function Polygons(props: {
    polygons: MapPolygonExtendedProps[];
    onPolygonClick: (_index: number, _polygon: MapPolygonExtendedProps) => (e: MapEvent) => void;
}): JSX.Element;
