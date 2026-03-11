import { useContext, useEffect, useRef } from 'react';
import { MapContext, LatLng } from './MapView';
import './types';

export interface MapPolygonProps {
    coordinates: LatLng[];
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    tappable?: boolean;
    onPress?: (event?: {
        stopPropagation: () => void;
        nativeEvent: google.maps.PolyMouseEvent;
    }) => void;
}

export const Polygon = (props: MapPolygonProps) => {
    const { map } = useContext(MapContext);
    const polygonRef = useRef<google.maps.Polygon | null>(null);
    const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

    // Create polygon when map is available
    useEffect(() => {
        if (!map) {
            return;
        }

        const polygon = new window.google.maps.Polygon({
            map: map,
            paths: props.coordinates.map((coord) => ({
                lat: coord.latitude,
                lng: coord.longitude,
            })),
            strokeColor: props.strokeColor,
            strokeWeight: props.strokeWidth,
            fillColor: props.fillColor,
            clickable: props.tappable,
        });

        polygonRef.current = polygon;

        // Cleanup on unmount
        return () => {
            if (listenerRef.current) {
                window.google.maps.event.removeListener(listenerRef.current);
                listenerRef.current = null;
            }
            polygon.setMap(null);
            polygonRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    // Update click listener when onPress changes
    useEffect(() => {
        if (!polygonRef.current) {
            return;
        }

        // Remove old listener
        if (listenerRef.current) {
            window.google.maps.event.removeListener(listenerRef.current);
            listenerRef.current = null;
        }

        // Add new listener
        if (props.onPress) {
            listenerRef.current = polygonRef.current.addListener(
                'click',
                (e: google.maps.PolyMouseEvent) => {
                    // Create an event object that matches what PolygonEditor expects
                    const syntheticEvent = {
                        stopPropagation: () => {
                            if (e.stop) {
                                e.stop();
                            }
                        },
                        nativeEvent: e,
                    };
                    props.onPress?.(syntheticEvent);
                },
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.onPress]);

    // Update polygon when coordinates or styling change
    useEffect(() => {
        if (!polygonRef.current) {
            return;
        }

        polygonRef.current.setOptions({
            paths: props.coordinates.map((coord) => ({
                lat: coord.latitude,
                lng: coord.longitude,
            })),
            strokeColor: props.strokeColor,
            strokeWeight: props.strokeWidth,
            fillColor: props.fillColor,
            clickable: props.tappable,
        });
    }, [
        props.coordinates,
        props.strokeColor,
        props.strokeWidth,
        props.fillColor,
        props.tappable,
    ]);

    return null;
};
