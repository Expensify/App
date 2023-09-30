// TODO: cleanup - file was made from MoneyRequestSelectorPage
import React from 'react';
import _ from 'underscore';
import CONST from '../../../../CONST';
import TabSelector from '../../../../components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '../../../../libs/Navigation/OnyxTabNavigator';
import IOURequestCreateTabDistance from './tab/IOURequestCreateTabDistance';
import IOURequestCreateTabManual from './tab/IOURequestCreateTabManual';
import IOURequestCreateTabScan from './tab/IOURequestCreateTabScan';

function IOURequestCreate() {
    return (
        <OnyxTabNavigator
            id={CONST.TAB.IOU_REQUEST_TYPE}
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
                component={IOURequestCreateTabManual}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.SCAN}
                component={IOURequestCreateTabScan}
            />
            <TopTab.Screen
                name={CONST.TAB_REQUEST.DISTANCE}
                component={IOURequestCreateTabDistance}
            />
        </OnyxTabNavigator>
    );
}

IOURequestCreate.displayName = 'IOURequestCreate';

export default IOURequestCreate;
