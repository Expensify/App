import {useEffect} from 'react';
import useDeepLink from '@hooks/useDeepLink';
import CONST from '@src/CONST';
import {endSpan, startSpan} from './activeSpans';

export default function useAbsentPageSpan() {
    const {isDeeplink, deepLinkUrl} = useDeepLink();

    useEffect(() => {
        const NAVIGATION_SOURCE = isDeeplink ? 'deeplink' : 'button';

        startSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE, {
            name: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            op: CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE,
            attributes: {
                url: deepLinkUrl,
                navigationSource: NAVIGATION_SOURCE,
            },
        });

        endSpan(CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE);
    }, [isDeeplink, deepLinkUrl]);
}
