import {React, useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import PropTypes from 'prop-types';
import toggleTestToolsModal from '../../libs/actions/TestTool';

const propTypes = {
    /** Children to wrap in CustomDevMenu */
    children: PropTypes.node.isRequired,
};

const CustomDevMenu = (props) => {
    useEffect(() => {
        DevMenu.addItem('Open Test Preferences', toggleTestToolsModal);
    }, []);

    return props.children;
};

CustomDevMenu.propTypes = propTypes;
CustomDevMenu.displayName = 'CustomDevMenu';

export default CustomDevMenu;
