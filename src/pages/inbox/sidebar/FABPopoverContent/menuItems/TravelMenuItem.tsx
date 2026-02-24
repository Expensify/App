import {Str} from 'expensify-common';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import useFABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TRAVEL;

const accountPrimaryLoginSelector = (account: OnyxEntry<OnyxTypes.Account>) => account?.primaryLogin;

type TravelMenuItemProps = {
    activePolicyID: string | undefined;
};

function TravelMenuItem({activePolicyID}: TravelMenuItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Suitcase', 'NewWindow'] as const);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountPrimaryLoginSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const isVisible = !!activePolicy?.isTravelEnabled;

    const {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress} = useFABMenuItem(ITEM_ID, isVisible);

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

    if (!isVisible) {
        return null;
    }

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.BOOK_TRAVEL}
            icon={icons.Suitcase}
            title={translate('travel.bookTravel')}
            iconRight={isTravelEnabled && shouldOpenTravelDotLinkWeb() ? icons.NewWindow : undefined}
            shouldShowRightIcon={!!(isTravelEnabled && shouldOpenTravelDotLinkWeb())}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(() => openTravel()))}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default TravelMenuItem;
