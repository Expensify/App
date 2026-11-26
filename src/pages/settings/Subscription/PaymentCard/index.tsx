import SubscriptionPaymentCardForm from '@components/AddPaymentCard/SubscriptionPaymentCardForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';

import Navigation from '@libs/Navigation/Navigation';
import {getCardForSubscriptionBilling} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {useEffect, useState} from 'react';

function AddPaymentCard() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path);
    const {translate} = useLocalize();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    // Keep the valid add-card flow visible when the new billing card reaches Onyx before this screen navigates back.
    const [hasSubmittedPaymentCard, setHasSubmittedPaymentCard] = useState(false);

    let billingCard;
    const userBillingCard = userBillingFundID ? fundList?.[`${userBillingFundID}`] : undefined;
    if (userBillingCard?.accountData) {
        billingCard = userBillingCard;
    } else {
        billingCard = getCardForSubscriptionBilling(fundList);
    }

    const isSaveTheWorldAddPaymentCardRoute = backPath === ROUTES.SETTINGS_SAVE_THE_WORLD;
    const shouldShowBlockingView = isSaveTheWorldAddPaymentCardRoute && !!billingCard;

    const [formData] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM);
    const prevFormDataSetupComplete = usePrevious(!!formData?.setupComplete);

    useEffect(() => {
        if (prevFormDataSetupComplete || !formData?.setupComplete) {
            return;
        }

        Navigation.goBack(backPath);
    }, [prevFormDataSetupComplete, formData?.setupComplete, backPath]);

    return (
        <ScreenWrapper testID="AddPaymentCard">
            <FullPageNotFoundView
                shouldShow={shouldShowBlockingView && !hasSubmittedPaymentCard}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <HeaderWithBackButton
                        title={translate('subscription.paymentCard.addPaymentCard')}
                        onBackButtonPress={() => Navigation.goBack(backPath)}
                    />
                    <SubscriptionPaymentCardForm
                        headerText={translate('subscription.paymentCard.enterPaymentCardDetails')}
                        onSubmit={() => setHasSubmittedPaymentCard(true)}
                    />
                </DelegateNoAccessWrapper>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default AddPaymentCard;
