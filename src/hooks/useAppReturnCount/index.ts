import Visibility from '@libs/Visibility';

import {useEffect, useState} from 'react';

/** Counts returns to the app. On web that is the browser tab becoming visible again. */
function useAppReturnCount(): number {
    const [returnCount, setReturnCount] = useState(0);

    useEffect(
        () =>
            Visibility.onVisibilityChange(() => {
                if (!Visibility.isVisible()) {
                    return;
                }
                setReturnCount((count) => count + 1);
            }),
        [],
    );

    return returnCount;
}

export default useAppReturnCount;
