import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SearchSavedSearchRenameForm';

import React from 'react';

function SavedSearchRenamePage({route}: {route: {params: {id: string}}}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {id} = route.params;
    const [savedSearch] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {selector: (savedSearches) => savedSearches?.[id]});
    const q = savedSearch?.query;
    const {inputCallbackRef} = useAutoFocusInput();

    const applyFiltersAndNavigate = (newName: string) => {
        if (!q) {
            return;
        }

        Navigation.dismissModal();
        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: q,
                    name: newName,
                }),
            );
        });
    };

    const onSaveSearch = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM>) => {
        if (!q) {
            return;
        }

        const newName = values[INPUT_IDS.NAME].trim();
        const queryJSON = buildSearchQueryJSON(q) ?? ({} as SearchQueryJSON);

        saveSearch({
            id,
            queryJSON,
            newName,
        });

        applyFiltersAndNavigate(newName);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM> =>
        getFieldRequiredErrors(values, [INPUT_IDS.NAME], translate);

    return (
        <ScreenWrapper
            testID="SavedSearchRenamePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!savedSearch}>
                <HeaderWithBackButton title={translate('common.rename')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={onSaveSearch}
                    validate={validate}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NAME}
                        label={translate('search.searchName')}
                        accessibilityLabel={translate('search.searchName')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        defaultValue={savedSearch?.name}
                    />
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SavedSearchRenamePage;
