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
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDateFilterKeys} from './types';

type SearchDateFilterBaseProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDateFilterBase({dateKey, titleKey}: SearchDateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const unformattedDateAfter = searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`];
    const unformattedDateBefore = searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`];
    const dateAfter = unformattedDateAfter ? format(unformattedDateAfter, 'yyyy-MM-dd') : undefined;
    const dateBefore = unformattedDateBefore ? format(unformattedDateBefore, 'yyyy-MM-dd') : undefined;

    const updateDateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchDateFilterBase.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
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
                    inputID={`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`}
                    label={translate('search.filters.date.after')}
                    defaultValue={dateAfter}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`}
                    label={translate('search.filters.date.before')}
                    defaultValue={dateBefore}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchDateFilterBase.displayName = 'SearchDateFilterBase';

export default SearchDateFilterBase;
