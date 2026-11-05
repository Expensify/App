import CONST from '@src/CONST';

import DeviceInfo from 'react-native-device-info';

import type GetDeviceTier from './types';

/**
 * Sentry doesn't attach its device class to metrics, so frame drops are segmented by a tier derived from total RAM.
 * It is an approximation of Sentry's device.class (which also looks at the CPU), close enough to keep slow phones
 * from hiding regressions on fast ones.
 */
const getDeviceTier: GetDeviceTier = () => {
    const totalMemoryBytes = DeviceInfo.getTotalMemorySync?.();
    if (!totalMemoryBytes || totalMemoryBytes <= 0) {
        return CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER.UNKNOWN;
    }
    if (totalMemoryBytes >= CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER_HIGH_MIN_MEMORY_BYTES) {
        return CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER.HIGH;
    }
    if (totalMemoryBytes >= CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER_MEDIUM_MIN_MEMORY_BYTES) {
        return CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER.MEDIUM;
    }
    return CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER.LOW;
};

export default getDeviceTier;
