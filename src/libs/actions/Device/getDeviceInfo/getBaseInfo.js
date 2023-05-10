import {version} from '../../../../../package.json';

export default function getBaseInfo() {
    return {
        app_version: version,
        timestamp: new Date().toISOString().slice(0, 19),
    };
}
