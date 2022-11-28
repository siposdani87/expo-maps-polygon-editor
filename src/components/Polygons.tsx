import React from 'react';
import { Polygon } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';

export type PolygonPressEvent = any;

export default function Polygons(props: {
    polygons: MapPolygonExtendedProps[];
    onPolygonClick: (
        index: number,
        polygon: MapPolygonExtendedProps,
    ) => (e: PolygonPressEvent) => void;
}): JSX.Element {
    return (
        <>
            {props.polygons.map((polygon, index) => (
                <Polygon
                    {...polygon}
                    onPress={props.onPolygonClick(index, polygon)}
                    tappable={true}
                />
            ))}
        </>
    );
}
