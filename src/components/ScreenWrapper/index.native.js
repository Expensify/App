import {React, useEffect} from 'react';
import DevMenu from 'react-native-dev-menu';
import {toggleTestToolsModal} from '../../libs/actions/TestTool';
import {propTypes, defaultProps} from './propTypes';
import BaseScreenWrapper from './BaseScreenWrapper';
import withEnvironment from '../withEnvironment';

const ScreenWrapper = (props) => {
    useEffect(() => {
        DevMenu.addItem('Open DevMenu', toggleTestToolsModal);
    }, []);
    
    return (
    <BaseScreenWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
    );
}

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default withEnvironment(ScreenWrapper);