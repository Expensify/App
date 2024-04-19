import {useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import toggleTestToolsModal from '@userActions/TestTool';
import type CustomDevMenuElement from './types';

const CustomDevMenu: CustomDevMenuElement = Object.assign(
    () => {
        useEffect(() => {
            DevMenu.addItem('Open Test Preferences', toggleTestToolsModal);
        }, []);
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    },
    {
        displayName: 'CustomDevMenu',
    },
);

export default CustomDevMenu;
