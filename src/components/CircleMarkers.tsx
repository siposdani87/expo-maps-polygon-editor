import React from 'react';
import { LatLng, MapEvent, Marker } from 'react-native-maps';
import { MapPolygonExtendedProps } from '../lib/types';
import Circle from './Circle';
import RemoverCircle from './RemoverCircle';

export default function CircleMarkers(props: {
    selectedMarkerIndex: number | null;
    polygon: MapPolygonExtendedProps;
    onDragStart: (index: number) => (e: MapEvent) => void;
    onDrag: (index: number) => (e: MapEvent) => void;
    onDragEnd: (index: number) => (e: MapEvent) => void;
    onPress: (index: number) => (e: MapEvent) => void;
}): JSX.Element {
    const isSelectedMarker = (coordIndex: number | null): boolean => {
        return props.selectedMarkerIndex === coordIndex;
    };

    return (
        <>
            {props.polygon.coordinates.map(
                (coordinate: LatLng, coordIndex: number) => (
                    <Marker
                        key={coordIndex}
                        identifier={coordIndex.toString()}
                        coordinate={coordinate}
                        anchor={{ x: 0.5, y: 0.5 }}
                        draggable={!isSelectedMarker(coordIndex)}
                        onDragStart={props.onDragStart(coordIndex)}
                        onDrag={props.onDrag(coordIndex)}
                        onDragEnd={props.onDragEnd(coordIndex)}
                        onPress={props.onPress(coordIndex)}
                        tracksViewChanges={true}
                    >
                        {isSelectedMarker(coordIndex) && <RemoverCircle />}
                        {!isSelectedMarker(coordIndex) && (
                            <Circle
                                size={isSelectedMarker(coordIndex) ? 15 : 8}
                                color={props.polygon.strokeColor}
                            />
                        )}
                    </Marker>
                ),
            )}
        </>
    );
}
