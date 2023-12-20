import {OSAndName} from './getOSAndName/types';

type BaseInfo = {
    appVersion: string;
    timestamp: string;
};

type GetDeviceInfo = () => DeviceInfo;
type DeviceInfo = BaseInfo & OSAndName & {os?: string; deviceName?: string; deviceVersion?: string};
type GetBaseInfo = () => BaseInfo;

export type {GetDeviceInfo, DeviceInfo, GetBaseInfo, BaseInfo};
