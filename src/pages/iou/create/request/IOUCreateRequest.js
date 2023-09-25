// @TODO cleanup - file was made from MoneyRequestSelectorPage
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../../CONST';
import TabSelector from '../../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../../libs/Navigation/OnyxTabNavigator';
import IOUCreateRequestTabDistance from './tab/IOUCreateRequestTabDistance';
import IOUCreateRequestTabManual from './tab/IOUCreateRequestTabManual';
import IOUCreateRequestTabScan from './tab/IOUCreateRequestTabScan';

const propTypes = {
    /** The ID of the currently selected tab */
    selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)).isRequired,

    /** Whether or not the distance tab should be shown */
    shouldDisplayDistanceTab: PropTypes.bool.isRequired,
};

function IOUCreateRequest({selectedTab, shouldDisplayDistanceTab}) {
    return (
        <OnyxTabNavigator
            id={CONST.TAB.RECEIPT_TAB_ID}
            selectedTab={selectedTab}
            tabBar={({state, navigation, position}) => (
                <TabSelector
                    state={state}
                    navigation={navigation}
                    // @TODO onTabPress={resetMoneyRequestInfo}
                    onTabPress={() => {}}
                    position={position}
                />
            )}
        >
            <TopTab.Screen
                name={CONST.TAB_REQUEST.MANUAL}
                component={IOUCreateRequestTabManual}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.SCAN}
                component={IOUCreateRequestTabScan}
            />
            {shouldDisplayDistanceTab && (
                <TopTab.Screen
                    name={CONST.TAB_REQUEST.DISTANCE}
                    component={IOUCreateRequestTabDistance}
                />
            )}
        </OnyxTabNavigator>
    );
}

IOUCreateRequest.displayName = 'IOUCreateRequest';
IOUCreateRequest.propTypes = propTypes;

export default IOUCreateRequest;
