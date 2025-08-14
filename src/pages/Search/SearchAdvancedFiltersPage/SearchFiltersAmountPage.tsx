import React from 'react';
import {View} from 'react-native';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchAmountFilterKeys} from '@components/Search/types';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersAmountBase(filterKey: SearchAmountFilterKeys) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const greaterThan = searchAdvancedFiltersForm?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`];
    const greaterThanFormattedAmount = greaterThan ? convertToFrontendAmountAsString(Number(greaterThan)) : undefined;
    const lessThan = searchAdvancedFiltersForm?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`];
    const lessThanFormattedAmount = lessThan ? convertToFrontendAmountAsString(Number(lessThan)) : undefined;
    const {inputCallbackRef} = useAutoFocusInput();

    const updateAmountFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const greater = values[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`];
        const greaterThanBackendAmount = greater ? convertToBackendAmount(Number(greater)) : '';
        const less = values[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`];
        const lessThanBackendAmount = less ? convertToBackendAmount(Number(less)) : '';
        updateAdvancedFilters({[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`]: greaterThanBackendAmount?.toString(), [`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`]: lessThanBackendAmount?.toString()});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersAmountBase.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.amount')}
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
                        inputID={`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`}
                        name={`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`}
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
                        inputID={`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`}
                        name={`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`}
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

SearchFiltersAmountBase.displayName = 'SearchFiltersAmountBase';

export default SearchFiltersAmountBase;
