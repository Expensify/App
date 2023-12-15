import React, {useMemo, useState} from 'react';
import CustomStatusBarAndBackgroundContext from './CustomStatusBarAndBackgroundContext';

function CustomStatusBarAndBackgroundContextProvider({children}: React.PropsWithChildren) {
    const [isRootStatusBarDisabled, disableRootStatusBar] = useState(false);
    const value = useMemo(
        () => ({
            isRootStatusBarDisabled,
            disableRootStatusBar,
        }),
        [isRootStatusBarDisabled],
    );

    return <CustomStatusBarAndBackgroundContext.Provider value={value}>{children}</CustomStatusBarAndBackgroundContext.Provider>;
}

export default CustomStatusBarAndBackgroundContextProvider;
