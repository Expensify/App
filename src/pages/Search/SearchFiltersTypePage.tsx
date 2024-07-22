import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Picker from '@components/Picker';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const filterTypeItems = [
        {
            label: translate('common.expenses'),
            value: CONST.SEARCH.TYPE.EXPENSES,
        },
    ];

    const updateType = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        SearchActions.mergeFilters(value);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.type')} />
                <View style={[styles.flex1, styles.ph3]}>
                    <FormProvider
                        style={[styles.flex1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                        onSubmit={updateType}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <InputWrapper
                            InputComponent={Picker}
                            inputID={INPUT_IDS.TYPE}
                            label={translate('common.type')}
                            items={filterTypeItems}
                            defaultValue={searchAdvancedFiltersForm?.type ?? CONST.SEARCH.TYPE.EXPENSES}
                        />
                    </FormProvider>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
