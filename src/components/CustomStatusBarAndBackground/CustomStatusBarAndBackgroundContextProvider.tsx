import React, {useMemo, useState} from 'react';
import CustomStatusBarAndBackgroundContext from './CustomStatusBarAndBackgroundContext';

function CustomStatusBarAndBackgroundContextProvider({children}: React.PropsWithChildren) {
    const [isRootStatusBarEnabled, setRootStatusBarEnabled] = useState(true);
    const value = useMemo(
        () => ({
            isRootStatusBarEnabled,
            setRootStatusBarEnabled,
        }),
        [isRootStatusBarEnabled],
    );

    return <CustomStatusBarAndBackgroundContext.Provider value={value}>{children}</CustomStatusBarAndBackgroundContext.Provider>;
}

export default CustomStatusBarAndBackgroundContextProvider;
