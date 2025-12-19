// Web implementation of react-native-maps
// This file is used by Metro bundler for web platform only
// See metro.config.js for the resolver configuration

export { default } from '../src/web';
export { default as MapView } from '../src/web/MapView';
export { Marker } from '../src/web/Marker';
export { Polygon } from '../src/web/Polygon';
export type { LatLng, Region, MapPressEvent } from '../src/web/MapView';
export type {
    MarkerDragEvent,
    MarkerDragStartEndEvent,
    MarkerPressEvent,
} from '../src/web/Marker';
export type { MapPolygonProps } from '../src/web/Polygon';

// Export PROVIDER_GOOGLE constant for compatibility with react-native-maps API
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
