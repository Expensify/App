import {useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import toggleTestToolsModal from '@userActions/TestTool';
import CustomDevMenuElement from './types';

const CustomDevMenu: CustomDevMenuElement = Object.assign(
    () => {
        useEffect(() => {
            DevMenu.addItem('Open Test Preferences', toggleTestToolsModal);
        }, []);
        return <></>;
    },
    {
        displayName: 'CustomDevMenu',
    },
);

export default CustomDevMenu;
