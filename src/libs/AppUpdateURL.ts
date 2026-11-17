/** Shared URL marker for upgrade navigations that must wait for fresh HTML. */
const APP_UPDATE_QUERY_PARAM = 'appUpdateRequired';

function getAppUpdateURL(href: string): string {
    const url = new URL(href);
    url.searchParams.set(APP_UPDATE_QUERY_PARAM, 'true');
    return url.href;
}

export {APP_UPDATE_QUERY_PARAM, getAppUpdateURL};
