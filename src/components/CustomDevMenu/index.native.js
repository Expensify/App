import {useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import toggleTestToolsModal from '@userActions/TestTool';

function CustomDevMenu() {
    useEffect(() => {
        DevMenu.addItem('Open Test Preferences', toggleTestToolsModal);
    }, []);

    return null;
}

CustomDevMenu.displayName = 'CustomDevMenu';

export default CustomDevMenu;
