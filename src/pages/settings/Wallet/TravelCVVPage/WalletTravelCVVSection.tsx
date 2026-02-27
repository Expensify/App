import React from 'react';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTravelInvoicingCard, isTravelCVVEligible} from '@libs/TravelInvoicingUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Renders a menu item in the Wallet's Assigned cards section that allows
 * users to access their Travel Invoicing card CVV.
 * Only renders when user is eligible (has TRAVEL_INVOICING beta and a travel card).
 */
function WalletTravelCVVSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines']);
    const {isBetaEnabled} = usePermissions();

    const [cardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const travelCard = getTravelInvoicingCard(cardList);

    if (!isTravelCVVEligible(isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING), cardList) || !travelCard) {
        return null;
    }

    return (
        <MenuItem
            title={translate('walletPage.travelCVV.title')}
            description={translate('walletPage.travelCVV.subtitle')}
            icon={icons.LuggageWithLines}
            iconFill={colors.productLight100}
            iconStyles={styles.travelInvoicingIcon}
            wrapperStyle={styles.sectionMenuItemTopDescription}
            shouldShowRightIcon
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_TRAVEL_CVV)}
        />
    );
}

export default WalletTravelCVVSection;
