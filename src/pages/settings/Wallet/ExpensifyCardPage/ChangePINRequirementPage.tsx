import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type ChangePINRequirementPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_CHANGE_PIN_REQUIREMENT>;

function ChangePINRequirementPage({route}: ChangePINRequirementPageProps) {
    const {cardID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['EmptyCardState']);

    return (
        <ScreenWrapper testID="ChangePINRequirementPage">
            <HeaderWithBackButton
                title={translate('cardPage.changePINRequirement.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID))}
            />
            <ConfirmationPage
                heading={translate('cardPage.changePINRequirement.heading')}
                description={translate('cardPage.changePINRequirement.description')}
                illustration={illustrations.EmptyCardState}
                shouldShowButton
                onButtonPress={() => {
                    Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID), {forceReplace: true});
                }}
                buttonText={translate('common.buttonConfirm')}
                containerStyle={styles.h100}
                illustrationStyle={[styles.w100, StyleUtils.getSuccessReportCardLostIllustrationStyle()]}
                innerContainerStyle={styles.ph0}
                descriptionStyle={[styles.ph4, styles.textSupporting]}
            />
        </ScreenWrapper>
    );
}

ChangePINRequirementPage.displayName = 'ChangePINRequirementPage';

export default ChangePINRequirementPage;
