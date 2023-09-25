import packageConfig from '../../../../../package.json';
import {GetBaseInfo} from "./types";

export const getBaseInfo: GetBaseInfo = () => {
    return {
        app_version: packageConfig.version,
        timestamp: new Date().toISOString().slice(0, 19),
    };
}

export default getBaseInfo;
