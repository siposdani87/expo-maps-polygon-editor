import React, {
    createContext,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { View, StyleSheet } from 'react-native';

// Extend globalThis to include Google Maps types
declare global {
    interface Window {
        google: any;
    }
}

// Get API key from environment variable
const getGoogleMapsApiKey = (): string => {
    if (
        typeof process !== 'undefined' &&
        process.env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    ) {
        return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    }
    console.warn(
        'Google Maps API key not found in process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
    );
    return 'YOUR_GOOGLE_MAPS_API_KEY';
};

const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

// Load Google Maps API script dynamically
const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (
            typeof window !== 'undefined' &&
            window.google &&
            window.google.maps
        ) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
};

// Create a Context to share the map instance
interface MapContextValue {
    map: any | null;
}

export const MapContext = createContext<MapContextValue>({ map: null });

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface Region extends LatLng {
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface MapPressEvent {
    nativeEvent: {
        coordinate: LatLng;
    };
}

interface MapViewProps {
    style?: any;
    initialRegion?: Region;
    onPress?: (event: MapPressEvent) => void;
    children?: React.ReactNode;
}

const MapView = forwardRef((props: MapViewProps, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
        fitToCoordinates: (
            coordinates: LatLng[],
            options?: { edgePadding?: any; animated?: boolean },
        ) => {
            if (!mapRef.current || coordinates.length === 0) {
                return;
            }

            const bounds = new window.google.maps.LatLngBounds();
            coordinates.forEach((coord) => {
                bounds.extend({
                    lat: coord.latitude,
                    lng: coord.longitude,
                });
            });

            mapRef.current.fitBounds(bounds, options?.edgePadding);
        },
    }));

    useEffect(() => {
        loadGoogleMapsScript()
            .then(() => {
                if (mapContainerRef.current) {
                    const map = new window.google.maps.Map(
                        mapContainerRef.current,
                        {
                            center: props.initialRegion
                                ? {
                                      lat: props.initialRegion.latitude,
                                      lng: props.initialRegion.longitude,
                                  }
                                : { lat: 0, lng: 0 },
                            zoom: 10,
                        },
                    );

                    map.addListener('click', (e: any) => {
                        if (props.onPress && e.latLng) {
                            props.onPress({
                                nativeEvent: {
                                    coordinate: {
                                        latitude: e.latLng.lat(),
                                        longitude: e.latLng.lng(),
                                    },
                                },
                            });
                        }
                    });

                    mapRef.current = map;
                    setIsLoaded(true);
                }
            })
            .catch((error) => {
                console.error('Error loading Google Maps:', error);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue = useMemo(
        () => ({ map: mapRef.current }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isLoaded],
    );

    return (
        <View style={[styles.container, props.style]}>
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%' }}
            />
            <MapContext.Provider value={contextValue}>
                {isLoaded && props.children}
            </MapContext.Provider>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MapView;
