import React, {useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DropdownValue<T> = T | T[] | null;

type PopoverComponentProps<T> = {
    items: T[];
    onChange: (item: DropdownValue<T>) => void;
};

type DropdownButtonProps<T> = {
    /** The label to display on the select */
    label: string;

    /** The selected value(s), if any. If array, will be joined with a comma */
    value: string | string[] | null;

    /** The items to pass to the popover component to be rendered */
    items: T[];

    /** Callback to be called when an item is selected */
    onChange: (item: DropdownValue<T>) => void;

    /** The component to render in the popover */
    PopoverComponent: React.FC<PopoverComponentProps<T>>;
};

const PADDING_MODAL_DATE_PICKER = 8;

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function DropdownButton<T>({label, value, PopoverComponent, items, onChange}: DropdownButtonProps<T>) {
    const styles = useThemeStyles();
    const triggerRef = useRef<View | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [popoverTriggerPosition, setPopoverTriggerPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    /**
     * Toggle the overlay between open & closed, and re-calculate the
     * position of the trigger
     */
    const toggleOverlay = () => {
        setIsOverlayVisible((previousValue) => {
            triggerRef.current?.measureInWindow((x, y, _, height) => {
                setPopoverTriggerPosition({
                    horizontal: x,
                    vertical: y + height + PADDING_MODAL_DATE_PICKER,
                });
            });

            return !previousValue;
        });
    };

    /**
     * When no items are selected, render the label, otherwise, render the
     * list of selected items as well
     */
    const buttonText = useMemo(() => {
        if (!value) {
            return label;
        }
        const valueString = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${valueString}`;
    }, [label, value]);

    return (
        <>
            {/* Dropdown Trigger */}
            <Button
                small
                ref={triggerRef}
                innerStyles={[isOverlayVisible && styles.buttonHoveredBG]}
                onPress={toggleOverlay}
            >
                <CaretWrapper style={styles.flex1}>
                    <Text style={styles.textMicroBold}>{buttonText}</Text>
                </CaretWrapper>
            </Button>

            {/* Dropdown overlay */}
            <PopoverWithMeasuredContent
                shouldUseNewModal
                anchorRef={triggerRef}
                isVisible={isOverlayVisible}
                onClose={toggleOverlay}
                anchorPosition={popoverTriggerPosition}
                anchorAlignment={ANCHOR_ORIGIN}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shoudSwitchPositionIfOverflow
                shouldEnableNewFocusManagement
                shouldMeasureAnchorPositionFromTop={false}
                popoverDimensions={{
                    width: CONST.POPOVER_DROPDOWN_WIDTH,
                    height: CONST.POPOVER_DROPDOWN_MIN_HEIGHT,
                }}
            >
                <PopoverComponent
                    items={items}
                    onChange={onChange}
                />
            </PopoverWithMeasuredContent>
        </>
    );
}

DropdownButton.displayName = 'DropdownButton';
export default DropdownButton;
