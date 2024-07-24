import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const activeItem = searchAdvancedFiltersForm?.status;

    const filterStatusItems = useMemo(
        () => [
            {
                text: translate('common.all'),
                value: CONST.SEARCH.TAB.ALL,
                keyForList: CONST.SEARCH.TAB.ALL,
                isSelected: activeItem === CONST.SEARCH.TAB.ALL,
            },
            {
                text: translate('common.shared'),
                value: CONST.SEARCH.TAB.SHARED,
                keyForList: CONST.SEARCH.TAB.SHARED,
                isSelected: activeItem === CONST.SEARCH.TAB.SHARED,
            },
            {
                text: translate('common.drafts'),
                value: CONST.SEARCH.TAB.DRAFTS,
                keyForList: CONST.SEARCH.TAB.DRAFTS,
                isSelected: activeItem === CONST.SEARCH.TAB.DRAFTS,
            },
            {
                text: translate('common.finished'),
                value: CONST.SEARCH.TAB.FINISHED,
                keyForList: CONST.SEARCH.TAB.FINISHED,
                isSelected: activeItem === CONST.SEARCH.TAB.FINISHED,
            },
        ],
        [translate, activeItem],
    );

    const updateType = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('search.filters.status')} />
                <View style={[styles.flex1]}>
                    <SelectionList
                        sections={[{data: filterStatusItems}]}
                        onSelectRow={(item) => {
                            updateType({
                                status: item.value,
                            });
                        }}
                        initiallyFocusedOptionKey={activeItem}
                        shouldStopPropagation
                        ListItem={RadioListItem}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';

export default SearchFiltersStatusPage;
