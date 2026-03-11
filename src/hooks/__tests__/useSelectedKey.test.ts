/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useSelectedKey } from '../useSelectedKey';
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

describe('useSelectedKey', () => {
    it('should initialize with null selectedKey', () => {
        const { result } = renderHook(() => useSelectedKey(polygons));
        const [selectedKey] = result.current;
        expect(selectedKey).toBeNull();
    });

    it('should select polygon by key', () => {
        const { result } = renderHook(() => useSelectedKey(polygons));
        act(() => {
            const [, , selectPolygonByKey] = result.current;
            selectPolygonByKey('poly-a');
        });
        expect(result.current[0]).toBe('poly-a');
    });

    it('should select polygon by index', () => {
        const { result } = renderHook(() => useSelectedKey(polygons));
        act(() => {
            const [, , , selectPolygonByIndex] = result.current;
            selectPolygonByIndex(1);
        });
        expect(result.current[0]).toBe('poly-b');
    });

    it('should not re-set the same key', () => {
        const { result } = renderHook(() => useSelectedKey(polygons));
        act(() => {
            result.current[2]('poly-a');
        });
        expect(result.current[0]).toBe('poly-a');
        // Selecting the same key again should not cause issues
        act(() => {
            result.current[2]('poly-a');
        });
        expect(result.current[0]).toBe('poly-a');
    });

    it('should allow direct setSelectedKey', () => {
        const { result } = renderHook(() => useSelectedKey(polygons));
        act(() => {
            result.current[1]('poly-b');
        });
        expect(result.current[0]).toBe('poly-b');
    });
});
