import React, {useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SavedSearchRenamePage({route}: {route: {params: {q: string; name: string}}}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {q, name} = route.params;
    const [newName, setNewName] = useState(name);

    const applyFiltersAndNavigate = () => {
        SearchActions.clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query: q,
                isCustomQuery: true,
            }),
        );
    };

    const onSaveSearch = () => {
        const queryJSON = SearchUtils.buildSearchQueryJSON(q);
        if (!queryJSON) {
            return;
        }

        SearchActions.saveSearch({
            queryJSON,
            name: newName,
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
                formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                submitButtonText={translate('common.save')}
                onSubmit={onSaveSearch}
                style={[styles.mh5, styles.flex1]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="name"
                    name="name"
                    defaultValue={name}
                    label={translate('search.searchName')}
                    accessibilityLabel={translate('search.searchName')}
                    role={CONST.ROLE.PRESENTATION}
                    onChangeText={(renamedName) => setNewName(renamedName)}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SavedSearchRenamePage.displayName = 'SavedSearchRenamePage';

export default SavedSearchRenamePage;
