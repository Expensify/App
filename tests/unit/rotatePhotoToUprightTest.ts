import {getUprightRotation} from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

describe('getUprightRotation', () => {
    it('leaves a photo whose metadata already describes it upright as captured, rather than re-encoding it', () => {
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 90})).toBeUndefined();
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 270})).toBeUndefined();
    });

    it('turns a landscape sensor buffer that carries no rotation of its own', () => {
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 0})).toBe(90);
        expect(getUprightRotation({width: 1920, height: 1440, rotation: 180})).toBe(90);
    });

    it('leaves a photo that is already upright with no metadata alone, rather than re-encoding it', () => {
        // iOS, where react-native-image-size reports the displayed size and no rotation.
        expect(getUprightRotation({width: 2160, height: 2880})).toBeUndefined();
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 0})).toBeUndefined();
    });

    it('leaves an upright photo as captured even when it still carries metadata', () => {
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 180})).toBeUndefined();
    });

    it('still turns a frame that decodes landscape, whatever its metadata says', () => {
        // 1440x1920 asking for 90 decodes as 1920x1440, genuinely on its side.
        expect(getUprightRotation({width: 1440, height: 1920, rotation: 90})).toBe(90);
    });

    it('turns a sideways frame the way the capture was oriented', () => {
        // Given landscape frames saved without a rotation tag, captured with the sensor turned either way
        const size = {width: 1920, height: 1440, rotation: 0};

        // When the upright rotation is derived from each capture's orientation
        const leftTurn = getUprightRotation(size, 'left');
        const rightTurn = getUprightRotation(size, 'right');

        // Then each turns its own way, so a photo taken in the opposite hold is not saved upside down
        expect(leftTurn).toBe(90);
        expect(rightTurn).toBe(270);
    });

    it('leaves a square photo with no metadata alone', () => {
        expect(getUprightRotation({width: 1440, height: 1440, rotation: 0})).toBeUndefined();
    });
});
