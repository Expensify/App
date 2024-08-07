import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersMerchantPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const merchant = searchAdvancedFiltersForm?.[INPUT_IDS.MERCHANT];
    const {inputCallbackRef} = useAutoFocusInput();

    const updateMerchantFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersMerchantPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('common.merchant')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <FormProvider
                    style={[styles.flex1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                    onSubmit={updateMerchantFilter}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb5}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.MERCHANT}
                            name={INPUT_IDS.MERCHANT}
                            defaultValue={merchant}
                            maxLength={CONST.MERCHANT_NAME_MAX_LENGTH}
                            label={translate('common.merchant')}
                            accessibilityLabel={translate('common.merchant')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersMerchantPage.displayName = 'SearchFiltersMerchantPage';

export default SearchFiltersMerchantPage;
