import React, {useMemo, useState} from 'react';
import CustomStatusBarContext from './CustomStatusBarContext';

function CustomStatusBarContextProvider({children}: React.PropsWithChildren) {
    const [isRootStatusBarDisabled, disableRootStatusBar] = useState(false);
    const value = useMemo(
        () => ({
            isRootStatusBarDisabled,
            disableRootStatusBar,
        }),
        [isRootStatusBarDisabled],
    );

    return <CustomStatusBarContext.Provider value={value}>{children}</CustomStatusBarContext.Provider>;
}

export default CustomStatusBarContextProvider;
