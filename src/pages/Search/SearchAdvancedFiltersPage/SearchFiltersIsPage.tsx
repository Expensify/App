import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getChatStatusTranslationKey} from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersIsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedChatStatuses = searchAdvancedFiltersForm?.is?.map((chatStatus) => {
        const chatStatusName = translate(getChatStatusTranslationKey(chatStatus as ValueOf<typeof CONST.SEARCH.CHAT_STATUS>));
        return {name: chatStatusName, value: chatStatus};
    });
    const allChatStatuses = Object.values(CONST.SEARCH.CHAT_STATUS);

    const chatStatusItems = useMemo(() => {
        return allChatStatuses.map((chatStatus) => {
            const chatStatusName = translate(getChatStatusTranslationKey(chatStatus));
            return {name: chatStatusName, value: chatStatus};
        });
    }, [allChatStatuses, translate]);

    const updateChatIsFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({is: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersIsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.is')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('search.filters.is')}
                    items={chatStatusItems}
                    initiallySelectedItems={selectedChatStatuses}
                    onSaveSelection={updateChatIsFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersIsPage.displayName = 'SearchFiltersIsPage';

export default SearchFiltersIsPage;
