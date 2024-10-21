import getCurrentUrl from './currentUrl';

export default function shouldOpenOnAdminRoom() {
    const url = getCurrentUrl();
    return url ? new URL(url).searchParams.get('openOnAdminRoom') === 'true' : false;
}
