import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchColumnsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const allColumns = Object.values(CONST.SEARCH.COLUMNS);

    const initiallySelectedColumns = searchAdvancedFiltersForm?.columns?.filter((columnId) => Object.values(CONST.SEARCH.COLUMNS).includes(columnId as ValueOf<typeof CONST.SEARCH.COLUMNS>));

    const sections = [
        {
            title: undefined,
            data: allColumns.map((columnId) => ({
                text: translate(getSearchColumnTranslationKey(columnId)),
                value: columnId,
                keyForList: columnId,
                isSelected: initiallySelectedColumns?.includes(columnId),
            })),
        },
    ];

    const applyChanges = () => {};


    return (
        <ScreenWrapper
            testID={SearchColumnsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.columms')} />
            <View style={[styles.flex1]}>
                <SelectionList
                    sections={sections}
                    onSelectRow={onSelectItem}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={MultiSelectListItem}
                    footerContent={<SearchFilterPageFooterButtons applyChanges={applyChanges} />}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchColumnsPage.displayName = 'SearchColumnsPage';

export default SearchColumnsPage;
