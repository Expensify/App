import React, {useEffect} from 'react';
import StatusBar from '../../libs/StatusBar';
import themeColors from '../../styles/themes/default';

function CustomStatusBar() {
    useEffect(() => {
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor(themeColors.appBG);
    }, []);
    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;
