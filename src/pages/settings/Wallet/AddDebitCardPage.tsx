import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import type {PaymentCardParams} from '@libs/API/parameters';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {addPaymentCard as addPaymentCardAction, clearPaymentCardFormErrorAndSubmit, continueSetup} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function DebitCardPage() {
    // Temporarily disabled
    return <NotFoundPage />;

    const {translate} = useLocalize();
    const [formData] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {canBeMissing: false});
    const prevFormDataSetupComplete = usePrevious(!!formData?.setupComplete);
    const nameOnCardRef = useRef<AnimatedTextInputRef>(null);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const kycWallRef = useContext(KYCWallContext);
    /**
     * Reset the form values on the mount and unmount so that old errors don't show when this form is displayed again.
     */
    useEffect(() => {
        clearPaymentCardFormErrorAndSubmit();

        return () => {
            clearPaymentCardFormErrorAndSubmit();
        };
    }, []);

    useEffect(() => {
        if (prevFormDataSetupComplete || !formData?.setupComplete) {
            return;
        }

        continueSetup(kycWallRef);
    }, [prevFormDataSetupComplete, formData?.setupComplete, kycWallRef]);

    const addPaymentCard = useCallback(
        (params: PaymentCardParams) => {
            addPaymentCardAction(accountID ?? CONST.DEFAULT_NUMBER_ID, params);
        },
        [accountID],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => nameOnCardRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            testID="DebitCardPage"
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

export default DebitCardPage;
