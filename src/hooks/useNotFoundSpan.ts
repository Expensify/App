import {useContext, useEffect} from 'react';
import {Platform} from 'react-native';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

export default function useNotFoundSpan() {
    const {initialURL} = useContext(InitialURLContext);

    useEffect(() => {
        let isDeeplink = false;
        let currentUrl = '';

        if (Platform.OS === 'web') {
            currentUrl = window.location.href;
            isDeeplink = currentUrl === initialURL;
        } else {
            isDeeplink = !!initialURL;
            currentUrl = Navigation.getActiveRoute() || '';
        }

        const navigationSource = isDeeplink ? 'deeplink' : 'button';

        startSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE, {
            name: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            op: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            attributes: {
                url: currentUrl,
                navigation_source: navigationSource,
            },
        });

        let spanEnded = false;
        const endSpanSafely = () => {
            if (!spanEnded) {
                spanEnded = true;
                endSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE);
            }
        };

        const timeoutId = setTimeout(() => {
            endSpanSafely();
        }, 5000);

        // Handle page unload on web (closing tab/window, full page reload) - fallback
        const handleBeforeUnload = () => {
            endSpanSafely();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            clearTimeout(timeoutId);
            endSpanSafely();

            if (typeof window !== 'undefined') {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        };
    }, []);
}
