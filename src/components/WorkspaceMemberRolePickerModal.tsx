/**
 * Popover role picker for inline editing a workspace member's role from the members table.
 */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

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

const popoverDimensions = {
    width: CONST.POPOVER_DROPDOWN_WIDTH,
    height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
};

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type WorkspaceMemberRolePickerModalProps = {
    /** Callback to close the modal */
    onClose: () => void;

    /** The policy whose assignable roles should be shown */
    policy: OnyxEntry<Policy>;

    /** Currently selected role */
    selectedRole?: string;

    /** When provided, restricts the selectable roles to this set (e.g. an Authorized Payer may only be an Admin or Payments Admin) */
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>;

    /** Called when the user confirms a role selection */
    onSelected?: (role: ValueOf<typeof CONST.POLICY.ROLE>) => void;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

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
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const anchorRef = useRef<View>(null);

    const availableRoleItems = getAssignableWorkspaceMemberRoleItems(translate, selectedRole, policy, currentUserLogin, allowedRoles);

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
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={StyleUtils.getWidthStyle(popoverDimensions.width)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverDimensions.height), styles.flexColumn, styles.pt4]}>
                <SelectionList
                    data={availableRoleItems}
                    ListItem={SingleSelectListItem}
                    onSelectRow={handleRoleSelected}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={availableRoleItems.find((item) => item.isSelected)?.keyForList}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default WorkspaceMemberRolePickerModal;
