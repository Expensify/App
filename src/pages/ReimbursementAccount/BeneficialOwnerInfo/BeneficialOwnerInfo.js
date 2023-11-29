import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getInitialSubstepForBeneficialOwnerInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForBeneficialOwnerInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [LegalNameUBO, DateOfBirthUBO, SocialSecurityNumberUBO, AddressUBO, ConfirmationUBO];
const beneficialOwnerInfoStepKeys = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

function BeneficialOwnerInfo({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, onCloseButtonPress}) {
    const {translate} = useLocalize();
    const companyName = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'companyName', '');

    const [isUserUBO, setIsUserUBO] = useState(false);
    const [isAnyoneElseUBO, setIsAnyoneElseUBO] = useState(false);

    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [areThereMoreUBO, setAreThereMoreUBO] = useState(false);

    const [currentUBOCheck, setCurrentUBOCheck] = useState(1);

    const values = useMemo(() => getSubstepValues(beneficialOwnerInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    console.log(values);
    console.log(reimbursementAccount, ' reimbursementAccount');

    const submit = () => {
        const bankAccountID = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'bankAccountID', 0);

        const beneficialOwners = lodashGet(reimbursementAccountDraft, 'beneficialOwners', []);

        const updatedBeneficialOwners = !values.hasOtherBeneficialOwners
            ? []
            : _.map(beneficialOwners, (ownerKey) => ({
                  firstName: lodashGet(values, `beneficialOwner_${ownerKey}_firstName`),
                  lastName: lodashGet(values, `beneficialOwner_${ownerKey}_lastName`),
                  dob: lodashGet(values, `beneficialOwner_${ownerKey}_dob`),
                  ssnLast4: lodashGet(values, `beneficialOwner_${ownerKey}_ssnLast4`),
                  street: lodashGet(values, `beneficialOwner_${ownerKey}_street`),
                  city: lodashGet(values, `beneficialOwner_${ownerKey}_city`),
                  state: lodashGet(values, `beneficialOwner_${ownerKey}_state`),
                  zipCode: lodashGet(values, `beneficialOwner_${ownerKey}_zipCode`),
              }));
        BankAccounts.updateBeneficialOwnersForBankAccount({
            ownsMoreThan25Percent: values.ownsMoreThan25Percent,
            hasOtherBeneficialOwners: values.hasOtherBeneficialOwners,
            acceptTermsAndConditions: values.acceptTermsAndConditions,
            certifyTrueInformation: values.certifyTrueInformation,
            beneficialOwners: JSON.stringify(updatedBeneficialOwners),
            bankAccountID,
        });
    };

    const handleNextUBOCheck = (callback) => (value) => {
        // user is not an owner and no one else is an owner
        if (isUserUBO === false && isAnyoneElseUBO === false && currentUBOCheck === 2) {
            submit();
            return;
        }

        // user is an owner and no one else is an owner
        if (isUserUBO === true && isAnyoneElseUBO === false && currentUBOCheck === 1) {
            setCurrentUBOCheck(4);
            return;
        }

        // someone else is an owner and possibly user is an owner (all the other cases)
        setCurrentUBOCheck((currentValue) => currentValue + 1);
        callback(value);
    };

    const startFrom = useMemo(() => getInitialSubstepForBeneficialOwnerInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: () => setIsFormCompleted(true)});

    const handleBackButtonPress = () => {
        if (currentUBOCheck === 1) {
            onBackButtonPress();
        } else {
            setCurrentUBOCheck((currentValue) => currentValue - 1);
        }
    };

    console.log('🤢', {isUserUBO, isAnyoneElseUBO, currentUBOcheck: currentUBOCheck, isFormCompleted});

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
                onCloseButtonPress={onCloseButtonPress}
                shouldShowCloseButton
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={4}
                    stepNames={STEP_NAMES}
                />
            </View>

            {currentUBOCheck === 1 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doYouOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOCheck(setIsUserUBO)}
                />
            )}

            {currentUBOCheck === 2 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOCheck(setIsAnyoneElseUBO)}
                />
            )}

            {!isFormCompleted && isAnyoneElseUBO && (
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {isFormCompleted && currentUBOCheck === 3 && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOCheck(setAreThereMoreUBO)}
                />
            )}

            {currentUBOCheck === 4 && <CompanyOwnersListUBO />}
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
