/**
 * Popover picker for inline editing a member's travel setting, used by the travel members list and the workspace
 * members table.
 */

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {TravelMemberOption} from '@libs/TravelMemberOptionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useRef} from 'react';
import {View} from 'react-native';

import type PopoverWithMeasuredContentProps from './PopoverWithMeasuredContent/types';

import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type TravelMemberPickerModalProps = {
    onClose: () => void;

    options: TravelMemberOption[];

    onSelected: (value: boolean) => void;

    /** Height of the picker. Defaults to the height its options need. */
    popoverHeight?: number;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

/**
 * The picker's height is needed before it opens so the cell can decide whether it fits below the row.
 */
function useTravelMemberPickerPopoverHeight(optionCount: number) {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();

    const listHeight = styles.getSelectionListPopoverHeight({
        itemCount: optionCount,
        itemHeight: variables.optionRowHeight,
        windowHeight,
        isInLandscapeMode,
        hasButton: false,
    }).height;
    return listHeight + styles.pt4.paddingTop + styles.pb4.paddingBottom;
}

function TravelMemberPickerModal({
    isVisible,
    onClose,
    anchorPosition,
    options,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    shouldSwitchPositionIfOverflow = true,
    popoverHeight,
}: TravelMemberPickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const anchorRef = useRef<View>(null);

    const contentHeight = useTravelMemberPickerPopoverHeight(options.length);
    const resolvedHeight = popoverHeight ?? contentHeight;

    const selectOption = (option: TravelMemberOption) => {
        onSelected(option.value);
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={{
                width: CONST.POPOVER_DROPDOWN_WIDTH,
                height: resolvedHeight,
            }}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={StyleUtils.getWidthStyle(CONST.POPOVER_DROPDOWN_WIDTH)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(resolvedHeight), styles.flexColumn, styles.pv4]}>
                <SelectionList
                    data={options}
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectOption}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={options.find((option) => option.isSelected)?.keyForList}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default TravelMemberPickerModal;
export {useTravelMemberPickerPopoverHeight};
