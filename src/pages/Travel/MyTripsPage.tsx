import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {StackScreenProps} from '@react-navigation/stack';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import ManageTrips from './ManageTrips';

type MyTripsPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.MY_TRIPS>;

function MyTripsPage({route}: MyTripsPageProps) {
    const routePolicyID = route.params?.policyID;
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const routePolicy = usePolicy(routePolicyID);
    const isFocused = useIsFocused();
    const {translate} = useLocalize();

    // A personal workspace can never book travel and a workspace the backend rejected is left in Onyx as pending, so
    // either one in the params means the default has moved on. Unknown policies keep resolving to not found.
    const isStalePolicyInParams = routePolicy?.type === CONST.POLICY.TYPE.PERSONAL || routePolicy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const shouldUseDefaultPolicy = !!activePolicyID && activePolicyID !== routePolicyID && isStalePolicyInParams;
    const policyID = shouldUseDefaultPolicy ? activePolicyID : routePolicyID;

    // Rewrite the params too: BookTravelButton builds its sub-routes from the active URL (hasPolicyIDInActiveRoute),
    // so a URL disagreeing with the screen would pass the stale workspace on. SET_PARAMS needs this screen's own key.
    useEffect(() => {
        if (!shouldUseDefaultPolicy || !isFocused) {
            return;
        }

        Navigation.setParams({policyID: activePolicyID}, route.key);
    }, [shouldUseDefaultPolicy, isFocused, activePolicyID, route.key]);

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                testID="MyTripsPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('travel.header')}
                    shouldShowBackButton
                />
                <ManageTrips policyID={policyID} />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MyTripsPage;
export type {MyTripsPageProps};
