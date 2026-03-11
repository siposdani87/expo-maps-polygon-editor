import {
    isPointInPolygon,
    getPointFromCoordinate,
    getPolygonFromCoordinates,
    getMidpointFromCoordinates,
} from '../geospatials';

describe('getPointFromCoordinate', () => {
    it('should create a GeoJSON point from LatLng', () => {
        const point = getPointFromCoordinate({
            latitude: 47.5,
            longitude: 19.0,
        });
        expect(point.type).toBe('Feature');
        expect(point.geometry.type).toBe('Point');
        expect(point.geometry.coordinates).toEqual([47.5, 19.0]);
    });
});

describe('getPolygonFromCoordinates', () => {
    it('should return null for fewer than 3 coordinates', () => {
        expect(getPolygonFromCoordinates([])).toBeNull();
        expect(
            getPolygonFromCoordinates([
                { latitude: 0, longitude: 0 },
                { latitude: 1, longitude: 1 },
            ]),
        ).toBeNull();
    });

    it('should create a closed GeoJSON polygon from 3+ coordinates', () => {
        const coordinates = [
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 0 },
            { latitude: 1, longitude: 1 },
        ];
        const polygon = getPolygonFromCoordinates(coordinates);
        expect(polygon).not.toBeNull();
        expect(polygon!.geometry.type).toBe('Polygon');
        // Should close the ring (first point repeated at end)
        const ring = polygon!.geometry.coordinates[0];
        expect(ring).toHaveLength(4);
        expect(ring[0]).toEqual(ring[ring.length - 1]);
    });
});

describe('isPointInPolygon', () => {
    const triangle = [
        { latitude: 0, longitude: 0 },
        { latitude: 10, longitude: 0 },
        { latitude: 5, longitude: 10 },
    ];

    it('should return true for a point inside the polygon', () => {
        expect(isPointInPolygon({ latitude: 5, longitude: 3 }, triangle)).toBe(
            true,
        );
    });

    it('should return false for a point outside the polygon', () => {
        expect(
            isPointInPolygon({ latitude: 20, longitude: 20 }, triangle),
        ).toBe(false);
    });

    it('should return false for fewer than 3 coordinates', () => {
        expect(
            isPointInPolygon({ latitude: 0, longitude: 0 }, [
                { latitude: 0, longitude: 0 },
            ]),
        ).toBe(false);
    });
});

describe('getMidpointFromCoordinates', () => {
    it('should return the midpoint between two coordinates', () => {
        const mid = getMidpointFromCoordinates(
            { latitude: 0, longitude: 0 },
            { latitude: 10, longitude: 10 },
        );
        expect(mid.latitude).toBeCloseTo(5, 0);
        expect(mid.longitude).toBeCloseTo(5, 0);
    });

    it('should return exact point when both coordinates are the same', () => {
        const mid = getMidpointFromCoordinates(
            { latitude: 47.5, longitude: 19.0 },
            { latitude: 47.5, longitude: 19.0 },
        );
        expect(mid.latitude).toBeCloseTo(47.5, 4);
        expect(mid.longitude).toBeCloseTo(19.0, 4);
    });
});
