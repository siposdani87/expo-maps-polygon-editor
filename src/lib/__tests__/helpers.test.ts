import { addCoordinateToPolygon, getMiddleCoordinates } from '../helpers';
import { MapPolygonExtendedProps } from '../types';

const makePolygon = (
    coordinates: { latitude: number; longitude: number }[],
): MapPolygonExtendedProps => ({
    key: 'test-polygon',
    coordinates,
    strokeColor: '#000',
    fillColor: '#fff',
    strokeWidth: 1,
});

describe('addCoordinateToPolygon', () => {
    it('should append coordinate at the end when no index is given', () => {
        const polygon = makePolygon([
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 },
        ]);
        const result = addCoordinateToPolygon(polygon, {
            latitude: 2,
            longitude: 2,
        });
        expect(result.coordinates).toHaveLength(3);
        expect(result.coordinates[2]).toEqual({
            latitude: 2,
            longitude: 2,
        });
    });

    it('should insert coordinate at the given index', () => {
        const polygon = makePolygon([
            { latitude: 0, longitude: 0 },
            { latitude: 2, longitude: 2 },
        ]);
        const result = addCoordinateToPolygon(
            polygon,
            { latitude: 1, longitude: 1 },
            1,
        );
        expect(result.coordinates).toHaveLength(3);
        expect(result.coordinates[1]).toEqual({
            latitude: 1,
            longitude: 1,
        });
    });

    it('should not mutate the original polygon', () => {
        const polygon = makePolygon([{ latitude: 0, longitude: 0 }]);
        const result = addCoordinateToPolygon(polygon, {
            latitude: 1,
            longitude: 1,
        });
        expect(polygon.coordinates).toHaveLength(1);
        expect(result.coordinates).toHaveLength(2);
        expect(result).not.toBe(polygon);
    });

    it('should insert at index 0', () => {
        const polygon = makePolygon([{ latitude: 1, longitude: 1 }]);
        const result = addCoordinateToPolygon(
            polygon,
            { latitude: 0, longitude: 0 },
            0,
        );
        expect(result.coordinates[0]).toEqual({
            latitude: 0,
            longitude: 0,
        });
        expect(result.coordinates[1]).toEqual({
            latitude: 1,
            longitude: 1,
        });
    });
});

describe('getMiddleCoordinates', () => {
    it('should return midpoints for a triangle', () => {
        const coordinates = [
            { latitude: 0, longitude: 0 },
            { latitude: 10, longitude: 0 },
            { latitude: 10, longitude: 10 },
        ];
        const midpoints = getMiddleCoordinates(coordinates);
        // Should return 3 midpoints: between last-first, 0-1, 1-2
        expect(midpoints).toHaveLength(3);
    });

    it('should return midpoints between consecutive vertices and wrap around', () => {
        const coordinates = [
            { latitude: 0, longitude: 0 },
            { latitude: 10, longitude: 0 },
        ];
        const midpoints = getMiddleCoordinates(coordinates);
        // First midpoint: between coord[0] and coord[last] (wrap-around)
        // Second midpoint: between coord[0] and coord[1]
        expect(midpoints).toHaveLength(2);
        expect(midpoints[0].latitude).toBeCloseTo(5, 0);
        expect(midpoints[1].latitude).toBeCloseTo(5, 0);
    });
});
