import CONST from '@src/CONST';

function getDownloadFolderPathSuffixForIOS(environment: string) {
    let folderSuffix = '';

    switch (environment) {
        case CONST.ENVIRONMENT.PRODUCTION:
            folderSuffix = '';
            break;
        case CONST.ENVIRONMENT.ADHOC:
            folderSuffix = ' AdHoc';
            break;
        case CONST.ENVIRONMENT.DEV:
            folderSuffix = ' Dev';
            break;
        default:
            folderSuffix = '';
            break;
    }

    return folderSuffix;
}

export default getDownloadFolderPathSuffixForIOS;
