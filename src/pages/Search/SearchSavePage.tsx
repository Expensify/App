import React, {useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useFilterCardValue from '@components/Search/hooks/useFilterCardValue';
import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterReportValue from '@components/Search/hooks/useFilterReportValue';
import useFilterTaxRateValue from '@components/Search/hooks/useFilterTaxRateValue';
import useFilterUserValue from '@components/Search/hooks/useFilterUserValue';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';
import {useSearchStateContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {mapFiltersFormToLabelValueList} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import INPUT_IDS from '@src/types/form/SearchSaveForm';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type FilterValueProps = {
    value: SearchFilter['value'];
};

type FilterValueWithKeyProps = FilterValueProps & {
    filterKey: SearchAdvancedFiltersKey;
};

function FilterUserValue({value}: FilterValueProps) {
    return useFilterUserValue(value);
}

function FilterWorkspaceValue({value}: FilterValueProps) {
    return useFilterWorkspaceValue(value);
}

function FilterFeedValue() {
    return useFilterFeedValue();
}

function FilterCardValue() {
    return useFilterCardValue();
}

function FilterTaxRateValue() {
    return useFilterTaxRateValue();
}

function FilterReportValue({value}: FilterValueProps) {
    return useFilterReportValue(value);
}

function FilterValue({filterKey, value}: FilterValueWithKeyProps) {
    if (filterKey === FILTER_KEYS.FROM || filterKey === FILTER_KEYS.TO || filterKey === FILTER_KEYS.ATTENDEE || filterKey === FILTER_KEYS.ASSIGNEE) {
        return <FilterUserValue value={value} />;
    }

    if (filterKey === FILTER_KEYS.POLICY_ID) {
        return <FilterWorkspaceValue value={value} />;
    }

    if (filterKey === FILTER_KEYS.FEED) {
        return <FilterFeedValue />;
    }

    if (filterKey === FILTER_KEYS.CARD_ID) {
        return <FilterCardValue />;
    }

    if (filterKey === FILTER_KEYS.TAX_RATE) {
        return <FilterTaxRateValue />;
    }

    if (filterKey === FILTER_KEYS.IN) {
        return <FilterReportValue value={value} />;
    }

    return value;
}

function SearchSavePage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [name, setName] = useState('');

    const {currentSearchQueryJSON} = useSearchStateContext();

    const onSaveSearch = () => {
        if (!currentSearchQueryJSON) {
            Navigation.goBack();
            return;
        }

        const newName = name.trim() || currentSearchQueryJSON?.inputQuery;
        saveSearch({queryJSON: currentSearchQueryJSON, newName});
        Navigation.goBack();
    };

    const appliedFilters = mapFiltersFormToLabelValueList(searchAdvancedFiltersForm, undefined, undefined, translate, localeCompare);

    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <ScreenWrapper
            testID="SearchSavePage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.saveSearch')} />
            <FormProvider
                formID={ONYXKEYS.FORMS.SEARCH_SAVE_FORM}
                submitButtonText={translate('search.saveSearch')}
                onSubmit={onSaveSearch}
                style={[styles.mh5, styles.flex1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_SEARCH_BUTTON}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME}
                    ref={inputCallbackRef}
                    value={name}
                    onChangeText={setName}
                    placeholder={translate('common.name')}
                    accessibilityLabel={translate('common.name')}
                    role={CONST.ROLE.PRESENTATION}
                />
                <Text style={[styles.textLabelSupporting, styles.mb2, styles.mt5]}>{translate('search.appliedFilters')}:</Text>
                {appliedFilters.length > 0 ? (
                    appliedFilters.map((filter) => (
                        <View
                            style={[styles.flexRow]}
                            key={filter.key}
                        >
                            <Text style={[styles.label, styles.ph2]}>{CONST.DOT_SEPARATOR}</Text>
                            <Text style={[styles.label]}>
                                <Text style={[styles.labelStrong]}>{filter.label}: </Text>
                                <FilterValue
                                    filterKey={filter.key}
                                    value={filter.value}
                                />
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text>{translate('common.none')}</Text>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

export default SearchSavePage;
