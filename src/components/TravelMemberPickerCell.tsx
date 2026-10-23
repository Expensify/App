import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import Text from '@components/Text';
import TravelMemberPickerModal, {useTravelMemberPickerPopoverHeight} from '@components/TravelMemberPickerModal';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';
import type {TravelMemberAccessValue, TravelMemberOption} from '@libs/TravelMemberOptionUtils';

import React from 'react';

type TravelMemberPickerCellProps = {
    value: TravelMemberAccessValue;

    /** The label shown for the current value */
    label: string;

    options: TravelMemberOption[];

    /** Whether the current user can change the member's travel setting */
    canEdit: boolean;

    /**
     * Whether the shown value is stored on the member. A member without a stored value shows as off, so picking off still
     * saves it.
     */
    isValueStored?: boolean;

    onSave: (value: TravelMemberAccessValue) => void;
};

function TravelMemberPickerCell({value, label, options, canEdit, isValueStored = true, onSave}: TravelMemberPickerCellProps) {
    const preferredPopoverHeight = useTravelMemberPickerPopoverHeight(options.length);

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, popoverHeight, anchorAlignment, shouldOpenAbove, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value,
        onSave,
        isEqual: isValueStored ? undefined : () => false,
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
