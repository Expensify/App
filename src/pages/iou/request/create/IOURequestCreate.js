// TODO: cleanup - file was made from MoneyRequestSelectorPage
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import CONST from '../../../../CONST';
import TabSelector from '../../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../../libs/Navigation/OnyxTabNavigator';
import IOURequestCreateTabScan from './tab/IOURequestCreateTabScan';
import ONYXKEYS from '../../../../ONYXKEYS';
import IOURequestStepAmount from '../step/IOURequestStepAmount';
import IOURequestStepDistance from '../step/IOURequestStepDistance';

const propTypes = {
    /** The tab to select by default (whatever the user visited last) */
    selectedTab: PropTypes.string,
};

const defaultProps = {
    selectedTab: CONST.TAB_REQUEST.MANUAL,
};

function IOURequestCreate({selectedTab}) {
    return (
        <OnyxTabNavigator
            id={CONST.TAB.IOU_REQUEST_TYPE}
            selectedTab={selectedTab}
            tabBar={({state, navigation, position}) => (
                <TabSelector
                    state={state}
                    navigation={navigation}
                    position={position}
                />
            )}
        >
            <TopTab.Screen
                name={CONST.TAB_REQUEST.MANUAL}
                component={IOURequestStepAmount}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.SCAN}
                component={IOURequestCreateTabScan}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.DISTANCE}
                component={IOURequestStepDistance}
            />
        </OnyxTabNavigator>
    );
}

IOURequestCreate.propTypes = propTypes;
IOURequestCreate.defaultProps = defaultProps;
IOURequestCreate.displayName = 'IOURequestCreate';

export default withOnyx({
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`,
    },
})(IOURequestCreate);
