/**
 * Success screen shown right after a physical Expensify Card is activated. The activation screen replaces itself with
 * this one, and "View card" goes back to the card details screen the activation was started from.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import FadeUpAfterCard from './FadeUpAfterCard';
import SpinningCard from './SpinningCard';

type ActivatePhysicalCardSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATION_SUCCESS>;

function ActivatePhysicalCardSuccessPage({
    route: {
        params: {cardID = ''},
    },
}: ActivatePhysicalCardSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_ACTIVATION_SUCCESS.path);

    // Opened from the Home activate item, the path under this screen can be Home itself, so the card details suffix is added here.
    const cardDetailsSuffix = DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(cardID);
    const cardDetailsPath = backPath.endsWith(cardDetailsSuffix) ? backPath : createDynamicRoute(cardDetailsSuffix, backPath);

    // Collapse onto the existing card details route instead of pushing a new one, so there is no duplicate card details screen to back through.
    const goToCardDetails = () => Navigation.goBack(cardDetailsPath, {compareParams: false});

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="ActivatePhysicalCardSuccessPage"
        >
            <Header>
                <Header.BackButton onPress={goToCardDetails} />
                <Header.Title title={translate('activateCardPage.activateCard')} />
            </Header>
            <ConfirmationPage>
                <ConfirmationPage.Content style={styles.ph8}>
                    <SpinningCard />
                    <FadeUpAfterCard>
                        <ConfirmationPage.Heading>{translate('activateCardPage.success.title')}</ConfirmationPage.Heading>
                        <ConfirmationPage.Description style={styles.textSupporting}>{translate('activateCardPage.success.description')}</ConfirmationPage.Description>
                    </FadeUpAfterCard>
                </ConfirmationPage.Content>
                <FixedFooter>
                    <ConfirmationPage.PrimaryButton
                        sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.ACTIVATION_SUCCESS_VIEW_CARD}
                        text={translate('activateCardPage.success.viewCard')}
                        onPress={goToCardDetails}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default ActivatePhysicalCardSuccessPage;
