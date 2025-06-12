import React, {useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import Text from '@components/Text';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type PopoverComponentProps = {
    closeOverlay: () => void;
};

type DropdownButtonProps = {
    /** The label to display on the select */
    label: string;

    /** The selected value(s) if any */
    value: string | string[] | null;

    /** The viewport's offset */
    viewportOffsetTop: number;

    /** The component to render in the popover */
    PopoverComponent: React.FC<PopoverComponentProps>;
};

const PADDING_MODAL = 8;

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function DropdownButton({label, value, viewportOffsetTop, PopoverComponent}: DropdownButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
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
                    vertical: y + height + PADDING_MODAL,
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
        if (!value?.length) {
            return label;
        }

        const selectedItems = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${selectedItems}`;
    }, [label, value]);

    const containerStyles = useMemo(() => {
        if (isSmallScreenWidth) {
            return styles.w100;
        }
        return {width: CONST.POPOVER_DROPDOWN_WIDTH};
    }, [isSmallScreenWidth, styles]);

    return (
        <>
            {/* Dropdown Trigger */}
            <Button
                small
                ref={triggerRef}
                innerStyles={[isOverlayVisible && styles.buttonHoveredBG, {maxWidth: 256}]}
                onPress={toggleOverlay}
            >
                <CaretWrapper style={[styles.flex1, styles.mw100]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroBold, styles.flexShrink1]}
                    >
                        {buttonText}
                    </Text>
                </CaretWrapper>
            </Button>

            {/* Dropdown overlay */}
            <PopoverWithMeasuredContent
                anchorRef={triggerRef}
                avoidKeyboard
                isVisible={isOverlayVisible}
                onClose={toggleOverlay}
                anchorPosition={popoverTriggerPosition}
                anchorAlignment={ANCHOR_ORIGIN}
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                shouldEnableNewFocusManagement
                shouldMeasureAnchorPositionFromTop={false}
                outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...containerStyles}}
                // This must be false because we dont want the modal to close if we open the RHP for selections
                // such as date years
                shouldCloseWhenBrowserNavigationChanged={false}
                innerContainerStyle={containerStyles}
                popoverDimensions={{
                    width: CONST.POPOVER_DROPDOWN_WIDTH,
                    height: CONST.POPOVER_DROPDOWN_MIN_HEIGHT,
                }}
            >
                <PopoverComponent closeOverlay={toggleOverlay} />
            </PopoverWithMeasuredContent>
        </>
    );
}

DropdownButton.displayName = 'DropdownButton';
export type {PopoverComponentProps};
export default withViewportOffsetTop(DropdownButton);
