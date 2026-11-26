/**
 * Confirms the domain change that the admin's new payment card pays for.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {domainNameSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';

type DomainPaymentCardSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD_SUCCESS>;

function DomainPaymentCardSuccessPage({route}: DomainPaymentCardSuccessPageProps) {
    const {domainAccountID, flow} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [domainName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const isPrimaryContactFlow = flow === CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT;

    const closePage = () => Navigation.goBack(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID));

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper testID="DomainPaymentCardSuccessPage">
                <Header>
                    <Header.BackButton onPress={closePage} />
                    <Header.Title title={translate(isPrimaryContactFlow ? 'domain.admins.addPrimaryContact' : 'domain.admins.consolidatedDomainBilling')} />
                </Header>
                <ConfirmationPage>
                    <ConfirmationPage.Content>
                        <ConfirmationPage.Illustration />
                        <ConfirmationPage.Heading>{translate('domain.admins.paymentCardSuccessTitle')}</ConfirmationPage.Heading>
                        <View style={[styles.renderHTML, styles.flexRow]}>
                            <RenderHTML
                                html={translate(isPrimaryContactFlow ? 'domain.admins.primaryContactSuccessMessage' : 'domain.admins.consolidatedBillingSuccessMessage', domainName)}
                            />
                        </View>
                    </ConfirmationPage.Content>
                    <FixedFooter>
                        <ConfirmationPage.PrimaryButton
                            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.ADMINS.PAYMENT_CARD_SUCCESS_CONFIRM}
                            text={translate('common.buttonConfirm')}
                            onPress={closePage}
                        />
                    </FixedFooter>
                </ConfirmationPage>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainPaymentCardSuccessPage;
