import shouldLightFlashWithTorch, {getTorchFallbackReason, TORCH_SETTLE_MS} from '@pages/iou/request/step/IOURequestStepScan/utils/shouldLightFlashWithTorch';

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

    it('keeps the flash photo where the torch-lit snapshot would not be upgraded', () => {
        // Given multi-scan and the scan paths without the photo upgrade, which would keep the snapshot as the receipt
        // When the capture mode is decided
        // Then the torch stays off and the flash photo is kept
        expect(shouldLightFlashWithTorch({...ALL_MET, isMultiScanEnabled: true})).toBe(false);
        expect(shouldLightFlashWithTorch({...ALL_MET, canUpgradeReceiptQuality: false})).toBe(false);
    });

    it('keeps the flash photo outside the beta and on phones without a torch', () => {
        // Given the beta off, and separately a phone with a flash but no torch
        // When the capture mode is decided
        // Then the torch stays off
        expect(shouldLightFlashWithTorch({...ALL_MET, isBetaEnabled: false})).toBe(false);
        expect(shouldLightFlashWithTorch({...ALL_MET, hasTorch: false})).toBe(false);
    });

    it('never turns the torch on when flash is off or unavailable', () => {
        // Given flash turned off, and separately a phone without a flash
        // When the capture mode is decided
        // Then the torch stays off
        expect(shouldLightFlashWithTorch({...ALL_MET, flash: false})).toBe(false);
        expect(shouldLightFlashWithTorch({...ALL_MET, hasFlash: false})).toBe(false);
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
