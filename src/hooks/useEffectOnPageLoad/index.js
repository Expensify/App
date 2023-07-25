import {useEffect, useRef} from 'react';

export default function useEffectOnPageLoad(onPageLoad, dependencies = []) {
    const onPageLoadRef = useRef(onPageLoad);
    onPageLoadRef.current = onPageLoad;

    useEffect(() => {
        function onPageLoadCallback() {
            onPageLoadRef.current();
        }

        if (document.readyState === 'complete') {
            onPageLoadCallback();
        } else {
            window.addEventListener('load', onPageLoadCallback);
            return () => window.removeEventListener('load', onPageLoadCallback);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}
