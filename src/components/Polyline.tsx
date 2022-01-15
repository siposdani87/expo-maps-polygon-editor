import React from 'react';
import { Polygon } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';

export default function Polyline(props: {
    polygon: MapPolygonExtendedProps | null;
}): JSX.Element | null {
    if (props.polygon === null) {
        return null;
    }
    return <Polygon {...props.polygon} fillColor="transparent" />;
}
