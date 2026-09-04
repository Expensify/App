import toggleTestToolsModal from '@userActions/TestTool';

import {useEffect} from 'react';
import {DevSettings} from 'react-native';

import type CustomDevMenuElement from './types';

// DevSettings has no API for removing a menu item and the native menu keeps every item it is given, so the entry is
// added once per JS runtime. Adding it per mount duplicated the row on every remount of this component.
let hasAddedTestPreferencesMenuItem = false;

const CustomDevMenu: CustomDevMenuElement = Object.assign(
    () => {
        useEffect(() => {
            if (hasAddedTestPreferencesMenuItem) {
                return;
            }

            hasAddedTestPreferencesMenuItem = true;
            DevSettings.addMenuItem('Open Test Preferences', toggleTestToolsModal);
        }, []);
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    },
    {
        displayName: 'CustomDevMenu',
    },
);

export default CustomDevMenu;
