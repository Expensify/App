import React from 'react';
import {View} from 'react-native';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import type {SearchFilterSelectionListProps} from '@components/Search/types';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHasOptions} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {filterTypeSelector} from '@src/selectors/Search';
import type {HasFilterValues} from '@src/types/form/SearchAdvancedFiltersForm';
import MultiSelect from './MultiSelect';

type HasSelectorProps = SearchFilterSelectionListProps & {
    value: HasFilterValues | undefined;
    onChange: (item: HasFilterValues) => void;
};

function HasSelector({value = [], selectionListStyle, footer, onChange}: HasSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [type = CONST.SEARCH.DATA_TYPES.EXPENSE] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterTypeSelector});
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.HAS_FILTER_NEGATION);
    const shouldRenderTooltip = shouldShowProductTrainingTooltip && type === CONST.SEARCH.DATA_TYPES.EXPENSE;

    const items = getHasOptions(translate, type);
    const multiSelectValues = items.filter((item) => value.includes(item.value));

    return (
        <MultiSelect
            items={items}
            value={multiSelectValues}
            itemWrapper={({children, item}) => (
                <EducationalTooltip
                    shouldRender={item.keyForList === CONST.SEARCH.HAS_VALUES.RECEIPT && shouldRenderTooltip}
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
                    <View>{children}</View>
                </EducationalTooltip>
            )}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(selectedItems) => {
                if (shouldRenderTooltip) {
                    hideProductTrainingTooltip();
                }
                onChange(selectedItems.map((item) => item.value));
            }}
        />
    );
}

export default HasSelector;
