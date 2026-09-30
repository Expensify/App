import FormDraftPersistenceContext from '@components/Form/FormDraftPersistenceContext';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSubPage from '@hooks/useSubPage';

import {
    cancelPersonalBankAccountEdit,
    clearCorpayBankAccountFields,
    clearPersonalBankAccount,
    finishPersonalBankAccountEdit,
    startPersonalBankAccountEdit,
    updatePersonalBankAccountCurrentPage,
} from '@libs/actions/BankAccounts';
import {clearDraftValues} from '@libs/actions/FormActions';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InternationalBankAccountForm} from '@src/types/form';
import type {BankAccountList, CorpayFields, PersonalBankAccount, PrivatePersonalDetails} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

import type CustomSubPageProps from './types';

import AccountHolderInformation from './subPages/AccountHolderInformation';
import AccountType from './subPages/AccountType';
import BankAccountDetails from './subPages/BankAccountDetails';
import BankInformation from './subPages/BankInformation';
import Confirmation from './subPages/Confirmation';
import CountrySelection from './subPages/CountrySelection';
import Success from './subPages/Success';
import {getFieldsMap, getInitialPersonalDetailsValues, getInitialSubstep, getSubstepValues, testValidation} from './utils';

type InternationalDepositAccountContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    corpayFields: OnyxEntry<CorpayFields>;
    bankAccountList: OnyxEntry<BankAccountList>;
    draftValues: OnyxEntry<InternationalBankAccountForm>;
    country: OnyxEntry<string>;
    isAccountLoading: boolean;
    isWalletSetup: boolean;
    savedPage?: string;
    savedPageAction?: 'edit';
    editDraftSnapshot?: PersonalBankAccount['editDraftSnapshot'];
    backTo?: Route;
};

const pages = [
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.COUNTRY, component: CountrySelection},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS, component: BankAccountDetails},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE, component: AccountType},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION, component: BankInformation},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS, component: AccountHolderInformation},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM, component: Confirmation},
    {pageName: CONST.CORPAY_FIELDS.PAGE_NAME.SUCCESS, component: Success},
];

function getSkippedPages(skipAccountTypeStep: boolean, skipAccountHolderInformationStep: boolean) {
    const skippedSteps = [];
    if (skipAccountTypeStep) {
        skippedSteps.push(CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE);
    }
    if (skipAccountHolderInformationStep) {
        skippedSteps.push(CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS);
    }
    return skippedSteps;
}

