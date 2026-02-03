import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSubPage from '@hooks/useSubPage';
import {clearDraftValues} from '@libs/actions/FormActions';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
import type CustomSubPageProps from './types';
import {getFieldsMap, getInitialPersonalDetailsValues, getInitialSubstep, getSubstepValues, testValidation} from './utils';

type InternationalDepositAccountContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    corpayFields: OnyxEntry<CorpayFields>;
    bankAccountList: OnyxEntry<BankAccountList>;
    draftValues: OnyxEntry<InternationalBankAccountForm>;
    country: OnyxEntry<string>;
    isAccountLoading: boolean;
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

function InternationalDepositAccountContent({privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, isAccountLoading}: InternationalDepositAccountContentProps) {
    const {translate} = useLocalize();

    const fieldsMap = useMemo(() => getFieldsMap(corpayFields), [corpayFields]);

    const values = useMemo(
        () => getSubstepValues(privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap),
        [privatePersonalDetails, corpayFields, bankAccountList, draftValues, country, fieldsMap],
    );

    const initialAccountHolderDetailsValues = useMemo(() => getInitialPersonalDetailsValues(privatePersonalDetails), [privatePersonalDetails]);

    const startFrom = useMemo(() => getInitialSubstep(values, fieldsMap), [fieldsMap, values]);

    const skipAccountTypeStep = isEmptyObject(fieldsMap[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE]);

    const skipAccountHolderInformationStep = testValidation(initialAccountHolderDetailsValues, fieldsMap[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS]);

    const skippedPages = getSkippedPages(skipAccountTypeStep, skipAccountHolderInformationStep);

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>>();
    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((r) => isFullScreenName(r.name)));

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

    const {CurrentPage, isEditing, nextPage, prevPage, pageIndex, moveTo, isRedirecting} = useSubPage<CustomSubPageProps>({
        pages,
        startFrom,
        onFinished: handleFinishStep,
        skipPages: skippedPages,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(route.params?.backTo, pageName, action),
    });

    const goBackToConfirmStep = () => {
        Navigation.goBack(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(route.params?.backTo, CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM, undefined));
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goBackToConfirmStep();
            return true;
        }

        // Clicking back on the first screen should dismiss the modal
        if (pageIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }

        // Clicking back on the success screen should dismiss the modal
        if (pageIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            goBack();
            return true;
        }
        prevPage();
        return true;
    };

    useHandleBackButton(handleBackButtonPress);

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }
        nextPage();
    }, [isEditing, goBackToConfirmStep, nextPage]);

    if (isRedirecting || isAccountLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="InternationalDepositAccountContent"
            shouldShowOfflineIndicatorInWideScreen={pageIndex === CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={handleBackButtonPress}
            />
            <CurrentPage
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                formValues={values}
                fieldsMap={fieldsMap}
            />
        </ScreenWrapper>
    );
}

export default InternationalDepositAccountContent;
