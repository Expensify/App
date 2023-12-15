import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmAgreements from './substeps/ConfirmAgreements';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** Handle back button press */
    onBackButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const BODY_CONTENT = [ConfirmAgreements];
const COMPLETE_VERIFICATION_KEYS = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION.INPUT_KEY;
const BENEFICIAL_OWNER_INFO_STEP_KEYS = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

// This is a mocked step to showcase full transition between steps - will be removed with next PR
const CompleteVerification = forwardRef(({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}, ref) => {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = useMemo(() => getSubstepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        const payload = {
            bankAccountID: getDefaultValueForReimbursementAccountField(reimbursementAccount, COMPLETE_VERIFICATION_KEYS.BANK_ACCOUNT_ID, 0),
            ...values,
        };
        const uboStepValues = getSubstepValues(BENEFICIAL_OWNER_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount);

        BankAccounts.updateBeneficialOwnersForBankAccount({
            ...uboStepValues,
            ...payload,
        });
    }, [reimbursementAccount, reimbursementAccountDraft, values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: BODY_CONTENT, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            ref={ref}
            testID={CompleteVerification.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('completeVerificationStep.completeVerification')}
            />
            <View style={[styles.ph5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={5}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
});

CompleteVerification.propTypes = propTypes;
CompleteVerification.defaultProps = defaultProps;
CompleteVerification.displayName = 'CompleteVerification';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(CompleteVerification);
