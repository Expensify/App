import CONST from '@src/CONST';

function getDownloadFolderPathSuffixForIOS(environment: string) {
    let folderSuffix = '';

    switch (environment) {
        case CONST.ENVIRONMENT.PRODUCTION:
            folderSuffix = '';
            break;
        case CONST.ENVIRONMENT.ADHOC:
            folderSuffix = CONST.ENVIRONMENT_SUFFIX.ADHOC;
            break;
        case CONST.ENVIRONMENT.DEV:
            folderSuffix = CONST.ENVIRONMENT_SUFFIX.DEV;
            break;
        default:
            folderSuffix = '';
            break;
    }

    return folderSuffix;
}

export default getDownloadFolderPathSuffixForIOS;
