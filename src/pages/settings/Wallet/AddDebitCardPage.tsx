import React, {useCallback, useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import type {PaymentCardParams} from '@libs/API/parameters';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as PaymentMethods from '@userActions/PaymentMethods';
import ONYXKEYS from '@src/ONYXKEYS';

function DebitCardPage() {
    // Temporarily disabled
    return <NotFoundPage />;

    const {translate} = useLocalize();
    const [formData] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM);
    const prevFormDataSetupComplete = usePrevious(!!formData?.setupComplete);
    const nameOnCardRef = useRef<AnimatedTextInputRef>(null);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID ?? 0});

    /**
     * Reset the form values on the mount and unmount so that old errors don't show when this form is displayed again.
     */
    useEffect(() => {
        PaymentMethods.clearPaymentCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearPaymentCardFormErrorAndSubmit();
        };
    }, []);

    useEffect(() => {
        if (prevFormDataSetupComplete || !formData?.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();
    }, [prevFormDataSetupComplete, formData?.setupComplete]);

    const addPaymentCard = useCallback(
        (params: PaymentCardParams) => {
            PaymentMethods.addPaymentCard(accountID ?? 0, params);
        },
        [accountID],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => nameOnCardRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={DebitCardPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('addDebitCardPage.addADebitCard')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <PaymentCardForm
                showAcceptTerms
                shouldShowPaymentCardForm
                showAddressField
                isDebitCard
                showStateSelector
                addPaymentCard={addPaymentCard}
                submitButtonText={translate('common.save')}
            />
        </ScreenWrapper>
    );
}

DebitCardPage.displayName = 'DebitCardPage';

export default DebitCardPage;
