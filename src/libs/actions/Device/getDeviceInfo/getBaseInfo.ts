import packageConfig from '../../../../../package.json';
import {GetBaseInfo} from "./index";

export type BaseInfo = {
    app_version: string;
    timestamp: string;
};
export const getBaseInfo: GetBaseInfo = (): BaseInfo => {
    return {
        app_version: packageConfig.version,
        timestamp: new Date().toISOString().slice(0, 19),
    };
}

export default getBaseInfo;
