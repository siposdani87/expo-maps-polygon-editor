import { getRandomPolygonColors } from '../colors';

describe('getRandomPolygonColors', () => {
    it('should return a tuple of [strokeColor, fillColor]', () => {
        const result = getRandomPolygonColors();
        expect(result).toHaveLength(2);
    });

    it('should return an rgb string for strokeColor', () => {
        const [strokeColor] = getRandomPolygonColors();
        expect(strokeColor).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it('should return an rgba string with 0.2 alpha for fillColor', () => {
        const [, fillColor] = getRandomPolygonColors();
        expect(fillColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\.2\)$/);
    });

    it('should use the same RGB values for both stroke and fill', () => {
        const [strokeColor, fillColor] = getRandomPolygonColors();
        const rgbMatch = strokeColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
        const rgbaMatch = fillColor.match(/rgba\((\d+), (\d+), (\d+), 0\.2\)/);
        expect(rgbMatch).not.toBeNull();
        expect(rgbaMatch).not.toBeNull();
        expect(rgbMatch![1]).toBe(rgbaMatch![1]);
        expect(rgbMatch![2]).toBe(rgbaMatch![2]);
        expect(rgbMatch![3]).toBe(rgbaMatch![3]);
    });

    it('should generate values in valid RGB range (0-255)', () => {
        // Run multiple times to increase confidence
        for (let i = 0; i < 20; i++) {
            const [strokeColor] = getRandomPolygonColors();
            const match = strokeColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
            expect(match).not.toBeNull();
            const [r, g, b] = [
                parseInt(match![1]),
                parseInt(match![2]),
                parseInt(match![3]),
            ];
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThanOrEqual(255);
            expect(g).toBeGreaterThanOrEqual(0);
            expect(g).toBeLessThanOrEqual(255);
            expect(b).toBeGreaterThanOrEqual(0);
            expect(b).toBeLessThanOrEqual(255);
        }
    });
});
