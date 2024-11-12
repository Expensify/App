import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import * as FormActions from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InternationalBankAccountForm} from '@src/types/form';
import type {BankAccountList, CorpayFields, PrivatePersonalDetails} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccountHolderInformation from './substeps/AccountHolderInformation';
import AccountType from './substeps/AccountType';
import BankAccountDetails from './substeps/BankAccountDetails';
import BankInformation from './substeps/BankInformation';
import Confirmation from './substeps/Confirmation';
import CountrySelection from './substeps/CountrySelection';
import Success from './substeps/Success';
import type {CustomSubStepProps} from './types';
import {getFieldsMap, getInitialPersonalDetailsValues, getInitialSubstep, getSubstepValues, testValidation} from './utils';

type InternationalDepositAccountContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    corpayFields: OnyxEntry<CorpayFields>;
    bankAccountList: OnyxEntry<BankAccountList>;
    draftValues: OnyxEntry<InternationalBankAccountForm>;
    country: OnyxEntry<string>;
};

const formSteps = [CountrySelection, BankAccountDetails, AccountType, BankInformation, AccountHolderInformation, Confirmation, Success];

function getSkippedSteps(skipAccountTypeStep: boolean, skipAccountHolderInformationStep: boolean) {
    const skippedSteps = [];
    if (skipAccountTypeStep) {
        skippedSteps.push(CONST.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_TYPE);
    }
    if (skipAccountHolderInformationStep) {
        skippedSteps.push(CONST.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_HOLDER_INFORMATION);
    }
    return skippedSteps;
}

function InternationalDepositAccountContent({privatePersonalDetails, corpayFields, bankAccountList, draftValues, country}: InternationalDepositAccountContentProps) {
    const {translate} = useLocalize();

    const values = useMemo(
        () => getSubstepValues(privatePersonalDetails, corpayFields, bankAccountList, draftValues, country),
        [privatePersonalDetails, corpayFields, bankAccountList, draftValues, country],
    );

    const initialAccountHolderDetailsValues = useMemo(() => getInitialPersonalDetailsValues(privatePersonalDetails), [privatePersonalDetails]);

    const fieldsMap = useMemo(() => getFieldsMap(corpayFields), [corpayFields]);

    const startFrom = useMemo(() => getInitialSubstep(values, fieldsMap), [fieldsMap, values]);

    const skipAccountTypeStep = isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]);

    const skipAccountHolderInformationStep = testValidation(initialAccountHolderDetailsValues, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]);

    const skippedSteps = getSkippedSteps(skipAccountTypeStep, skipAccountHolderInformationStep);

    const handleFinishStep = useCallback(() => {
        FormActions.clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        Navigation.goBack();
    }, []);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        resetScreenIndex,
    } = useSubStep<CustomSubStepProps>({bodyContent: formSteps, startFrom, onFinished: handleFinishStep, skipSteps: skippedSteps});

    const handleBackButtonPress = () => {
        if (isEditing) {
            resetScreenIndex(CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION);
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR) {
            FormActions.clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            Navigation.goBack();
            return;
        }

        // Clicking back on the success screen should dismiss the modal
        if (screenIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS) {
            Navigation.goBack();
            return;
        }
        prevScreen();
    };

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            resetScreenIndex(CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION);
            return;
        }
        nextScreen();
    }, [resetScreenIndex, isEditing, nextScreen]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={InternationalDepositAccountContent.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                resetScreenIndex={resetScreenIndex}
                formValues={values}
                fieldsMap={fieldsMap}
            />
        </ScreenWrapper>
    );
}

InternationalDepositAccountContent.displayName = 'InternationalDepositAccountContent';

export default InternationalDepositAccountContent;
