/**
 * Asks a domain admin for a payment card, then makes the domain change that needs the card once its setup finishes.
 */
import SubscriptionPaymentCardForm from '@components/AddPaymentCard/SubscriptionPaymentCardForm';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {setPrimaryContact, toggleConsolidatedDomainBilling} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {isCardSetupCompleteSelector} from '@selectors/AddPaymentCardForm';
import {domainNameSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React, {useEffect} from 'react';

type DomainPaymentCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD>;

function DomainPaymentCardPage({route}: DomainPaymentCardPageProps) {
    const {domainAccountID, flow} = route.params;
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD.path);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: technicalContactSettingsSelector,
    });
    const [isCardSetupComplete = false] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {selector: isCardSetupCompleteSelector});
    const wasCardSetupComplete = usePrevious(isCardSetupComplete);
    const isPrimaryContactFlow = flow === CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT;
    const technicalContactEmail = technicalContactSettings?.technicalContactEmail;

    // Some cards are saved before the user verifies them, so the change waits for the card setup to finish.
    useEffect(() => {
        if (wasCardSetupComplete || !isCardSetupComplete || !domainName) {
            return;
        }
        if (isPrimaryContactFlow) {
            setPrimaryContact(domainAccountID, currentUserLogin, technicalContactEmail);
        } else {
            toggleConsolidatedDomainBilling(domainAccountID, domainName, true);
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD_SUCCESS.getRoute(flow), backPath), {forceReplace: true});
    }, [wasCardSetupComplete, isCardSetupComplete, domainName, isPrimaryContactFlow, domainAccountID, currentUserLogin, technicalContactEmail, flow, backPath]);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper testID="DomainPaymentCardPage">
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <Header>
                        <Header.BackButton onPress={() => Navigation.goBack(backPath)} />
                        <Header.Title title={translate(isPrimaryContactFlow ? 'domain.admins.addPrimaryContact' : 'domain.admins.consolidatedDomainBilling')} />
                    </Header>
                    <SubscriptionPaymentCardForm
                        headerText={translate(isPrimaryContactFlow ? 'domain.admins.primaryContactPaymentCardTitle' : 'domain.admins.consolidatedBillingPaymentCardTitle')}
                    />
                </DelegateNoAccessWrapper>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainPaymentCardPage;
