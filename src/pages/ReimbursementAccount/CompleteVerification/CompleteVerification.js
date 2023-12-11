import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmAgreements from './substeps/ConfirmAgreements';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,
    /** Changes variable responsible for displaying step 4 or 5 */
    setIsBeneficialOwnerInfoSet: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const bodyContent = [ConfirmAgreements];
const personalInfoStepKeys = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const CompleteVerification = forwardRef(({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}, ref) => {
    const {translate} = useLocalize();

    const values = useMemo(() => getSubstepValues(personalInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        const payload = {
            bankAccountID: getDefaultValueForReimbursementAccountField(reimbursementAccount, personalInfoStepKeys.BANK_ACCOUNT_ID, 0),
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }, [reimbursementAccount, values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

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
                    startStep={5}
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
