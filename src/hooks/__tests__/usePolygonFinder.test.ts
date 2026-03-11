/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { usePolygonFinder } from '../usePolygonFinder';
import { MapPolygonExtendedProps } from '../../lib/types';

const polygons: MapPolygonExtendedProps[] = [
    {
        key: 'poly-a',
        coordinates: [{ latitude: 0, longitude: 0 }],
        strokeColor: '#000',
        fillColor: '#fff',
        strokeWidth: 1,
    },
    {
        key: 'poly-b',
        coordinates: [{ latitude: 1, longitude: 1 }],
        strokeColor: '#000',
        fillColor: '#fff',
        strokeWidth: 1,
    },
];

describe('usePolygonFinder', () => {
    it('should get key by index', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getKeyByIndex(0)).toBe('poly-a');
        expect(result.current.getKeyByIndex(1)).toBe('poly-b');
    });

    it('should return undefined for out-of-bounds index', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getKeyByIndex(99)).toBeUndefined();
    });

    it('should get index by key', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getIndexByKey('poly-a')).toBe(0);
        expect(result.current.getIndexByKey('poly-b')).toBe(1);
    });

    it('should return null for unknown key', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getIndexByKey('unknown')).toBeNull();
    });

    it('should get polygon by key', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getPolygonByKey('poly-a')).toBe(polygons[0]);
        expect(result.current.getPolygonByKey('poly-b')).toBe(polygons[1]);
    });

    it('should return null for unknown polygon key', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getPolygonByKey('unknown')).toBeNull();
    });

    it('should return null for null key', () => {
        const { result } = renderHook(() => usePolygonFinder(polygons));
        expect(result.current.getIndexByKey(null)).toBeNull();
        expect(result.current.getPolygonByKey(null)).toBeNull();
    });
});
