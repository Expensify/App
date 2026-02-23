import {Str} from 'expensify-common';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type TravelMenuItemProps = {
    icons: MenuItemIcons;
    activePolicyID: string | undefined;
    /** Injected by FABPopoverMenu via React.cloneElement */
    itemIndex?: number;
};

const accountPrimaryLoginSelector = (account: OnyxEntry<OnyxTypes.Account>) => account?.primaryLogin;

function useTravelMenuItemVisible(activePolicyID: string | undefined): boolean {
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    return !!activePolicy?.isTravelEnabled;
}

function TravelMenuItem({icons, activePolicyID, itemIndex = -1}: TravelMenuItemProps) {
    const {translate} = useLocalize();
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountPrimaryLoginSelector, canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const {focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

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
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.BOOK_TRAVEL}
            icon={icons.Suitcase}
            title={translate('travel.bookTravel')}
            iconRight={isTravelEnabled && shouldOpenTravelDotLinkWeb() ? icons.NewWindow : undefined}
            shouldShowRightIcon={!!(isTravelEnabled && shouldOpenTravelDotLinkWeb())}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(() => openTravel()))}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export {useTravelMenuItemVisible};
export default TravelMenuItem;
