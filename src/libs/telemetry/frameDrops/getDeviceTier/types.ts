import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type DeviceTier = ValueOf<typeof CONST.TELEMETRY.FRAME_DROPS.DEVICE_TIER>;

type GetDeviceTier = () => DeviceTier;

export default GetDeviceTier;
export type {DeviceTier};
