import {useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import toggleTestToolsModal from '../../libs/actions/TestTool';
import CustomDevMenuElement from './types';

const CustomDevMenu: CustomDevMenuElement = () => {
    useEffect(() => {
        DevMenu.addItem('Open Test Preferences', toggleTestToolsModal);
    }, []);

    return null;
};

CustomDevMenu.displayName = 'CustomDevMenu';

export default CustomDevMenu;
