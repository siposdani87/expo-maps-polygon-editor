import React from 'react';
import { MapEvent, Polygon } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';

export default function Polygons(props: {
    polygons: MapPolygonExtendedProps[];
    onPolygonClick: (
        _index: number,
        _polygon: MapPolygonExtendedProps,
    ) => (e: MapEvent) => void;
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
