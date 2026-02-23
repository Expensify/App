import {Str} from 'expensify-common';
import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type UseTravelMenuItemParams = {
    icons: MenuItemIcons;
    activePolicyID: string | undefined;
};

const accountPrimaryLoginSelector = (account: OnyxEntry<OnyxTypes.Account>) => account?.primaryLogin;

function useTravelMenuItem({icons, activePolicyID}: UseTravelMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountPrimaryLoginSelector, canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';

    const isTravelEnabled = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(activePolicy)) {
            return false;
        }
        const isPolicyProvisioned = activePolicy?.travelSettings?.spotnanaCompanyID ?? activePolicy?.travelSettings?.associatedTravelDomainAccountID;
        return activePolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    }, [activePolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings?.hasAcceptedTerms]);

    const openTravel = useCallback(() => {
        if (isTravelEnabled) {
            openTravelDotLink(activePolicy?.id);
            return;
        }
        Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicy?.id));
    }, [activePolicy?.id, isTravelEnabled]);

    return useMemo(() => {
        if (!activePolicy?.isTravelEnabled) {
            return [];
        }
        return [
            {
                icon: icons.Suitcase,
                text: translate('travel.bookTravel'),
                rightIcon: isTravelEnabled && shouldOpenTravelDotLinkWeb() ? icons.NewWindow : undefined,
                onSelected: () => interceptAnonymousUser(() => openTravel()),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.BOOK_TRAVEL,
            },
        ];
    }, [activePolicy?.isTravelEnabled, icons.Suitcase, icons.NewWindow, translate, isTravelEnabled, openTravel]);
}

export default useTravelMenuItem;
