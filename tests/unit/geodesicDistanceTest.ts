import geodesicDistance from '@src/utils/geodesicDistance';

describe('geodesicDistance', () => {
    it('should return 0 when the two points are identical', () => {
        const point = {lat: 52.2297, long: 21.0122};
        const result = geodesicDistance(point, point);
        expect(result).toEqual(0);
    });

    it('should calculate the distance of 1 degree latitude', () => {
        // Calculation: (Earth Radius * 2 * PI) / 360
        // With R = 6371008.8, 1 degree is approx 111,195.08 meters
        const p1 = {lat: 0, long: 0};
        const p2 = {lat: 1, long: 0};

        const result = geodesicDistance(p1, p2);
        expect(result).toBeCloseTo(111195.08);
    });

    it('should calculate the distance of 1 degree longitude at the equator', () => {
        // At the equator, 1 degree longitude equals 1 degree latitude
        const p1 = {lat: 0, long: 0};
        const p2 = {lat: 0, long: 1};

        const result = geodesicDistance(p1, p2);
        expect(result).toBeCloseTo(111195.08);
    });

    it('should be commutative (distance A->B equals distance B->A)', () => {
        const p1 = {lat: 40.7128, long: -74.006}; // NYC
        const p2 = {lat: 51.5074, long: -0.1278}; // London

        const dist1 = geodesicDistance(p1, p2);
        const dist2 = geodesicDistance(p2, p1);

        expect(dist1).toEqual(dist2);
    });
});
