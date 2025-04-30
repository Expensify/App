import React, {useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DropdownButtonProps<T = unknown> = {
    label: string;
    value: string | string[] | null;
    items: T[];
    onChange?: (item: T | T[] | null) => void;
    PopoverComponent: React.FC<{
        items: T;
        onChange?: (item: T | T[] | null) => void;
    }>;
};

const PADDING_MODAL_DATE_PICKER = 8;

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function DropdownButton({label, value, PopoverComponent, items, onChange}: DropdownButtonProps) {
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
        setIsOverlayVisible((prev) => {
            triggerRef.current?.measureInWindow((x, y, width, height) => {
                setPopoverTriggerPosition({
                    horizontal: x,
                    vertical: y + height + PADDING_MODAL_DATE_PICKER,
                });
            });

            return !prev;
        });
    };

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
