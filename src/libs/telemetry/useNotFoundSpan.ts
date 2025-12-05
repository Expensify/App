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

        const NAVIGATION_SOURCE = isDeeplink ? 'deeplink' : 'button';

        startSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE, {
            name: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            op: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            attributes: {
                url: currentUrl,
                navigation_source: NAVIGATION_SOURCE,
            },
        });

        endSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE);
    }, []);
}
