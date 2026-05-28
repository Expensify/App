import {decodeGpsCoordinates, getRoutesFromEncodedGpsCoordinates} from '@libs/GPSDraftDetailsUtils';

const GPS2_MAGIC = 'GPS2';

type GpsPoint = {lat: number; lng: number};
type GpsSegments = GpsPoint[][];

/** Builds a GPS2 base64 blob matching Web-Expensify encodeGpsCoordinates / pack('dd'). */
function encodeGps2ForTest(segments: GpsSegments): string {
    const byteLength = 4 + 4 + segments.reduce((sum, segment) => sum + 4 + segment.length * 16, 0);
    const buffer = new ArrayBuffer(byteLength);
    const view = new DataView(buffer);
    let offset = 0;

    for (let i = 0; i < GPS2_MAGIC.length; i++) {
        view.setUint8(offset + i, GPS2_MAGIC.charCodeAt(i));
    }
    offset += 4;

    view.setUint32(offset, segments.length, true);
    offset += 4;

    for (const segment of segments) {
        view.setUint32(offset, segment.length, true);
        offset += 4;

        for (const point of segment) {
            view.setFloat64(offset, point.lat, true);
            view.setFloat64(offset + 8, point.lng, true);
            offset += 16;
        }
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

describe('decodeGpsCoordinates', () => {
    it('decodes a single-segment GPS2 payload', () => {
        const segments: GpsSegments = [
            [
                {lat: 37.7749, lng: -122.4194},
                {lat: 37.775, lng: -122.42},
            ],
        ];
        const encoded = encodeGps2ForTest(segments);

        expect(decodeGpsCoordinates(encoded)).toEqual(segments);
    });

    it('decodes multiple segments with different point counts', () => {
        const segments: GpsSegments = [
            [
                {lat: 37.7749, lng: -122.4194},
                {lat: 37.775, lng: -122.42},
            ],
            [{lat: 40.7128, lng: -74.006}],
        ];
        const encoded = encodeGps2ForTest(segments);

        const decoded = decodeGpsCoordinates(encoded);

        expect(decoded).toHaveLength(2);
        expect(decoded.at(0)).toHaveLength(2);
        expect(decoded.at(1)).toHaveLength(1);
        expect(decoded.at(0)?.at(0)).toEqual({lat: 37.7749, lng: -122.4194});
        expect(decoded.at(1)?.at(0)).toEqual({lat: 40.7128, lng: -74.006});
    });

    it('returns empty array when magic is not GPS2', () => {
        const buffer = new ArrayBuffer(12);
        const view = new DataView(buffer);
        view.setUint8(0, 'G'.charCodeAt(0));
        view.setUint8(1, 'P'.charCodeAt(0));
        view.setUint8(2, 'S'.charCodeAt(0));
        view.setUint8(3, '1'.charCodeAt(0));
        view.setUint32(4, 1, true);
        view.setUint32(8, 0, true);
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        expect(decodeGpsCoordinates(btoa(binary))).toEqual([]);
    });

    it('returns empty array when payload is too short', () => {
        expect(decodeGpsCoordinates(btoa('GPS'))).toEqual([]);
        expect(decodeGpsCoordinates('')).toEqual([]);
    });
});

describe('getRoutesFromEncodedGpsCoordinates', () => {
    it('maps each segment to a separate polyline with lng/lat order', () => {
        const segments: GpsSegments = [
            [
                {lat: 10, lng: 20},
                {lat: 11, lng: 21},
            ],
            [{lat: 30, lng: 40}],
        ];
        const encoded = encodeGps2ForTest(segments);

        const routes = getRoutesFromEncodedGpsCoordinates(encoded, 1500);

        expect(routes.route0.geometry.type).toBe('LineString');
        expect(routes.route0.geometry.coordinates).toEqual([
            [
                [20, 10],
                [21, 11],
            ],
            [[40, 30]],
        ]);
        expect(routes.route0.distance).toBe(1500);
    });

    it('returns empty coordinates for invalid GPS2 payloads', () => {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setUint8(0, 'B'.charCodeAt(0));
        view.setUint8(1, 'A'.charCodeAt(0));
        view.setUint8(2, 'D'.charCodeAt(0));
        view.setUint8(3, '0'.charCodeAt(0));
        view.setUint32(4, 1, true);
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        const routes = getRoutesFromEncodedGpsCoordinates(btoa(binary));

        expect(routes.route0.geometry.coordinates).toEqual([]);
        expect(routes.route0.distance).toBeNull();
    });

    it('returns null distance when distanceInMeters is omitted', () => {
        const encoded = encodeGps2ForTest([[{lat: 1, lng: 2}]]);

        const routes = getRoutesFromEncodedGpsCoordinates(encoded);

        expect(routes.route0.distance).toBeNull();
        expect(routes.route0.geometry.coordinates).toEqual([[[2, 1]]]);
    });
});
