import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersAmountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const greaterThan = searchAdvancedFiltersForm?.[INPUT_IDS.GREATER_THAN];
    const greaterThanFormattedAmount = greaterThan ? convertToFrontendAmountAsString(Number(greaterThan)) : undefined;
    const lessThan = searchAdvancedFiltersForm?.[INPUT_IDS.LESS_THAN];
    const lessThanFormattedAmount = lessThan ? convertToFrontendAmountAsString(Number(lessThan)) : undefined;
    const {inputCallbackRef} = useAutoFocusInput();

    const updateAmountFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const greater = values[INPUT_IDS.GREATER_THAN];
        const greaterThanBackendAmount = greater ? convertToBackendAmount(Number(greater)) : '';
        const less = values[INPUT_IDS.LESS_THAN];
        const lessThanBackendAmount = less ? convertToBackendAmount(Number(less)) : '';
        updateAdvancedFilters({greaterThan: greaterThanBackendAmount?.toString(), lessThan: lessThanBackendAmount?.toString()});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersAmountPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.total')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <FormProvider
                style={[styles.flex1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                onSubmit={updateAmountFilter}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={AmountWithoutCurrencyInput}
                        inputID={INPUT_IDS.GREATER_THAN}
                        name={INPUT_IDS.GREATER_THAN}
                        defaultValue={greaterThanFormattedAmount}
                        label={translate('search.filters.amount.greaterThan')}
                        accessibilityLabel={translate('search.filters.amount.greaterThan')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        uncontrolled
                        inputMode={CONST.INPUT_MODE.DECIMAL}
                    />
                </View>
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={AmountWithoutCurrencyInput}
                        inputID={INPUT_IDS.LESS_THAN}
                        name={INPUT_IDS.LESS_THAN}
                        defaultValue={lessThanFormattedAmount}
                        label={translate('search.filters.amount.lessThan')}
                        accessibilityLabel={translate('search.filters.amount.lessThan')}
                        role={CONST.ROLE.PRESENTATION}
                        uncontrolled
                        inputMode={CONST.INPUT_MODE.DECIMAL}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFiltersAmountPage.displayName = 'SearchFiltersAmountPage';

export default SearchFiltersAmountPage;
