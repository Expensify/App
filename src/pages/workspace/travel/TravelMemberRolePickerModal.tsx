/**
 * Popover picker for inline editing a member's travel role from the travel members list.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useRef} from 'react';
import {View} from 'react-native';

type TravelMemberRole = ValueOf<typeof CONST.TRAVEL.MEMBER_ROLE>;

type TravelMemberRoleListItem = ListItem<TravelMemberRole> & {
    value: TravelMemberRole;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type TravelMemberRolePickerModalProps = {
    onClose: () => void;

    selectedRole: TravelMemberRole;

    onSelected: (role: TravelMemberRole) => void;

    /** Height of the picker. Defaults to the height its roles need. */
    popoverHeight?: number;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function getTravelMemberRoleName(translate: LocalizedTranslate, role: TravelMemberRole): string {
    return role === CONST.TRAVEL.MEMBER_ROLE.ADMIN ? translate('workspace.moreFeatures.travel.members.travelAdmin') : translate('workspace.moreFeatures.travel.members.traveler');
}

function getTravelMemberRoleItems(translate: LocalizedTranslate, selectedRole: TravelMemberRole): TravelMemberRoleListItem[] {
    return [
        {
            value: CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
            text: getTravelMemberRoleName(translate, CONST.TRAVEL.MEMBER_ROLE.TRAVELER),
            alternateText: translate('workspace.moreFeatures.travel.members.travelerDescription'),
            isSelected: selectedRole === CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
            keyForList: CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
        },
        {
            value: CONST.TRAVEL.MEMBER_ROLE.ADMIN,
            text: getTravelMemberRoleName(translate, CONST.TRAVEL.MEMBER_ROLE.ADMIN),
            alternateText: translate('workspace.moreFeatures.travel.members.travelAdminDescription'),
            isSelected: selectedRole === CONST.TRAVEL.MEMBER_ROLE.ADMIN,
            keyForList: CONST.TRAVEL.MEMBER_ROLE.ADMIN,
        },
    ];
}

/**
 * The picker's height is needed before it opens so the cell can decide whether it fits below the row.
 */
function useTravelMemberRolePickerPopover(selectedRole: TravelMemberRole) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();

    const roleItems = getTravelMemberRoleItems(translate, selectedRole);
    const listHeight = styles.getSelectionListPopoverHeight({
        itemCount: roleItems.length,
        itemHeight: variables.optionRowHeight,
        windowHeight,
        isInLandscapeMode,
        hasButton: false,
    }).height;
    const popoverHeight = listHeight + styles.pt4.paddingTop + styles.pb4.paddingBottom;

    return {roleItems, popoverHeight};
}

function TravelMemberRolePickerModal({
    isVisible,
    onClose,
    anchorPosition,
    selectedRole,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
    shouldSwitchPositionIfOverflow = true,
    popoverHeight,
}: TravelMemberRolePickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const anchorRef = useRef<View>(null);

    const {roleItems, popoverHeight: contentHeight} = useTravelMemberRolePickerPopover(selectedRole);
    const resolvedHeight = popoverHeight ?? contentHeight;

    const selectRole = (item: TravelMemberRoleListItem) => {
        onSelected(item.value);
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
                    data={roleItems}
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectRole}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={roleItems.find((item) => item.isSelected)?.keyForList}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default TravelMemberRolePickerModal;
export {getTravelMemberRoleName, useTravelMemberRolePickerPopover};
export type {TravelMemberRole};
