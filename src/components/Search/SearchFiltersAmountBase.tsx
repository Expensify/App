import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAmountFilterKeys} from './types';

function SearchFiltersAmountBase({title, filterKey, testID}: {title: TranslationPaths; filterKey: SearchAmountFilterKeys; testID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const [selectedModifier, setSelectedModifier] = useState<string | null>(null);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const equalTo = searchAdvancedFiltersForm?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}` as keyof typeof searchAdvancedFiltersForm];
    const equalToFormattedAmount = equalTo ? convertToFrontendAmountAsString(Number(equalTo)) : undefined;
    const greaterThan = searchAdvancedFiltersForm?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as keyof typeof searchAdvancedFiltersForm];
    const greaterThanFormattedAmount = greaterThan ? convertToFrontendAmountAsString(Number(greaterThan)) : undefined;
    const lessThan = searchAdvancedFiltersForm?.[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as keyof typeof searchAdvancedFiltersForm];
    const lessThanFormattedAmount = lessThan ? convertToFrontendAmountAsString(Number(lessThan)) : undefined;

    const goBack = () => {
        if (selectedModifier) {
            setSelectedModifier(null);
        } else {
            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
        }
    };

    const updateAmountFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        if (!selectedModifier) {
            return;
        }

        const fieldKey = `${filterKey}${selectedModifier}` as keyof typeof searchAdvancedFiltersForm;
        const rawAmount = values[fieldKey] as unknown;
        const amountStr = rawAmount == null ? '' : String(rawAmount);
        const isEmpty = amountStr.trim() === '';

        // If empty, clear the value (like reset for this modifier); otherwise, persist formatted amount.
        updateAdvancedFilters({
            [fieldKey]: isEmpty ? null : convertToBackendAmount(Number(amountStr)).toString(),
        });
        goBack();
    };

    const reset = useCallback(() => {
        updateAdvancedFilters({
            [`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`]: null,
            [`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`]: null,
            [`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`]: null,
        });
    }, [filterKey]);

    const save = useCallback(() => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, []);

    const getTitle = () => {
        if (!selectedModifier) {
            return translate(title);
        }
        switch (selectedModifier) {
            case CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO:
                return translate('search.filters.amount.equalTo');
            case CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN:
                return translate('search.filters.amount.greaterThan');
            case CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN:
                return translate('search.filters.amount.lessThan');
            default:
                return translate(title);
        }
    };

    const getCurrentValue = () => {
        if (!selectedModifier) {
            return undefined;
        }
        const fieldKey = `${filterKey}${selectedModifier}` as keyof typeof searchAdvancedFiltersForm;
        const value = searchAdvancedFiltersForm?.[fieldKey];
        return value ? convertToFrontendAmountAsString(Number(value)) : undefined;
    };

    const handleModifierSelect = useCallback((modifier: string) => {
        setSelectedModifier(modifier);
    }, []);

    useEffect(() => {
        if (!selectedModifier) {
            return;
        }
        const handle = InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus?.();
        });
        return () => handle.cancel();
    }, [selectedModifier, inputRef]);

    if (!selectedModifier) {
        return (
            <ScreenWrapper testID={testID}>
                <HeaderWithBackButton
                    title={translate(title)}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute())}
                />
                <View style={[styles.flex1]}>
                    <MenuItem
                        title={translate('search.filters.amount.equalTo')}
                        description={equalToFormattedAmount}
                        onPress={() => handleModifierSelect(CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO)}
                        shouldShowRightIcon
                    />
                    <MenuItem
                        title={translate('search.filters.amount.greaterThan')}
                        description={greaterThanFormattedAmount}
                        onPress={() => handleModifierSelect(CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN)}
                        shouldShowRightIcon
                    />
                    <MenuItem
                        title={translate('search.filters.amount.lessThan')}
                        description={lessThanFormattedAmount}
                        onPress={() => handleModifierSelect(CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN)}
                        shouldShowRightIcon
                    />
                    <View style={styles.flexGrow1} />
                    <Button
                        text={translate('common.reset')}
                        onPress={reset}
                        style={[styles.mh4, styles.mt4]}
                        large
                    />
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                        onSubmit={save}
                        enabledWhenOffline
                    />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID={testID}>
            <HeaderWithBackButton
                onBackButtonPress={goBack}
                title={getTitle()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                onSubmit={updateAmountFilter}
                submitButtonText={translate('common.save')}
                style={[styles.flexGrow1, styles.ph5]}
                enabledWhenOffline
            >
                <View style={[styles.mt5]}>
                    <InputWrapper
                        InputComponent={AmountWithoutCurrencyInput}
                        inputID={`${filterKey}${selectedModifier}`}
                        name={`${filterKey}${selectedModifier}`}
                        defaultValue={getCurrentValue()}
                        label={getTitle()}
                        accessibilityLabel={getTitle()}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        inputMode={CONST.INPUT_MODE.DECIMAL}
                        uncontrolled
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFiltersAmountBase.displayName = 'SearchFiltersAmountBase';

export default SearchFiltersAmountBase;
