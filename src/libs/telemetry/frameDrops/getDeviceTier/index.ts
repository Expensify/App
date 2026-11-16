import CONST from '@src/CONST';

import type GetDeviceTier from './types';

// Frame drops are only measured on native.
const getDeviceTier: GetDeviceTier = () => CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER.UNKNOWN;

export default getDeviceTier;
