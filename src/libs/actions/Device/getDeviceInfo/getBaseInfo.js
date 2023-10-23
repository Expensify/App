import packageConfig from '../../../../../package.json';

export default function getBaseInfo() {
    return {
        app_version: packageConfig.version,
        timestamp: new Date().toISOString().slice(0, 19),
    };
}
