/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useDisabled } from '../useDisabled';

describe('useDisabled', () => {
    it('should return false when oldDisabled is undefined', () => {
        const onDisabled = jest.fn();
        const { result } = renderHook(() => useDisabled(onDisabled, undefined));
        expect(result.current).toBe(false);
        expect(onDisabled).not.toHaveBeenCalled();
    });

    it('should return false when oldDisabled is false', () => {
        const onDisabled = jest.fn();
        const { result } = renderHook(() => useDisabled(onDisabled, false));
        expect(result.current).toBe(false);
        expect(onDisabled).not.toHaveBeenCalled();
    });

    it('should return true and call onDisabled when oldDisabled is true', () => {
        const onDisabled = jest.fn();
        const { result } = renderHook(() => useDisabled(onDisabled, true));
        expect(result.current).toBe(true);
        expect(onDisabled).toHaveBeenCalledTimes(1);
    });

    it('should update when oldDisabled changes', () => {
        const onDisabled = jest.fn();
        const { result, rerender } = renderHook(
            ({ disabled }) => useDisabled(onDisabled, disabled),
            { initialProps: { disabled: false } },
        );
        expect(result.current).toBe(false);

        rerender({ disabled: true });
        expect(result.current).toBe(true);
        expect(onDisabled).toHaveBeenCalled();
    });
});
