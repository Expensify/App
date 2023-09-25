import {OSAndName} from "./getOSAndName/types";

export type BaseInfo = {
    app_version: string;
    timestamp: string;
};

export type GetDeviceInfo = () => DeviceInfo;
export type DeviceInfo = BaseInfo & OSAndName & {os?: string, device_name?: string, device_version?: string};
export type GetBaseInfo = () => BaseInfo;
