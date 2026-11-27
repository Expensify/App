/**
 * Inline editable cell for a workspace member's travel access in the workspace members table.
 */
import useLocalize from '@hooks/useLocalize';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';
import {getTravelMemberAccessName, getTravelMemberAccessOptions} from '@libs/TravelMemberOptionUtils';

import React from 'react';

import {EditableCell, usePopoverEditState} from './EditableCell';
import Text from './Text';
import TravelMemberPickerModal, {useTravelMemberPickerPopoverHeight} from './TravelMemberPickerModal';

type TravelMemberPickerCellProps = {
    /** Whether the member can book travel */
    value: boolean;

    /** Whether the current user can change the member's travel setting */
    canEdit: boolean;

    onSave: (value: boolean) => void;
};

function TravelMemberPickerCell({value, canEdit, onSave}: TravelMemberPickerCellProps) {
    const {translate} = useLocalize();
    const label = getTravelMemberAccessName(translate, value);
    const options = getTravelMemberAccessOptions(translate, value);
    const preferredPopoverHeight = useTravelMemberPickerPopoverHeight(options.length);

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, popoverHeight, anchorAlignment, shouldOpenAbove, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value,
        onSave,
        popoverHeight: preferredPopoverHeight,
    });

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <TravelMemberPickerModal
                    options={options}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    anchorAlignment={anchorAlignment}
                    popoverHeight={popoverHeight}
                    shouldMeasureAnchorPositionFromTop={!shouldOpenAbove}
                    shouldSwitchPositionIfOverflow={false}
                    onSelected={handleSave}
                />
            }
        >
            <Text
                numberOfLines={1}
                selectable
                dataSet={COPYABLE_TEXT_DATA_SET}
            >
                {label}
            </Text>
        </EditableCell>
    );
}

export default TravelMemberPickerCell;
