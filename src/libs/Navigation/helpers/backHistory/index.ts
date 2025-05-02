import {isMobileChrome} from '@libs/Browser';

export default function backHistory() {
    return new Promise<void>((resolve) => {
        if (!isMobileChrome()) {
            resolve();
            return;
        }

        const onPopState = () => {
            window.removeEventListener('popstate', onPopState);
            resolve();
        };

        window.addEventListener('popstate', onPopState);
        window.history.back();
    });
}
