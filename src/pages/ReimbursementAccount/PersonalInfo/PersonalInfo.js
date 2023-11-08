import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import Navigation from '@libs/Navigation/Navigation';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultStateForField from '@pages/ReimbursementAccount/utils/getDefaultStateForField';
import getInitialSubstepForPersonalInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForPersonalInfo';
import getPersonalInfoValues from '@pages/ReimbursementAccount/utils/getPersonalInfoValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function PersonalInfo({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const values = useMemo(() => getPersonalInfoValues(reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        const payload = {
            bankAccountID: getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0}),
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }, [reimbursementAccount, values]);
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
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
                    startStep={1}
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
}

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
