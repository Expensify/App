import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSubStep from '@hooks/useSubStep';
import {clearDraftValues} from '@libs/actions/FormActions';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
import type CustomSubStepProps from './types';
import {getFieldsMap, getInitialPersonalDetailsValues, getInitialSubstep, getSubstepValues, testValidation} from './utils';

type InternationalDepositAccountContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    corpayFields: OnyxEntry<CorpayFields>;
    bankAccountList: OnyxEntry<BankAccountList>;
    draftValues: OnyxEntry<InternationalBankAccountForm>;
    country: OnyxEntry<string>;
    isAccountLoading: boolean;
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

function InternationalDepositAccountContent({privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, isAccountLoading}: InternationalDepositAccountContentProps) {
    const {translate} = useLocalize();

    const fieldsMap = useMemo(() => getFieldsMap(corpayFields), [corpayFields]);

    const values = useMemo(
        () => getSubstepValues(privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap),
        [privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap],
    );

    const initialAccountHolderDetailsValues = useMemo(() => getInitialPersonalDetailsValues(privatePersonalDetails), [privatePersonalDetails]);

    const startFrom = useMemo(() => getInitialSubstep(values, fieldsMap), [fieldsMap, values]);

    const skipAccountTypeStep = isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]);

    const skipAccountHolderInformationStep = testValidation(initialAccountHolderDetailsValues, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]);

    const skippedSteps = getSkippedSteps(skipAccountTypeStep, skipAccountHolderInformationStep);

    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((route) => isFullScreenName(route.name)));

    const goBack = useCallback(() => {
        switch (topmostFullScreenRoute?.name) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    }, [topmostFullScreenRoute?.name]);

    const handleFinishStep = useCallback(() => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        goBack();
    }, [goBack]);

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
            return true;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }

        // Clicking back on the success screen should dismiss the modal
        if (screenIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }
        prevScreen();
        return true;
    };

    useAndroidBackButtonHandler(handleBackButtonPress);

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            resetScreenIndex(CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION);
            return;
        }
        nextScreen();
    }, [resetScreenIndex, isEditing, nextScreen]);

    if (isAccountLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="InternationalDepositAccountContent"
            shouldShowOfflineIndicatorInWideScreen={screenIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
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

export default InternationalDepositAccountContent;
