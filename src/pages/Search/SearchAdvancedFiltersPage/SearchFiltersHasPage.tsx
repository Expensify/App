import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type HasItem = {
    name: string;
    value: 'attachment' | 'link';
};

function SearchFiltersHasPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const hasItems: HasItem[] = useMemo(
        () => [
            {
                name: translate('common.attachment'),
                value: CONST.SEARCH.CHAT_TYPES.ATTACHMENT,
            },
            {
                name: translate('search.filters.link'),
                value: CONST.SEARCH.CHAT_TYPES.LINK,
            },
        ],
        [translate],
    );

    const selectedHasItems = useMemo(() => {
        return searchAdvancedFiltersForm?.has?.map((value) => hasItems.find((hasItem) => hasItem.value === value)).filter((item): item is HasItem => item !== undefined) ?? [];
    }, [searchAdvancedFiltersForm, hasItems]);

    const updateHasFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({has: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersHasPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.has')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('search.filters.has')}
                    items={hasItems}
                    initiallySelectedItems={selectedHasItems}
                    onSaveSelection={updateHasFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersHasPage.displayName = 'SearchFiltersHasPage';

export default SearchFiltersHasPage;
