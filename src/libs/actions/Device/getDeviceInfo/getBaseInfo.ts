import packageConfig from '../../../../../package.json';
import {OSAndName} from "./getOSAndName/index.native";

export type BaseInfo = {
    app_version: string;
    timestamp: string;
};

export type DeviceInfo = BaseInfo & OSAndName & {os?: string, device_name?: string, device_version?: string};

export default function getBaseInfo(): BaseInfo {
    return {
        app_version: packageConfig.version,
        timestamp: new Date().toISOString().slice(0, 19),
    };
}
