import {parsePhoneNumber} from 'awesome-phonenumber';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
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
import getInitialSubstepForBusinessInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForBusinessInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AddressUBO from './substeps/AddressUBO';
import BeneficialOwnerCheckUBO from './substeps/BeneficialOwnerCheckUBO';
import CompanyOwnersListUBO from './substeps/CompanyOwnersListUBO';
import ConfirmationUBO from './substeps/ConfirmationUBO';
import DateOfBirthUBO from './substeps/DateOfBirthUBO';
import LegalNameUBO from './substeps/LegalNameUBO';
import SocialSecurityNumberUBO from './substeps/SocialSecurityNumberUBO';

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

const bodyContent = [LegalNameUBO, DateOfBirthUBO, SocialSecurityNumberUBO, AddressUBO, ConfirmationUBO];

// const beneficialOwnerInfoStepKeys = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

function BeneficialOwnerInfo({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();
    const companyName = getDefaultStateForField(reimbursementAccount, 'companyName', '');

    const [isUserUBO, setIsUserUBO] = useState(false);
    const [isAnyoneElseUBO, setIsAnyoneElseUBO] = useState(false);

    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [areThereMoreUBO, setAreThereMoreUBO] = useState(false);

    const currentUBOcheck = useRef(1);

    const handleNextUBOcheck = (callback) => (value) => {
        currentUBOcheck.current += 1;

        callback(value);
    };

    // const values = useMemo(() => getSubstepValues(beneficialOwnerInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    // const startFrom = useMemo(() => getInitialSubstepForBusinessInfo(values), [values]);
    const startFrom = 0;

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: () => setIsFormCompleted(true)});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    console.log('🤢', {isUserUBO, isAnyoneElseUBO, currentUBOcheck, isFormCompleted});

    return (
        <ScreenWrapper
            testID={BeneficialOwnerInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('beneficialOwnerInfoStep.companyOwner')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={4}
                    stepNames={STEP_NAMES}
                />
            </View>

            {currentUBOcheck.current === 1 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doYouOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOcheck(setIsUserUBO)}
                />
            )}

            {currentUBOcheck.current === 2 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOcheck(setIsAnyoneElseUBO)}
                />
            )}

            {!isFormCompleted && isAnyoneElseUBO && (
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {isFormCompleted && currentUBOcheck.current === 3 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOcheck(setAreThereMoreUBO)}
                />
            )}

            {currentUBOcheck.current === 4 && <CompanyOwnersListUBO />}
        </ScreenWrapper>
    );
}

BeneficialOwnerInfo.propTypes = propTypes;
BeneficialOwnerInfo.defaultProps = defaultProps;
BeneficialOwnerInfo.displayName = 'BeneficialOwnerInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(BeneficialOwnerInfo);
