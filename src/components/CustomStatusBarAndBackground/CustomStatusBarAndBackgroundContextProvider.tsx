import React, {useMemo, useState} from 'react';
import {CustomStatusBarAndBackgroundProvider} from './CustomStatusBarAndBackgroundContext';

function CustomStatusBarAndBackgroundContextProvider({children}: React.PropsWithChildren) {
    const [isRootStatusBarEnabled, setRootStatusBarEnabled] = useState(true);

    const stateValue = useMemo(
        () => ({
            isRootStatusBarEnabled,
        }),
        [isRootStatusBarEnabled],
    );

    const actionsValue = useMemo(
        () => ({
            setRootStatusBarEnabled,
        }),
        [],
    );

    return (
        <CustomStatusBarAndBackgroundProvider
            state={stateValue}
            actions={actionsValue}
        >
            {children}
        </CustomStatusBarAndBackgroundProvider>
    );
}

export default CustomStatusBarAndBackgroundContextProvider;
