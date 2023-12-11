import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BeneficialOwnerCheckUBO from './substeps/BeneficialOwnerCheckUBO';
import AddressUBO from './substeps/BeneficialOwnerDetailsFormSubsteps/AddressUBO';
import ConfirmationUBO from './substeps/BeneficialOwnerDetailsFormSubsteps/ConfirmationUBO';
import DateOfBirthUBO from './substeps/BeneficialOwnerDetailsFormSubsteps/DateOfBirthUBO';
import LegalNameUBO from './substeps/BeneficialOwnerDetailsFormSubsteps/LegalNameUBO';
import SocialSecurityNumberUBO from './substeps/BeneficialOwnerDetailsFormSubsteps/SocialSecurityNumberUBO';
import CompanyOwnersListUBO from './substeps/CompanyOwnersListUBO';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,

    /** Changes variable responsible for displaying step 4 or 5 */
    setIsBeneficialOwnerInfoSet: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const BODY_CONTENT = [LegalNameUBO, DateOfBirthUBO, SocialSecurityNumberUBO, AddressUBO, ConfirmationUBO];
const BENEFICIAL_OWNER_INFO_STEP_KEYS = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;
const BENEFICIAL_OWNER_KEYS_KEY = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.BENEFICIAL_OWNER_KEYS;
const SUBSTEP = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;
const MAX_NUMBER_OF_UBOS = 4;

