import {UAParser} from 'ua-parser-js';

export default function getOSAndName() {
    const parser = new UAParser();
    const result = parser.getResult();
    return {
        os: result.os.name,
        os_version: result.os.version,
        device_name: result.browser.name,
        device_version: result.browser.version,
    };
}
