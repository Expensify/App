import {startTransition, useEffect, useState} from 'react';

/** Whether a tab navigator should render its screens yet. */
function useShouldMountPreloadedTabContent(isInPreloadedTab: boolean): boolean {
    const [hasMountedContent, setHasMountedContent] = useState(() => !isInPreloadedTab);

    useEffect(() => {
        if (hasMountedContent) {
            return;
        }
        startTransition(() => setHasMountedContent(true));
    }, [hasMountedContent]);

    return hasMountedContent || !isInPreloadedTab;
}

export default useShouldMountPreloadedTabContent;
