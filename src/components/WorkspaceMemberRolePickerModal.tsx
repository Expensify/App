/**
 * Popover role picker for inline editing a workspace member's role from the members table.
 */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useRef} from 'react';
import {View} from 'react-native';

import type PopoverWithMeasuredContentProps from './PopoverWithMeasuredContent/types';
import type {ListItemType} from './WorkspaceMemberRoleList';

import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';
import {getAssignableWorkspaceMemberRoleItems} from './WorkspaceMemberRoleList';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type WorkspaceMemberRolePickerModalProps = {
    onClose: () => void;

    /** The policy whose assignable roles should be shown */
    policy: OnyxEntry<Policy>;

    selectedRole?: string;

    /** When provided, restricts the selectable roles to this set (e.g. an Authorized Payer may only be an Admin or Payments Admin) */
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>;

    onSelected?: (role: ValueOf<typeof CONST.POLICY.ROLE>) => void;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

/**
 * Authorized Payer rows only show two roles, so inversion has to use that shorter height instead of the full dropdown max.
 */
function useWorkspaceMemberRolePickerPopover({policy, selectedRole, allowedRoles}: Pick<WorkspaceMemberRolePickerModalProps, 'policy' | 'selectedRole' | 'allowedRoles'>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const availableRoleItems = getAssignableWorkspaceMemberRoleItems(translate, selectedRole, policy, currentUserLogin, allowedRoles);
    // Padding sits outside the list, matching Spend tag / GroupBy, so it is not clipped into a scrollbar.
    const listHeight = styles.getSelectionListPopoverHeight({
        itemCount: availableRoleItems.length || 1,
        itemHeight: variables.optionRowHeight,
        windowHeight,
        isInLandscapeMode,
        hasButton: false,
    }).height;
    const popoverHeight = listHeight + styles.pt4.paddingTop + styles.pb4.paddingBottom;

    return {availableRoleItems, popoverHeight};
}

function WorkspaceMemberRolePickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policy,
    selectedRole,
    allowedRoles,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
}: WorkspaceMemberRolePickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const anchorRef = useRef<View>(null);

    const {availableRoleItems, popoverHeight} = useWorkspaceMemberRolePickerPopover({policy, selectedRole, allowedRoles});

    const handleRoleSelected = (item: ListItemType) => {
        onSelected?.(item.value);
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
                height: popoverHeight,
            }}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={StyleUtils.getWidthStyle(CONST.POPOVER_DROPDOWN_WIDTH)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverHeight), styles.flexColumn, styles.pv4]}>
                <SelectionList
                    data={availableRoleItems}
                    ListItem={SingleSelectListItem}
                    onSelectRow={handleRoleSelected}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={availableRoleItems.find((item) => item.isSelected)?.keyForList}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default WorkspaceMemberRolePickerModal;
export {useWorkspaceMemberRolePickerPopover};
