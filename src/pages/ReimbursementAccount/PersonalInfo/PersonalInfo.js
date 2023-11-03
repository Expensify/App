import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import FullName from './substeps/FullName';
import DateOfBirth from './substeps/DateOfBirth';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import useSubStep from '../../../hooks/useSubStep';
import ONYXKEYS from '../../../ONYXKEYS';
import {reimbursementAccountPropTypes} from '../reimbursementAccountPropTypes';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import InteractiveStepSubHeader from '../../../components/InteractiveStepSubHeader';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import getInitialSubstepForPersonalInfo from '../utils/getInitialSubstepForPersonalInfo';
import getDefaultStateForField from '../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

function PersonalInfo({reimbursementAccount}) {
    const {translate} = useLocalize();

    const submit = useCallback(() => {
        const values = {
            [personalInfoStepKey.FIRST_NAME]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.FIRST_NAME, defaultValue: ''}),
            [personalInfoStepKey.LAST_NAME]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.LAST_NAME, defaultValue: ''}),
            [personalInfoStepKey.DOB]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.DOB, defaultValue: ''}),
            [personalInfoStepKey.SSN_LAST_4]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.SSN_LAST_4, defaultValue: ''}),
            [personalInfoStepKey.STREET]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.STREET, defaultValue: ''}),
            [personalInfoStepKey.CITY]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.CITY, defaultValue: ''}),
            [personalInfoStepKey.STATE]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.STATE, defaultValue: ''}),
            [personalInfoStepKey.ZIP_CODE]: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.ZIP_CODE, defaultValue: ''}),
        };

        const payload = {
            bankAccountID: getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0}),
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }, [reimbursementAccount]);
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(lodashGet(reimbursementAccount, ['achData'], {})), [reimbursementAccount]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    return (
        <>
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
        </>
    );
}

PersonalInfo.propTypes = propTypes;
PersonalInfo.displayName = 'PersonalInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(PersonalInfo);
