import React, {useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SearchSavedSearchRenameForm';

function SavedSearchRenamePage({route}: {route: {params: {q: string; name: string}}}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {q, name} = route.params;
    const [newName, setNewName] = useState(name);
    const {inputCallbackRef} = useAutoFocusInput();

    const applyFiltersAndNavigate = () => {
        SearchActions.clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query: q,
                name: newName,
            }),
        );
    };

    const onSaveSearch = () => {
        const queryJSON = SearchQueryUtils.buildSearchQueryJSON(q || SearchQueryUtils.buildCannedSearchQuery()) ?? ({} as SearchQueryJSON);

        SearchActions.saveSearch({
            queryJSON,
            newName,
        });

        applyFiltersAndNavigate();
    };

    return (
        <ScreenWrapper
            testID={SavedSearchRenamePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton title={translate('common.rename')} />
            <FormProvider
                formID={ONYXKEYS.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM}
                submitButtonText={translate('common.save')}
                onSubmit={onSaveSearch}
                style={[styles.mh5, styles.flex1]}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME}
                    label={translate('search.searchName')}
                    accessibilityLabel={translate('search.searchName')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={(renamedName) => setNewName(renamedName)}
                    ref={inputCallbackRef}
                    defaultValue={name}
                    shouldShowClearButton
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SavedSearchRenamePage.displayName = 'SavedSearchRenamePage';

export default SavedSearchRenamePage;
