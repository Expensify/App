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

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const activeItem = searchAdvancedFiltersForm?.type;

    const filterTypeItems = useMemo(
        () => [
            {
                text: translate('common.expenses'),
                value: CONST.SEARCH.TYPE.EXPENSE,
                keyForList: CONST.SEARCH.TYPE.EXPENSE,
                isSelected: activeItem === CONST.SEARCH.TYPE.EXPENSE,
            },
        ],
        [translate, activeItem],
    );

    const updateType = (values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) => {
        SearchActions.updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.type')} />
                <View style={[styles.flex1]}>
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
