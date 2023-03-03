import React from 'react';
import PropTypes from 'prop-types';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import * as App from '../libs/actions/App';

/**
 * If we are in the dev environment wrap the children in a gesture detector that opens a test tools modal after 5 taps
 */

const propTypes = {
    /** Children to wrap in TestToolsGestureDetector. */
    children: PropTypes.node.isRequired,

    ...environmentPropTypes,
};

const TestToolsGestureDetector = (props) => {
    const quintupleTap = Gesture.Tap()
        .numberOfTaps(5)

        // Run the callbacks on the JS thread otherwise there's an error on iOS
        .runOnJS(true)
        .onEnd(App.toggleTestToolsModal);

    // The gesture to open the test tools menu should only exist in the dev environment
    if (props.environment === CONST.ENVIRONMENT.DEV) {
        return (
            <GestureDetector gesture={quintupleTap}>
                {props.children}
            </GestureDetector>
        );
    }
    return (
        <>
            {props.children}
        </>
    );
};

TestToolsGestureDetector.propTypes = propTypes;
TestToolsGestureDetector.displayName = 'TestToolsGestureDetector';

export default withEnvironment(TestToolsGestureDetector);
