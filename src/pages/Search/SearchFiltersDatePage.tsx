import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useOnyx } from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import { FormOnyxValues } from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Search from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';


const currentDate = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);

function SearchFiltersDatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const areFiltersInitiated = !!(searchAdvancedFiltersForm && searchAdvancedFiltersForm[INPUT_IDS.DATE]);
    const defaultDate = areFiltersInitiated ? searchAdvancedFiltersForm[INPUT_IDS.DATE] : currentDate;

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        Search.mergeFilters(value);
        Navigation.goBack();
    };

    useEffect(() => {
        console.log(searchAdvancedFiltersForm);
    }, [searchAdvancedFiltersForm]);

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
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                        onSubmit={updateDate}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DATE}
                            label={translate('common.date')}
                            defaultValue={defaultDate}
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