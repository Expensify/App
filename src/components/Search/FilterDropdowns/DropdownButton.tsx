import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import Text from '@components/Text';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidePanelDisplayStatus} from '@hooks/useSidePanel';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

const PADDING_MODAL = 8;

function DropdownButton({label, value, viewportOffsetTop, PopoverComponent}: DropdownButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {shouldHideSidePanel} = useSidePanelDisplayStatus();

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const triggerRef = useRef<View | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const {calculatePopoverPosition} = usePopoverPosition();

    const [popoverTriggerPosition, setPopoverTriggerPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => modal?.willAlertModalBecomeVisible, canBeMissing: true});

    /**
     * Toggle the overlay between open & closed
     */
    const toggleOverlay = useCallback(() => {
        setIsOverlayVisible((previousValue) => {
            if (!previousValue && willAlertModalBecomeVisible) {
                return false;
            }

            return !previousValue;
        });
    }, [willAlertModalBecomeVisible]);

    const anchorAlignment = useMemo(
        () => ({
            horizontal: shouldHideSidePanel ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }),
        [shouldHideSidePanel],
    );

    useEffect(() => {
        if (!triggerRef.current) {
            return;
        }

        calculatePopoverPosition(triggerRef, anchorAlignment).then((pos) => setPopoverTriggerPosition({...pos, vertical: pos.vertical + PADDING_MODAL}));
    }, [isOverlayVisible, calculatePopoverPosition, anchorAlignment]);

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

    const popoverContent = useMemo(() => {
        return PopoverComponent({closeOverlay: toggleOverlay});
        // PopoverComponent is stable so we don't need it here as a dep.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [toggleOverlay]);

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
                anchorAlignment={anchorAlignment}
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
                shouldSkipRemeasurement
            >
                {popoverContent}
            </PopoverWithMeasuredContent>
        </>
    );
}

DropdownButton.displayName = 'DropdownButton';
export type {PopoverComponentProps};
export default withViewportOffsetTop(DropdownButton);
