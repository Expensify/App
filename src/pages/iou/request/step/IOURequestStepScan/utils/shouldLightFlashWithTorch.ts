/**
 * Decides when an Android flash scan can use the torch and a snapshot instead of a slow flash photo.
 */
import cameraPlatformConfig from '@libs/cameraCapture/platformConfig';

import type {TorchMode} from 'react-native-vision-camera';

const TORCH_SETTLE_MS = 500;

/** What decides whether a flash capture is lit by the torch and taken as a snapshot */
type TorchForFlashConditions = {
    flash: boolean;
    hasFlash: boolean;
    hasTorch: boolean;
    isBetaEnabled: boolean;
    isMultiScanEnabled: boolean;
    canUpgradeReceiptQuality: boolean;
};

function shouldLightFlashWithTorch({flash, hasFlash, hasTorch, isBetaEnabled, isMultiScanEnabled, canUpgradeReceiptQuality}: TorchForFlashConditions): boolean {
    return cameraPlatformConfig.canLightFlashWithTorch && isBetaEnabled && flash && hasFlash && hasTorch && canUpgradeReceiptQuality && !isMultiScanEnabled;
}

/** What the camera reports at shutter time about a torch that was asked to light the capture */
type TorchReadiness = {
    torchMode: TorchMode | undefined;
    msSinceTorchRequested: number;
};

/**
 * The torch is turned on asynchronously and can fail or be refused (e.g. on low battery), so a capture only relies on
 * it once the camera reports it on and the exposure had time to adjust. Otherwise the flash photo is taken instead.
 */
function getTorchFallbackReason({torchMode, msSinceTorchRequested}: TorchReadiness): 'not_lit' | 'settling' | undefined {
    if (torchMode !== 'on') {
        return 'not_lit';
    }
    if (msSinceTorchRequested < TORCH_SETTLE_MS) {
        return 'settling';
    }
    return undefined;
}

/** CameraX rejects any torch call, even 'off', on a camera without a flash unit. */
function getTorchModeProp(hasTorch: boolean, isTorchOn: boolean): TorchMode | undefined {
    if (!hasTorch) {
        return undefined;
    }
    return isTorchOn ? 'on' : 'off';
}

export default shouldLightFlashWithTorch;
export {getTorchFallbackReason, getTorchModeProp, TORCH_SETTLE_MS};