function InternationalDepositAccountContent({
    privatePersonalDetails,
    corpayFields,
    bankAccountList,
    draftValues,
    country,
    isAccountLoading,
    isWalletSetup,
    savedPage,
    savedPageAction,
    editDraftSnapshot: savedEditDraftSnapshot,
    backTo,
}: InternationalDepositAccountContentProps) {
    const {translate} = useLocalize();

    const fieldsMap = getFieldsMap(corpayFields);

    const values = getSubstepValues(privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap);

    const initialAccountHolderDetailsValues = getInitialPersonalDetailsValues(privatePersonalDetails);

    const firstIncompletePageIndex = getInitialSubstep(values, fieldsMap);

    const skipAccountTypeStep = isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE]);

    const skipAccountHolderInformationStep = testValidation(initialAccountHolderDetailsValues, fieldsMap[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS]);

    const skippedPages = getSkippedPages(skipAccountTypeStep, skipAccountHolderInformationStep);
    const savedPageIndex = pages.findIndex(
        (page) => page.pageName === savedPage && (!skippedPages.includes(page.pageName) || (savedPageAction === 'edit' && !isEmptyObject(fieldsMap[page.pageName]))),
    );
    const startFrom = isWalletSetup && savedPageIndex >= 0 ? Math.min(savedPageIndex, firstIncompletePageIndex) : firstIncompletePageIndex;
    const startAction = isWalletSetup && savedPageIndex >= 0 && savedPageAction === 'edit' && startFrom === savedPageIndex ? savedPageAction : undefined;

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>>();
    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((r) => isFullScreenName(r.name)));
    const activeTab = getActiveTabName(topmostFullScreenRoute);

    const goBack = (shouldIgnoreBackToParam = false) => {
        if (backTo && !shouldIgnoreBackToParam) {
            Navigation.goBack(backTo);
            return;
        }
        switch (activeTab) {
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
    };

    const handleFinishStep = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearCorpayBankAccountFields();
        goBack(backTo?.includes(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE));
    };

    const {CurrentPage, isEditing, nextPage, prevPage, pageIndex, currentPageName, moveTo, isRedirecting} = useSubPage<CustomSubPageProps>({
        pages,
        startFrom,
        startAction,
        onFinished: handleFinishStep,
        skipPages: skippedPages,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(route.params?.backTo, pageName, action),
    });
    const shouldPersistDraft =
        isWalletSetup &&
        isEditing &&
        (currentPageName === CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS ||
            currentPageName === CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION ||
            currentPageName === CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS);
    const isFocused = useIsFocused();
    const latestDraftValues = useRef(draftValues);
    const editDraftSnapshot = useRef<PersonalBankAccount['editDraftSnapshot']>(undefined);
    const isLeavingEdit = useRef(false);

    useEffect(() => {
        if (!isEditing) {
            isLeavingEdit.current = false;
        }
        if (!isWalletSetup || !isFocused || isRedirecting || !currentPageName || isLeavingEdit.current) {
            return;
        }
        updatePersonalBankAccountCurrentPage(currentPageName, isEditing ? 'edit' : undefined);
    }, [currentPageName, isEditing, isFocused, isRedirecting, isWalletSetup]);

    useEffect(() => {
        latestDraftValues.current = draftValues;
    }, [draftValues]);

    useEffect(() => {
        if (!isEditing || !currentPageName) {
            editDraftSnapshot.current = undefined;
            return;
        }
        if (editDraftSnapshot.current?.pageName === currentPageName) {
            return;
        }
        editDraftSnapshot.current =
            savedEditDraftSnapshot?.pageName === currentPageName
                ? savedEditDraftSnapshot
                : {
                      pageName: currentPageName,
                      internationalBankAccountDraft: latestDraftValues.current ?? null,
                  };
    }, [currentPageName, isEditing, savedEditDraftSnapshot]);

    const goBackToConfirmStep = () => {
        Navigation.goBack(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(route.params?.backTo, CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM, undefined));
    };

    const restoreEditDraftSnapshot = () => {
        cancelPersonalBankAccountEdit(savedEditDraftSnapshot ?? editDraftSnapshot.current, CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM);
        editDraftSnapshot.current = undefined;
    };

    const handleMove = (targetPageIndex: number, turnOnEditMode?: boolean) => {
        const targetPageName = pages.at(targetPageIndex)?.pageName;
        if (isWalletSetup && currentPageName === CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM && turnOnEditMode !== false && targetPageName) {
            isLeavingEdit.current = false;
            const snapshot = {
                pageName: targetPageName,
                internationalBankAccountDraft: latestDraftValues.current ?? null,
            };
            editDraftSnapshot.current = snapshot;
            startPersonalBankAccountEdit(targetPageName, snapshot);
        }
        moveTo(targetPageIndex, turnOnEditMode);
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            isLeavingEdit.current = true;
            restoreEditDraftSnapshot();
            goBackToConfirmStep();
            return true;
        }

        // Clicking back on the first screen should dismiss the modal
        if (pageIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            clearCorpayBankAccountFields();
            if (isWalletSetup) {
                clearPersonalBankAccount();
                Navigation.goBack(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
                return true;
            }
            goBack();
            return true;
        }

        prevPage();
        return true;
    };

    useAndroidBackButtonHandler(handleBackButtonPress);

    const handleNextScreen = () => {
        if (isEditing) {
            isLeavingEdit.current = true;
            finishPersonalBankAccountEdit(CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM);
            editDraftSnapshot.current = undefined;
            goBackToConfirmStep();
            return;
        }
        nextPage();
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="InternationalDepositAccountContent"
            shouldShowOfflineIndicatorInWideScreen={pageIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION}
        >
            {isRedirecting || isAccountLoading ? (
                <FullScreenLoadingIndicator />
            ) : (
                <>
                    <HeaderWithBackButton
                        title={translate('bankAccount.addBankAccount')}
                        shouldShowBackButton={pageIndex !== CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS}
                        onBackButtonPress={handleBackButtonPress}
                    />
                    <FormDraftPersistenceContext.Provider value={shouldPersistDraft}>
                        <CurrentPage
                            isEditing={isEditing}
                            onNext={handleNextScreen}
                            onMove={handleMove}
                            formValues={values}
                            fieldsMap={fieldsMap}
                        />
                    </FormDraftPersistenceContext.Provider>
                </>
            )}
        </ScreenWrapper>
    );
}

export default InternationalDepositAccountContent;
