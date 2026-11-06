import type * as WebLocation from '@libs/getClickedTargetLocation/index';
import type * as NativeLocation from '@libs/getClickedTargetLocation/index.native';

import type {View} from 'react-native';

import createMock from '../utils/createMock';

const {default: getClickedTargetLocation} = jest.requireActual<typeof WebLocation>('@libs/getClickedTargetLocation/index.ts');
const {default: getNativeClickedTargetLocation} = jest.requireActual<typeof NativeLocation>('@libs/getClickedTargetLocation/index.native.ts');

describe('getClickedTargetLocation', () => {
    it('returns the web rectangle on the original element receiver', () => {
        // Given a real DOM producer with coordinates that distinguish each rectangle property.
        const target = document.createElement('div');
        const rectangle = createMock<ReturnType<Element['getBoundingClientRect']>>({x: 13, y: 29, top: 29, bottom: 82, left: 13, right: 54, width: 41, height: 53});
        const getRectangle = jest.spyOn(target, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLDivElement) {
            expect(this).toBe(target);
            return rectangle;
        });

        // When the real web implementation reads the clicked element.
        const result = getClickedTargetLocation(target);

        // Then the complete producer result and its method receiver are preserved.
        expect(result).toBe(rectangle);
        expect(result).toMatchObject({top: 29, bottom: 82, left: 13, right: 54, height: 53, x: 13, y: 29});
        expect(getRectangle).toHaveBeenCalledTimes(1);
    });

    it.each([null, undefined])('retains web failure for an absent target %s', (target) => {
        // Given an absent event target, which cannot supply a web rectangle.
        // When web placement is requested.
        // Then absence must not invent a zero-coordinate placement.
        expect(() => getClickedTargetLocation(target)).toThrow(TypeError);
    });

    it('rejects a native host on web without calling its rectangle method', () => {
        // Given a native host fixture with the actual consumed host capability.
        const getRectangle = jest.fn<ReturnType<View['getBoundingClientRect']>, Parameters<View['getBoundingClientRect']>>();
        const host = createMock<View>({getBoundingClientRect: getRectangle});

        // When a native host reaches the web implementation.
        // Then web provenance is required even if the host has a similarly named method.
        expect(() => getClickedTargetLocation(host)).toThrow(TypeError);
        expect(getRectangle).not.toHaveBeenCalled();
    });

    it.each([document.createElement('div'), createMock<View>({}), null, undefined])('returns native zero coordinates for every supported target', (target) => {
        // Given a present host, web event target, or absent target supported by the shared input contract.
        // When the unchanged native implementation executes.
        const result = getNativeClickedTargetLocation(target);

        // Then native popovers remain bottom mounted and do not read web layout.
        expect(result).toEqual({top: 0, bottom: 0, left: 0, right: 0, height: 0, x: 0, y: 0});
    });
});
