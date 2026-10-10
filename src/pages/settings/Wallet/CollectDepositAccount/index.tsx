import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLoadDepositAccountSetup from '@hooks/useLoadDepositAccountSetup';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues} from '@libs/actions/FormActions';
import {getBankAccountFields, hasLocalBankAccountFields} from '@libs/BankAccountFields';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/native';
import {createIsInternationalCountrySelector} from '@selectors/Policy';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import type CustomSubPageProps from './types';

import BankAccountDetails from './subPages/BankAccountDetails';
import Confirmation from './subPages/Confirmation';
import CountrySelection from './subPages/CountrySelection';
import Success from './subPages/Success';

const PAGE_NAME = CONST.COLLECT_DEPOSIT_ACCOUNT.PAGE_NAME;
const STEP_INDEXES = CONST.COLLECT_DEPOSIT_ACCOUNT.INDEXES.MAPPING;

const pages = [
    {pageName: PAGE_NAME.COUNTRY, component: CountrySelection},
    {pageName: PAGE_NAME.BANK_ACCOUNT_DETAILS, component: BankAccountDetails},
    {pageName: PAGE_NAME.CONFIRM, component: Confirmation},
    {pageName: PAGE_NAME.SUCCESS, component: Success},
];

function CollectDepositAccount() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isLoadingCountries = useLoadDepositAccountSetup();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.COLLECT_DEPOSIT_ACCOUNT>>();
    const backTo = route.params?.backTo;
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM_DRAFT);

    const formValues = draftValues ?? {};
    const bankCountry = formValues[INPUT_IDS.BANK_COUNTRY] ?? '';
    const [isInternationalCountry = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createIsInternationalCountrySelector(bankCountry)});

    const fieldsType = !isInternationalCountry && hasLocalBankAccountFields(bankCountry) ? CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL : CONST.BANK_ACCOUNT.FIELDS_TYPE.INTERNATIONAL;
    const fieldsMap = getBankAccountFields(bankCountry, formValues[INPUT_IDS.BANK_CURRENCY] ?? '', fieldsType);

    const goBack = () => {
        clearDraftValues(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM);
        Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET);
    };

    const {CurrentPage, isEditing, nextPage, prevPage, pageIndex, moveTo, isRedirecting} = useSubPage<CustomSubPageProps>({
        pages,
        startFrom: STEP_INDEXES.COUNTRY_SELECTOR,
        onFinished: goBack,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_COLLECT_DEPOSIT_ACCOUNT.getRoute(backTo, pageName, action),
    });

    const goBackToConfirmPage = () => {
        Navigation.goBack(ROUTES.SETTINGS_COLLECT_DEPOSIT_ACCOUNT.getRoute(backTo, PAGE_NAME.CONFIRM, undefined));
    };

    const handleNextPage = () => {
        if (isEditing) {
            goBackToConfirmPage();
            return;
        }
        nextPage();
    };

    // The drafted currency can stop being one the country collects, if a policy change flips the fields from
    // international to local. There is then nothing to fill in, so later steps would submit an empty account.
    // Success is exempt because the draft is cleared once the account exists.
    const shouldReturnToCountryStep = isEmptyObject(fieldsMap) && pageIndex !== STEP_INDEXES.COUNTRY_SELECTOR && pageIndex !== STEP_INDEXES.SUCCESS;

    useEffect(() => {
        if (!shouldReturnToCountryStep) {
            return;
        }
        moveTo(STEP_INDEXES.COUNTRY_SELECTOR, false);
    }, [shouldReturnToCountryStep, moveTo]);

    const handleBackButtonPress = () => {
        if (isEditing) {
            goBackToConfirmPage();
            return true;
        }

        // The account already exists by the success page, so going back to resubmit it makes no sense.
        if (pageIndex === STEP_INDEXES.COUNTRY_SELECTOR || pageIndex === STEP_INDEXES.SUCCESS) {
            goBack();
            return true;
        }

        prevPage();
        return true;
    };

    useAndroidBackButtonHandler(handleBackButtonPress);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="CollectDepositAccount"
        >
            <HeaderWithBackButtonAndTitle
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={handleBackButtonPress}
            />
            {isRedirecting || shouldReturnToCountryStep || (isLoadingCountries && pageIndex !== STEP_INDEXES.COUNTRY_SELECTOR) ? (
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <CurrentPage
                    isEditing={isEditing}
                    onNext={handleNextPage}
                    onMove={moveTo}
                    formValues={formValues}
                    fieldsMap={fieldsMap}
                    fieldsType={fieldsType}
                />
            )}
        </ScreenWrapper>
    );
}

CollectDepositAccount.displayName = 'CollectDepositAccount';

export default CollectDepositAccount;
