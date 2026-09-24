import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type MoneyRequestReportGroupByButtonProps = {
    /** The layout selection currently shown to the user */
    currentSelection: OnyxTypes.ReportLayoutSelection;

    /** Called with the picked layout selection */
    onSelect: (selection: OnyxTypes.ReportLayoutSelection) => void;
};

/**
 * The "Group by" dropdown of the money-request report view: shows the current grouping and lets the
 * user pick category/tag grouping or the flat matrix layout.
 */
function MoneyRequestReportGroupByButton({currentSelection, onSelect}: MoneyRequestReportGroupByButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();

    const groupByItems = [
        {
            text: translate('reportLayout.groupBy.category'),
            value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
        },
        {
            text: translate('reportLayout.groupBy.tag'),
            value: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
        },
        {
            text: translate('common.none'),
            value: CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX,
        },
    ];

    const isLayoutMatrixSelected = currentSelection === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
    const selectedGroupByItem = groupByItems.find((item) => item.value === currentSelection) ?? groupByItems.at(0);

    const groupByOptions = groupByItems.map((item) => ({
        text: item.text,
        keyForList: item.value,
        isSelected: item.value === currentSelection,
    }));

    const groupByPopoverComponent = (props: {closeOverlay: () => void}) => (
        <View style={[styles.pv4]}>
            <View
                style={styles.getSelectionListPopoverHeight({
                    itemCount: groupByOptions.length || 1,
                    itemHeight: shouldUseNarrowLayout ? variables.optionRowHeight : variables.optionRowHeightCompact,
                    windowHeight,
                    isInLandscapeMode,
                    hasButton: false,
                })}
            >
                <SelectionList
                    data={groupByOptions}
                    shouldSingleExecuteRowSelect
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item) => {
                        if (!item.keyForList) {
                            return;
                        }
                        onSelect(item.keyForList);
                        props.closeOverlay();
                    }}
                    style={{contentContainerStyle: [styles.pb0], listItemWrapperStyle: shouldUseNarrowLayout ? undefined : styles.optionRowCompact}}
                />
            </View>
        </View>
    );

    return (
        <DropdownButton
            label={translate('search.display.groupBy')}
            value={isLayoutMatrixSelected ? '' : (selectedGroupByItem?.text ?? '')}
            PopoverComponent={groupByPopoverComponent}
        />
    );
}

export default MoneyRequestReportGroupByButton;
