import {filterPersonalCards} from '@selectors/Card';
import React from 'react';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTravelInvoicingCard, isTravelCVVEligible} from '@libs/TravelInvoicingUtils';
import colors from '@styles/theme/colors';
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

    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});

    const travelCard = getTravelInvoicingCard(cardList);

    if (!isTravelCVVEligible(betas, cardList) || !travelCard) {
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

WalletTravelCVVSection.displayName = 'WalletTravelCVVSection';

export default WalletTravelCVVSection;
