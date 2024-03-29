import React from 'react';
import { Polygon } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';

export const Polyline = (props: {
    polygon: MapPolygonExtendedProps | null;
}) => {
    if (props.polygon === null) {
        return null;
    }
    return <Polygon {...props.polygon} fillColor="transparent" />;
};
