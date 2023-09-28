// @TODO cleanup - file was made from MoneyRequestSelectorPage
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../../../CONST';
import TabSelector from '../../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../../libs/Navigation/OnyxTabNavigator';
import IOURequestCreateTabDistance from './tab/IOURequestCreateTabDistance';
import IOURequestCreateTabManual from './tab/IOURequestCreateTabManual';
import IOURequestCreateTabScan from './tab/IOURequestCreateTabScan';

const propTypes = {
    /** The type of IOU being created */
    iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,
};

function IOURequestCreate({shouldDisplayDistanceTab, iouType}) {
    return (
        <OnyxTabNavigator
            id={CONST.TAB.RECEIPT_TAB_ID}
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
                component={IOURequestCreateTabManual}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.SCAN}
                component={IOURequestCreateTabScan}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.DISTANCE}
                component={IOURequestCreateTabDistance}
                options={{iouType}}
            />
        </OnyxTabNavigator>
    );
}

IOURequestCreate.displayName = 'IOURequestCreate';
IOURequestCreate.propTypes = propTypes;

export default IOURequestCreate;
