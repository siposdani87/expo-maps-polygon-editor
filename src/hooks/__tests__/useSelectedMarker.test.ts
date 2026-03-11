/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useSelectedMarker } from '../useSelectedMarker';

describe('useSelectedMarker', () => {
    it('should initialize with null selectedMarkerIndex', () => {
        const { result } = renderHook(() => useSelectedMarker());
        expect(result.current.selectedMarkerIndex).toBeNull();
    });

    it('should update selectedMarkerIndex', () => {
        const { result } = renderHook(() => useSelectedMarker());
        act(() => {
            result.current.setSelectedMarkerIndex(3);
        });
        expect(result.current.selectedMarkerIndex).toBe(3);
    });

    it('should return true for isSelectedMarker when index matches', () => {
        const { result } = renderHook(() => useSelectedMarker());
        act(() => {
            result.current.setSelectedMarkerIndex(5);
        });
        expect(result.current.isSelectedMarker(5)).toBe(true);
    });

    it('should return false for isSelectedMarker when index does not match', () => {
        const { result } = renderHook(() => useSelectedMarker());
        act(() => {
            result.current.setSelectedMarkerIndex(5);
        });
        expect(result.current.isSelectedMarker(3)).toBe(false);
    });

    it('should return false for isSelectedMarker when null', () => {
        const { result } = renderHook(() => useSelectedMarker());
        expect(result.current.isSelectedMarker(0)).toBe(false);
        expect(result.current.isSelectedMarker(null)).toBe(true);
    });
});
