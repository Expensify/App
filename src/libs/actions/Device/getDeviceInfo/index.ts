import getBaseInfo from './getBaseInfo';
import getOSAndName from "./getOSAndName/index";
import {GetDeviceInfo} from "./types";

const getDeviceInfo: GetDeviceInfo = () => {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
    };
}

export default getDeviceInfo;
