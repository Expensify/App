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
import ROUTES from '@src/ROUTES';

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const activeItem = searchAdvancedFiltersForm?.status;

    const filterStatusItems = useMemo(
        () => [
            {
                text: translate('common.all'),
                value: CONST.SEARCH.STATUS.ALL,
                keyForList: CONST.SEARCH.STATUS.ALL,
                isSelected: activeItem === CONST.SEARCH.STATUS.ALL,
            },
            {
                text: translate('common.shared'),
                value: CONST.SEARCH.STATUS.SHARED,
                keyForList: CONST.SEARCH.STATUS.SHARED,
                isSelected: activeItem === CONST.SEARCH.STATUS.SHARED,
            },
            {
                text: translate('common.drafts'),
                value: CONST.SEARCH.STATUS.DRAFTS,
                keyForList: CONST.SEARCH.STATUS.DRAFTS,
                isSelected: activeItem === CONST.SEARCH.STATUS.DRAFTS,
            },
            {
                text: translate('common.finished'),
                value: CONST.SEARCH.STATUS.FINISHED,
                keyForList: CONST.SEARCH.STATUS.FINISHED,
                isSelected: activeItem === CONST.SEARCH.STATUS.FINISHED,
            },
        ],
        [translate, activeItem],
    );

    const updateStatus = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
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
                            updateStatus({
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
