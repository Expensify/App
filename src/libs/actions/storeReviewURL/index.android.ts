import CONST from '@src/CONST';

export default function getStoreReviewURL(): string | null {
    const androidStoreLink = CONST.APP_DOWNLOAD_LINKS?.ANDROID ?? null;
    if (!androidStoreLink) {
        return null;
    }
    const match = androidStoreLink.match(/id=([^&]+)/);
    const packageName = match?.[1];
    return packageName ? `market://details?id=${packageName}` : androidStoreLink;
}