function BeneficialOwnerInfo({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, onCloseButtonPress, setIsBeneficialOwnerInfoSet}) {
    const {translate} = useLocalize();
    const companyName = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'companyName', '');
    const values = useMemo(() => getSubstepValues(BENEFICIAL_OWNER_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const defaultBeneficialOwnerKeys = lodashGet(reimbursementAccountDraft, BENEFICIAL_OWNER_KEYS_KEY, []);

    // We're only reading beneficialOwnerKeys from draft values because there is not option to remove UBO
    // if we were to set them based on values saved in BE then there would be no option to enter different UBOs
    // user would always see the same UBOs that was saved in BE when returning to this step and trying to change something
    const [beneficialOwnerKeys, setBeneficialOwnerKeys] = useState(defaultBeneficialOwnerKeys);
    const [beneficialOwnerBeingModifiedID, setBeneficialOwnerBeingModifiedID] = useState('');
    const [isEditingCreatedBeneficialOwner, setIsEditingCreatedBeneficialOwner] = useState(false);
    const [isUserUBO, setIsUserUBO] = useState(values[BENEFICIAL_OWNER_INFO_STEP_KEYS.OWNS_MORE_THAN_25_PERCENT]);
    const [isAnyoneElseUBO, setIsAnyoneElseUBO] = useState(values[BENEFICIAL_OWNER_INFO_STEP_KEYS.BENEFICIAL_OWNERS].length > 0);
    const [currentUBOSubstep, setCurrentUBOSubstep] = useState(1);
    const canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);

    const submit = () => {
        const bankAccountID = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'bankAccountID', 0);

        const beneficialOwners =
            beneficialOwnerKeys.length === 0
                ? []
                : _.map(beneficialOwnerKeys, (ownerKey) => ({
                      firstName: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_firstName`),
                      lastName: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_lastName`),
                      dob: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_dob`),
                      ssnLast4: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_ssnLast4`),
                      street: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_street`),
                      city: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_city`),
                      state: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_state`),
                      zipCode: lodashGet(reimbursementAccountDraft, `beneficialOwner_${ownerKey}_zipCode`),
                  }));

        BankAccounts.updateBeneficialOwnersForBankAccountDraft({
            ownsMoreThan25Percent: isUserUBO,
            beneficialOwners: JSON.stringify(beneficialOwners),
            beneficialOwnerKeys,
            bankAccountID,
        });
        setIsBeneficialOwnerInfoSet(true);
    };

    const addBeneficialOwner = (beneficialOwnerID) => {
        // Each beneficial owner is assigned a unique key that will connect it to values in saved ONYX.
        // That way we can dynamically render each Identity Form based on which keys are present in the beneficial owners array.
        setBeneficialOwnerKeys((previousBeneficialOwners) => {
            const newBeneficialOwners = [...previousBeneficialOwners, beneficialOwnerID];
            FormActions.setDraftValues(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {beneficialOwners: JSON.stringify(newBeneficialOwners)});
            return newBeneficialOwners;
        });
    };

    const startFrom = 0;
    const handleBeneficialOwnerDetailsFormSubmit = () => {
        if (_.find(beneficialOwnerKeys, (beneficialOwnerID) => beneficialOwnerID === beneficialOwnerBeingModifiedID) === undefined && canAddMoreUBOS) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }

        // Because beneficialOwnerKeys array is not yet updated at this point we need to check against lower MAX_NUMBER_OF_UBOS (account for the one that is being added)
        const isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        setCurrentUBOSubstep(isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUBSTEP.UBOS_LIST : SUBSTEP.ARE_THERE_MORE_UBOS);
        setIsEditingCreatedBeneficialOwner(false);
    };

    const {
        componentToRender: BeneficialOwnerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        resetScreenIndex,
    } = useSubStep({bodyContent: BODY_CONTENT, startFrom, onFinished: handleBeneficialOwnerDetailsFormSubmit});

    const prepareBeneficialOwnerDetailsForm = () => {
        const beneficialOwnerID = Str.guid();
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        // Reset Beneficial Owner Details Form to first substep
        resetScreenIndex();
        setCurrentUBOSubstep(SUBSTEP.UBO_DETAILS_FORM);
    };

    const handleNextUBOSubstep = (value) => {
        if (currentUBOSubstep === SUBSTEP.IS_USER_UBO) {
            setIsUserUBO(value);

            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value === true && beneficialOwnerKeys.length === 4) {
                setBeneficialOwnerKeys((previousBeneficialOwners) => previousBeneficialOwners.slice(0, 3));
            }

            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            return;
        }

        if (currentUBOSubstep === SUBSTEP.IS_ANYONE_ELSE_UBO) {
            setIsAnyoneElseUBO(value);

            if (!canAddMoreUBOS && value === true) {
                setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
                return;
            }

            if (canAddMoreUBOS && value === true) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }

            // User is not an owner and no one else is an owner
            if (isUserUBO === false && value === false) {
                submit();
                return;
            }

            // User is an owner and no one else is an owner
            if (isUserUBO === true && value === false) {
                setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
                return;
            }
        }

        // Are there more UBOs
        if (currentUBOSubstep === SUBSTEP.ARE_THERE_MORE_UBOS) {
            if (value === true) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
            return;
        }

        // User reached the limit of UBOs
        if (currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && !canAddMoreUBOS) {
            setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
        }
    };

    const handleBackButtonPress = () => {
        // User goes back to previous step
        if (currentUBOSubstep === SUBSTEP.IS_USER_UBO) {
            onBackButtonPress();
            // User reached limit of UBOs and goes back to initial question about additional UBOs
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && !canAddMoreUBOS) {
            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User goes back to last radio button
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && isAnyoneElseUBO === true) {
            setCurrentUBOSubstep(SUBSTEP.ARE_THERE_MORE_UBOS);
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && isUserUBO === true && isAnyoneElseUBO === false) {
            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User moves between substeps of beneficial owner details form
        } else if (currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        } else {
            setCurrentUBOSubstep((currentSubstep) => currentSubstep - 1);
        }
    };

    const handleUBOEdit = (beneficialOwnerID) => {
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        setIsEditingCreatedBeneficialOwner(true);
        setCurrentUBOSubstep(SUBSTEP.UBO_DETAILS_FORM);
    };

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
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStep={4}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>

            {currentUBOSubstep === SUBSTEP.IS_USER_UBO && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doYouOwn25percent')} ${companyName}?`}
                    defaultValue={isUserUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubstep === SUBSTEP.IS_ANYONE_ELSE_UBO && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent')} ${companyName}?`}
                    defaultValue={isAnyoneElseUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && (
                <BeneficialOwnerDetailsForm
                    isEditing={isEditing}
                    beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                    setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {currentUBOSubstep === SUBSTEP.ARE_THERE_MORE_UBOS && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOSubstep}
                    defaultValue={false}
                />
            )}

            {currentUBOSubstep === SUBSTEP.UBOS_LIST && (
                <CompanyOwnersListUBO
                    beneficialOwnerKeys={beneficialOwnerKeys}
                    handleUBOsConfirmation={submit}
                    handleUBOEdit={handleUBOEdit}
                    isUserUBO={isUserUBO}
                    isAnyoneElseUBO={isAnyoneElseUBO}
                />
            )}
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
