import shouldLightFlashWithTorch, {getTorchFallbackReason, getTorchModeProp, TORCH_SETTLE_MS} from '@pages/iou/request/step/IOURequestStepScan/utils/shouldLightFlashWithTorch';

const mockPlatformConfig = {canLightFlashWithTorch: true};

jest.mock('@libs/cameraCapture/platformConfig', () => ({
    __esModule: true,
    get default() {
        return mockPlatformConfig;
    },
}));

const ALL_MET = {flash: true, hasFlash: true, hasTorch: true, isBetaEnabled: true, isMultiScanEnabled: false, canUpgradeReceiptQuality: true};

describe('shouldLightFlashWithTorch', () => {
    beforeEach(() => {
        mockPlatformConfig.canLightFlashWithTorch = true;
    });

    it('lights a single flash scan with the torch on a platform that can take snapshots', () => {
        // Given flash on, a phone with a torch, the beta on and a scan that gets the photo upgrade
        // When the capture mode is decided
        // Then the torch lights it, so the capture can be a fast snapshot
        expect(shouldLightFlashWithTorch(ALL_MET)).toBe(true);
    });

    it.each([
        ['flash is off', {flash: false}],
        ['the phone has no flash', {hasFlash: false}],
        ['the phone has no torch', {hasTorch: false}],
        ['the beta is off', {isBetaEnabled: false}],
        ['multi-scan is on, which skips the photo upgrade', {isMultiScanEnabled: true}],
        ['the screen has no photo upgrade', {canUpgradeReceiptQuality: false}],
    ])('keeps the flash photo when %s', (_, override) => {
        // Given one condition for the torch path is missing
        // When the capture mode is decided
        // Then the torch stays off, because without it, or without the upgrade, the snapshot would be dark or final
        expect(shouldLightFlashWithTorch({...ALL_MET, ...override})).toBe(false);
    });

    it('keeps the flash photo on iOS, which has no snapshot', () => {
        // Given the iOS camera, where every capture is a full photo
        mockPlatformConfig.canLightFlashWithTorch = false;

        // When the capture mode is decided
        // Then the torch stays off
        expect(shouldLightFlashWithTorch(ALL_MET)).toBe(false);
    });
});

describe('getTorchFallbackReason', () => {
    it('lets the capture rely on the torch once it is on and the exposure had time to adjust', () => {
        // Given the camera reports the torch on, requested longer ago than the settle time
        // When the shutter is pressed
        // Then nothing holds the torch-lit snapshot back
        expect(getTorchFallbackReason({torchMode: 'on', msSinceTorchRequested: TORCH_SETTLE_MS})).toBeUndefined();
    });

    it('falls back to the flash photo when the torch is not actually on', () => {
        // Given the torch was requested, but the camera reports it off, e.g. it failed, was refused, or the session
        // restarted without it, or the camera is not ready yet
        // When the shutter is pressed
        // Then the capture must not count on the torch
        expect(getTorchFallbackReason({torchMode: 'off', msSinceTorchRequested: 10_000})).toBe('not_lit');
        expect(getTorchFallbackReason({torchMode: undefined, msSinceTorchRequested: 10_000})).toBe('not_lit');
    });

    it('falls back to the flash photo when the shutter is pressed right after turning flash on', () => {
        // Given the torch just came on, before the preview's exposure adjusted to it
        // When the shutter is pressed
        // Then a snapshot would still be dark, so the capture does not count on the torch
        expect(getTorchFallbackReason({torchMode: 'on', msSinceTorchRequested: TORCH_SETTLE_MS - 1})).toBe('settling');
    });
});

describe('getTorchModeProp', () => {
    it('sends no torch mode to a camera without a torch, and on or off to one with a torch', () => {
        // Given a camera with no flash unit, where CameraX rejects any torch call, and a camera with a torch
        // When the torch mode prop is chosen
        // Then the torch-less camera gets none, so it never errors on start, and the other always gets one, so flash off turns the torch off
        expect(getTorchModeProp(false, true)).toBeUndefined();
        expect(getTorchModeProp(true, true)).toBe('on');
        expect(getTorchModeProp(true, false)).toBe('off');
    });
});
