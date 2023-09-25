// @TODO cleanup - file was made from MoneyRequestSelectorPage
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../CONST';
import TabSelector from '../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../libs/Navigation/OnyxTabNavigator';
import CreateIOUStartTabScan from './CreateIOUStartTabScan';
import CreateIOUStartTabManual from './CreateIOUStartTabManual';
import CreateIOUStartTabDistance from './CreateIOUStartTabDistance';

const propTypes = {
    /** The ID of the currently selected tab */
    selectedTab: PropTypes.oneOf(_.values(CONST.TAB_REQUEST)).isRequired,

    /** Whether or not the distance tab should be shown */
    shouldDisplayDistanceTab: PropTypes.bool.isRequired,
};

function CreateIOUStartRequest({selectedTab, shouldDisplayDistanceTab}) {
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
                component={CreateIOUStartTabManual}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.SCAN}
                component={CreateIOUStartTabScan}
            />
            {shouldDisplayDistanceTab && (
                <TopTab.Screen
                    name={CONST.TAB_REQUEST.DISTANCE}
                    component={CreateIOUStartTabDistance}
                />
            )}
        </OnyxTabNavigator>
    );
}

CreateIOUStartRequest.displayName = 'CreateIOUStartRequest';
CreateIOUStartRequest.propTypes = propTypes;

export default CreateIOUStartRequest;
