import { useContext, useEffect, useRef } from 'react';
import { MapContext, LatLng } from './MapView';

// Extend globalThis to include Google Maps types
declare global {
    interface Window {
        google: any;
    }
}

export interface MapPolygonProps {
    coordinates: LatLng[];
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    tappable?: boolean;
    onPress?: (event?: any) => void;
}

export const Polygon = (props: MapPolygonProps) => {
    const { map } = useContext(MapContext);
    const polygonRef = useRef<any>(null);
    const listenerRef = useRef<any>(null);

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
                (e: any) => {
                    // Create an event object that matches what PolygonEditor expects
                    const syntheticEvent = {
                        stopPropagation: () => {
                            if (e.stop) {
                                e.stop();
                            }
                        },
                        nativeEvent: e,
                    };
                    props.onPress?.(syntheticEvent as any);
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
