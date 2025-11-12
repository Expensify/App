import CONST from '@src/CONST';

export default function getStoreReviewURL(): string | null {
    const iosStoreLink = CONST.APP_DOWNLOAD_LINKS?.IOS ?? null;
    if (!iosStoreLink) {
        return null;
    }
    const match = iosStoreLink.match(/id(\d+)/);
    const appId = match?.[1];
    return appId ? `itms-apps://itunes.apple.com/app/id${appId}?action=write-review` : iosStoreLink;
}


