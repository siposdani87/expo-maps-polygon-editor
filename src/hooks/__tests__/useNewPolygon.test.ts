/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useNewPolygon } from '../useNewPolygon';
import { MapPolygonExtendedProps } from '../../lib/types';

const newPolygonTemplate: MapPolygonExtendedProps = {
    key: 'new-polygon',
    coordinates: [],
    strokeColor: '#ff0000',
    fillColor: '#ff000033',
    strokeWidth: 2,
};

describe('useNewPolygon', () => {
    it('should not build polygon when creation is not started', () => {
        const onPolygonCreate = jest.fn();
        const { result } = renderHook(() =>
            useNewPolygon(newPolygonTemplate, onPolygonCreate),
        );
        const [, , buildPolygon] = result.current;
        act(() => {
            buildPolygon({ latitude: 0, longitude: 0 });
        });
        expect(onPolygonCreate).not.toHaveBeenCalled();
    });

    it('should not call onPolygonCreate until 3 coordinates are added', () => {
        const onPolygonCreate = jest.fn();
        const { result } = renderHook(() =>
            useNewPolygon(newPolygonTemplate, onPolygonCreate),
        );

        act(() => {
            result.current[0](); // startPolygon
        });
        act(() => {
            result.current[2]({ latitude: 0, longitude: 0 });
        });
        expect(onPolygonCreate).not.toHaveBeenCalled();

        act(() => {
            result.current[2]({ latitude: 1, longitude: 0 });
        });
        expect(onPolygonCreate).not.toHaveBeenCalled();
    });

    it('should call onPolygonCreate after 3 coordinates', () => {
        const onPolygonCreate = jest.fn();
        const { result } = renderHook(() =>
            useNewPolygon(newPolygonTemplate, onPolygonCreate),
        );

        act(() => {
            result.current[0](); // startPolygon
        });
        act(() => {
            result.current[2]({ latitude: 0, longitude: 0 });
        });
        act(() => {
            result.current[2]({ latitude: 1, longitude: 0 });
        });
        act(() => {
            result.current[2]({ latitude: 1, longitude: 1 });
        });

        expect(onPolygonCreate).toHaveBeenCalledTimes(1);
        const createdPolygon = onPolygonCreate.mock.calls[0][0];
        expect(createdPolygon.coordinates).toHaveLength(3);
        expect(createdPolygon.key).toBe('new-polygon');
        expect(createdPolygon.strokeColor).toBe('#ff0000');
    });

    it('should not build after reset', () => {
        const onPolygonCreate = jest.fn();
        const { result } = renderHook(() =>
            useNewPolygon(newPolygonTemplate, onPolygonCreate),
        );

        act(() => {
            result.current[0](); // startPolygon
        });
        act(() => {
            result.current[1](); // resetPolygon
        });
        act(() => {
            result.current[2]({ latitude: 0, longitude: 0 });
        });
        expect(onPolygonCreate).not.toHaveBeenCalled();
    });

    it('should not build when newPolygon template is undefined', () => {
        const onPolygonCreate = jest.fn();
        const { result } = renderHook(() =>
            useNewPolygon(undefined, onPolygonCreate),
        );

        act(() => {
            result.current[0](); // startPolygon
        });
        act(() => {
            result.current[2]({ latitude: 0, longitude: 0 });
        });
        expect(onPolygonCreate).not.toHaveBeenCalled();
    });
});
