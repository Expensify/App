import React, {useState} from 'react';

import {CustomStatusBarAndBackgroundProvider} from './CustomStatusBarAndBackgroundContext';

function CustomStatusBarAndBackgroundContextProvider({children}: React.PropsWithChildren) {
    const [isRootStatusBarEnabled, setRootStatusBarEnabled] = useState(true);

    const stateValue = {
        isRootStatusBarEnabled,
    };

    const actionsValue = {
        setRootStatusBarEnabled,
    };

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
