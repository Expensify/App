import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {mergeFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

const DEFAULT_DATE = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
const DEFAULT_FILTERS_FORM_VALUE = {[INPUT_IDS.DATE_AFTER]: DEFAULT_DATE, [INPUT_IDS.DATE_BEFORE]: DEFAULT_DATE};

function SearchFiltersDatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm = DEFAULT_FILTERS_FORM_VALUE] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const defaultDateAfter = searchAdvancedFiltersForm[INPUT_IDS.DATE_AFTER];
    const defaultDateBefore = searchAdvancedFiltersForm[INPUT_IDS.DATE_BEFORE];

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        mergeFilters(value);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersDatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.date')} />
                <View style={[styles.flex1, styles.ph3]}>
                    <FormProvider
                        style={[styles.flex1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                        onSubmit={updateDate}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DATE_AFTER}
                            label={translate('search.filters.date.after')}
                            defaultValue={defaultDateAfter}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        />
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DATE_BEFORE}
                            label={translate('search.filters.date.before')}
                            defaultValue={defaultDateBefore}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        />
                    </FormProvider>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersDatePage.displayName = 'SearchFiltersDatePage';

export default SearchFiltersDatePage;
