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
import getInitialSubstepForPersonalInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    onBackButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];
const personalInfoStepKeys = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const PersonalInfo = forwardRef(({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}, ref) => {
    const {translate} = useLocalize();

    const values = useMemo(() => getSubstepValues(personalInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        const payload = {
            bankAccountID: getDefaultValueForReimbursementAccountField(reimbursementAccount, personalInfoStepKeys.BANK_ACCOUNT_ID, 0),
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }, [reimbursementAccount, values]);
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

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
            testID={PersonalInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('personalInfoStep.personalInfo')}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={2}
                    stepNames={STEP_NAMES}
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

PersonalInfo.propTypes = propTypes;
PersonalInfo.defaultProps = defaultProps;
PersonalInfo.displayName = 'PersonalInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(PersonalInfo);
