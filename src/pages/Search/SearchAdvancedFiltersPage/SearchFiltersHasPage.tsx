import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getHasOptions} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersHasPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const currentType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.HAS_FILTER_NEGATION);
    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        if (!searchAdvancedFiltersForm?.has) {
            return [];
        }
        return searchAdvancedFiltersForm.has;
    });

    const items = useMemo(() => getHasOptions(translate, currentType), [translate, currentType]);

    const listData: ListItem[] = useMemo(() => {
        return items.map((hasOption) => ({
            text: hasOption.text,
            keyForList: hasOption.value,
            isSelected: selectedItems.includes(hasOption.value),
        }));
    }, [items, selectedItems]);

    const updateSelectedItems = (listItem: ListItem) => {
        if (shouldShowProductTrainingTooltip) {
            hideProductTrainingTooltip();
        }
        if (listItem.isSelected) {
            setSelectedItems(selectedItems.filter((i) => i !== listItem.keyForList));
            return;
        }

        const newItem = items.find((i) => i.value === listItem.keyForList)?.value;

        if (newItem) {
            setSelectedItems([...selectedItems, newItem]);
        }
    };

    const resetChanges = () => {
        setSelectedItems([]);
    };

    const applyChanges = () => {
        updateAdvancedFilters({has: selectedItems});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    if (searchAdvancedFiltersFormResult.status === 'loading') {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="SearchFiltersHasPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <EducationalTooltip
                shouldRender={shouldShowProductTrainingTooltip && currentType === CONST.SEARCH.DATA_TYPES.EXPENSE}
                renderTooltipContent={renderProductTrainingTooltip}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                maxWidth={variables.hasFilterNegationTooltipMaxWidth}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                shiftHorizontal={variables.hasFilterNegationTooltipShiftHorizontal}
                shiftVertical={variables.hasFilterNegationTooltipShiftVertical}
            >
                <View>
                    <HeaderWithBackButton
                        title={translate('search.has')}
                        onBackButtonPress={() => {
                            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                        }}
                    />
                </View>
            </EducationalTooltip>
            <View style={[styles.flex1]}>
                <SelectionList
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    shouldSingleExecuteRowSelect
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    resetChanges={resetChanges}
                    applyChanges={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default SearchFiltersHasPage;
