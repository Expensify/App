import CONST from '@src/CONST';

function getDownloadFolderPathSuffixForIOS(environment: string) {
    let folderSuffix = '';

    switch (environment) {
        case CONST.ENVIRONMENT.PRODUCTION:
            folderSuffix = '';
            break;
        case CONST.ENVIRONMENT.ADHOC:
            folderSuffix = CONST.ENVIRONMENT.ADHOC_SUFFIX;
            break;
        case CONST.ENVIRONMENT.DEV:
            folderSuffix = CONST.ENVIRONMENT.DEV_SUFFIX;
            break;
        default:
            folderSuffix = '';
            break;
    }

    return folderSuffix;
}

export default getDownloadFolderPathSuffixForIOS;
