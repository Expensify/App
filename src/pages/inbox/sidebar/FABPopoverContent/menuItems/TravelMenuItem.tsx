import {Str} from 'expensify-common';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {emailSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TRAVEL;

const accountPrimaryLoginSelector = (account: OnyxEntry<OnyxTypes.Account>) => account?.primaryLogin;

function TravelMenuItem() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Suitcase', 'NewWindow'] as const);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountPrimaryLoginSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const isVisible = !!activePolicy?.isTravelEnabled;

    const isTravelEnabled = (() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(activePolicy)) {
            return false;
        }
        const isPolicyProvisioned = activePolicy?.travelSettings?.spotnanaCompanyID ?? activePolicy?.travelSettings?.associatedTravelDomainAccountID;
        return activePolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    })();

    const openTravel = () => {
        if (isTravelEnabled) {
            openTravelDotLink(activePolicy?.id);
            return;
        }
        Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicy?.id));
    };

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.BOOK_TRAVEL}
            icon={icons.Suitcase}
            title={translate('travel.bookTravel')}
            iconRight={isTravelEnabled && shouldOpenTravelDotLinkWeb() ? icons.NewWindow : undefined}
            shouldShowRightIcon={!!(isTravelEnabled && shouldOpenTravelDotLinkWeb())}
            onPress={() => interceptAnonymousUser(() => openTravel())}
        />
    );
}

export default TravelMenuItem;
