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

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const activeItem = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.TYPE.EXPENSES;

    const filterTypeItems = useMemo(
        () => [
            {
                text: translate('common.expenses'),
                value: CONST.SEARCH.TYPE.EXPENSES,
                keyForList: CONST.SEARCH.TYPE.EXPENSES,
                isSelected: activeItem === CONST.SEARCH.TYPE.EXPENSES,
            },
        ],
        [translate, activeItem],
    );

    const updateType = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.mergeFilters(values);
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
                <View>
                    <SelectionList
                        sections={[{data: filterTypeItems}]}
                        onSelectRow={(item) => {
                            updateType({
                                type: item.value,
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

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
