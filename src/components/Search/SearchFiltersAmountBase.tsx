import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAmountFilterKeys} from './types';

function SearchFiltersAmountBase({title, filterKey, testID}: {title: TranslationPaths; filterKey: SearchAmountFilterKeys; testID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | null>(null);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const equalToKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}` as keyof SearchAdvancedFiltersForm;
    const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as keyof SearchAdvancedFiltersForm;
    const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as keyof SearchAdvancedFiltersForm;

    const equalTo = searchAdvancedFiltersForm?.[equalToKey];
    const equalToFormattedAmount = equalTo ? convertToFrontendAmountAsString(Number(equalTo)) : undefined;
    const greaterThan = searchAdvancedFiltersForm?.[greaterThanKey];
    const greaterThanFormattedAmount = greaterThan ? convertToFrontendAmountAsString(Number(greaterThan)) : undefined;
    const lessThan = searchAdvancedFiltersForm?.[lessThanKey];
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

        const fieldKey = `${filterKey}${selectedModifier}` as keyof SearchAdvancedFiltersForm;
        const fieldValue = values[fieldKey as keyof FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>];
        const rawAmount = String(fieldValue ?? '');
        const isAmountEmpty = rawAmount.trim() === '';

        if (isAmountEmpty) {
            updateAdvancedFilters({[fieldKey]: null});
            goBack();
            return;
        }

        // Build updates: clear on empty, otherwise persist formatted amount.
        const updates: Record<string, string | null> = {
            [fieldKey]: convertToBackendAmount(Number(rawAmount)).toString(),
        };

        // When setting an Equal To value, clear Greater Than and Less Than to avoid conflicting filters.
        if (selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO) {
            updates[greaterThanKey] = null;
            updates[lessThanKey] = null;
        }

        // When setting Greater Than or Less Than, clear Equal To to avoid conflicting filters.
        if (selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN || selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN) {
            updates[equalToKey] = null;
        }

        updateAdvancedFilters(updates);
        goBack();
    };

    const reset = () => {
        updateAdvancedFilters({
            [equalToKey]: null,
            [greaterThanKey]: null,
            [lessThanKey]: null,
        });
    };

    const save = () => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const fieldTitle = useMemo(() => {
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
    }, [selectedModifier, title, translate]);

    const getCurrentValue = () => {
        if (!selectedModifier) {
            return undefined;
        }
        switch (selectedModifier) {
            case CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO:
                return equalToFormattedAmount;
            case CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN:
                return greaterThanFormattedAmount;
            case CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN:
                return lessThanFormattedAmount;
            default:
                return undefined;
        }
    };

    const handleModifierSelect = (modifier: ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>) => {
        setSelectedModifier(modifier);
    };

    const modifierConfig = [
        {
            modifier: CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO,
            titleKey: 'search.filters.amount.equalTo' as const,
            description: equalToFormattedAmount,
        },
        {
            modifier: CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN,
            titleKey: 'search.filters.amount.greaterThan' as const,
            description: greaterThanFormattedAmount,
        },
        {
            modifier: CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN,
            titleKey: 'search.filters.amount.lessThan' as const,
            description: lessThanFormattedAmount,
        },
    ];

    if (!selectedModifier) {
        return (
            <ScreenWrapper
                testID={testID}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={fieldTitle}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute())}
                />
                <View style={styles.flex1}>
                    <View style={styles.flexGrow1}>
                        {modifierConfig.map(({modifier, titleKey, description}) => (
                            <MenuItem
                                key={modifier}
                                title={translate(titleKey)}
                                description={description}
                                onPress={() => handleModifierSelect(modifier)}
                                shouldShowRightIcon
                                viewMode={CONST.OPTION_MODE.COMPACT}
                            />
                        ))}
                    </View>
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
        <ScreenWrapper
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                onBackButtonPress={goBack}
                title={fieldTitle}
            />
            <FormProvider
                style={[styles.flex1, styles.ph4]}
                formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                onSubmit={updateAmountFilter}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={AmountWithoutCurrencyInput}
                        inputID={`${filterKey}${selectedModifier}`}
                        name={`${filterKey}${selectedModifier}`}
                        defaultValue={getCurrentValue()}
                        label={fieldTitle}
                        accessibilityLabel={fieldTitle}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        inputMode={CONST.INPUT_MODE.DECIMAL}
                        shouldAllowNegative
                        autoFocus
                        uncontrolled
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFiltersAmountBase.displayName = 'SearchFiltersAmountBase';

export default SearchFiltersAmountBase;
