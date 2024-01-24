import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

export default function updateApp() {
    Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
}
