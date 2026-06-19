import deriveOdometerReceipt from '@libs/OdometerReceipt/deriveOdometerReceipt';
import type {FileObject} from '@src/types/utils/Attachment';

describe('deriveOdometerReceipt', () => {
    describe('empty mode', () => {
        it('returns empty when both images are undefined', () => {
            expect(deriveOdometerReceipt(undefined, undefined)).toEqual({mode: 'empty'});
        });

        it('returns empty when both images are null', () => {
            expect(deriveOdometerReceipt(null, null)).toEqual({mode: 'empty'});
        });

        it('returns empty when one is null and the other undefined', () => {
            expect(deriveOdometerReceipt(null, undefined)).toEqual({mode: 'empty'});
            expect(deriveOdometerReceipt(undefined, null)).toEqual({mode: 'empty'});
        });

        it('returns empty when start is an empty string and end is missing (preserves existing falsy-singleImage behaviour)', () => {
            expect(deriveOdometerReceipt('', undefined)).toEqual({mode: 'empty'});
        });
    });

    describe('single mode', () => {
        it('returns single from start (FileObject) when only start is present', () => {
            const start: FileObject = {uri: 'blob:start', name: 'start.jpg', type: 'image/jpeg'};
            expect(deriveOdometerReceipt(start, null)).toEqual({
                mode: 'single',
                uri: 'blob:start',
                name: 'start.jpg',
                type: 'image/jpeg',
            });
        });

        it('returns single from end (FileObject) when only end is present', () => {
            const end: FileObject = {uri: 'blob:end', name: 'end.jpg', type: 'image/jpeg'};
            expect(deriveOdometerReceipt(undefined, end)).toEqual({
                mode: 'single',
                uri: 'blob:end',
                name: 'end.jpg',
                type: 'image/jpeg',
            });
        });

        it('falls back to "odometer.jpg" when the single FileObject has no name', () => {
            const start: FileObject = {uri: 'blob:start', type: 'image/jpeg'};
            const result = deriveOdometerReceipt(start, null);
            expect(result.mode).toBe('single');
            if (result.mode === 'single') {
                expect(result.name).toBe('odometer.jpg');
            }
        });

        it('falls back to "odometer.jpg" when the single FileObject has an empty name', () => {
            const start: FileObject = {uri: 'blob:start', name: '', type: 'image/jpeg'};
            const result = deriveOdometerReceipt(start, null);
            expect(result.mode).toBe('single');
            if (result.mode === 'single') {
                expect(result.name).toBe('odometer.jpg');
            }
        });

        it('accepts a native string URI path for single mode (derives name from path tail)', () => {
            const result = deriveOdometerReceipt('file:///tmp/start.jpg', null);
            expect(result.mode).toBe('single');
            if (result.mode === 'single') {
                expect(result.uri).toBe('file:///tmp/start.jpg');
                expect(result.name).toBe('start.jpg');
            }
        });

        it('still applies the "odometer.jpg" fallback when the string URI has no usable tail', () => {
            // getOdometerImageName on a string with no slash returns the whole string; on an empty trailing segment it returns ''.
            // Use a value that yields an empty tail to verify the fallback fires.
            const result = deriveOdometerReceipt('file:///', null);
            expect(result.mode).toBe('single');
            if (result.mode === 'single') {
                expect(result.name).toBe('odometer.jpg');
            }
        });
    });

    describe('stitch mode', () => {
        it('returns stitch and passes both FileObjects through unchanged', () => {
            const start: FileObject = {uri: 'blob:start', name: 'start.jpg', type: 'image/jpeg'};
            const end: FileObject = {uri: 'blob:end', name: 'end.jpg', type: 'image/jpeg'};
            const result = deriveOdometerReceipt(start, end);
            expect(result.mode).toBe('stitch');
            if (result.mode === 'stitch') {
                expect(result.startImage).toBe(start);
                expect(result.endImage).toBe(end);
            }
        });

        it('accepts native string URIs for stitch mode', () => {
            const result = deriveOdometerReceipt('file:///tmp/a.jpg', 'file:///tmp/b.jpg');
            expect(result.mode).toBe('stitch');
            if (result.mode === 'stitch') {
                expect(result.startImage).toBe('file:///tmp/a.jpg');
                expect(result.endImage).toBe('file:///tmp/b.jpg');
            }
        });

        it('accepts a mix of FileObject and string', () => {
            const start: FileObject = {uri: 'blob:start', name: 'start.jpg', type: 'image/jpeg'};
            const result = deriveOdometerReceipt(start, 'file:///tmp/b.jpg');
            expect(result.mode).toBe('stitch');
        });
    });
});
