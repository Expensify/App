import {format} from 'date-fns';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersApprovedPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const dateAfter = searchAdvancedFiltersForm?.[FILTER_KEYS.APPROVED_AFTER] ? format(searchAdvancedFiltersForm?.[FILTER_KEYS.APPROVED_AFTER], 'yyyy-MM-dd') : undefined;
    const dateBefore = searchAdvancedFiltersForm?.[FILTER_KEYS.APPROVED_BEFORE] ? format(searchAdvancedFiltersForm?.[FILTER_KEYS.APPROVED_BEFORE], 'yyyy-MM-dd') : undefined;

    const updateDateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersApprovedPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.approved')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <FormProvider
                style={[styles.flex1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                onSubmit={updateDateFilter}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={FILTER_KEYS.APPROVED_AFTER}
                    label={translate('search.filters.date.after')}
                    defaultValue={dateAfter}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={FILTER_KEYS.APPROVED_BEFORE}
                    label={translate('search.filters.date.before')}
                    defaultValue={dateBefore}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFiltersApprovedPage.displayName = 'SearchFiltersApprovedPage';

export default SearchFiltersApprovedPage;
