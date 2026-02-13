import {useEffect, useRef} from 'react';

type UseRenderCountLoggerOptions = {
    enabled?: boolean;
    logEvery?: number;
    extraData?: Record<string, unknown>;
};

function useRenderCountLogger(componentName: string, options?: UseRenderCountLoggerOptions) {
    const {enabled = __DEV__, logEvery = 1, extraData} = options ?? {};
    const renderCount = useRef(0);
    const latestExtraData = useRef(extraData);

    renderCount.current += 1;
    latestExtraData.current = extraData;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (renderCount.current % logEvery !== 0) {
            return;
        }

        // eslint-disable-next-line no-console
        console.log(`[RenderCount] ${componentName} render #${renderCount.current}`, latestExtraData.current ?? '');
    });

    useEffect(
        () => () => {
            if (!enabled) {
                return;
            }

            // eslint-disable-next-line no-console
            console.log(`[RenderCount] ${componentName} unmounted after ${renderCount.current} renders`, latestExtraData.current ?? '');
        },
        [componentName, enabled],
    );
}

export default useRenderCountLogger;
