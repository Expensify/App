import useDragoverDismiss from '@hooks/useDragoverDismiss';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {StyleProp, ViewStyle} from 'react-native';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import FABButtons from './FABPopoverContent/FABButtons';
import FABPopoverMenu from './FABPopoverContent/FABPopoverMenu';
import CreateReportMenuItem from './FABPopoverContent/menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './FABPopoverContent/menuItems/ExpenseMenuItem';
import InvoiceMenuItem from './FABPopoverContent/menuItems/InvoiceMenuItem';
import NewChatMenuItem from './FABPopoverContent/menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem from './FABPopoverContent/menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem from './FABPopoverContent/menuItems/QuickActionMenuItem';
import TrackDistanceMenuItem from './FABPopoverContent/menuItems/TrackDistanceMenuItem';
import TravelMenuItem from './FABPopoverContent/menuItems/TravelMenuItem';

type FloatingActionButtonAndPopoverProps = {
    /** Replaces the default vertical padding, for callers that position the button themselves */
    containerStyle?: StyleProp<ViewStyle>;

    /** Set to false where only the create button belongs, such as the flat navigation bar header */
    shouldShowReceiptButton?: boolean;

    /** Renders the standard small success button instead of the floating action button */
    shouldUseSmallSuccessButton?: boolean;

    /** Replaces the default bottom-left menu placement, for callers that anchor the button elsewhere */
    anchorPosition?: AnchorPosition;

    /** How the menu lines up with `anchorPosition` */
    anchorAlignment?: AnchorAlignment;
};

/**
 * Responsible for rendering the {@link FABPopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover({
    containerStyle,
    shouldShowReceiptButton = true,
    shouldUseSmallSuccessButton = false,
    anchorPosition,
    anchorAlignment,
}: FloatingActionButtonAndPopoverProps = {}) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    const [reportID] = useState(() => generateReportID());

    const showCreateMenu = () => {
        if (!isFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsCreateMenuActive(true);
    };

    const hideCreateMenu = () => {
        setIsCreateMenuActive(false);
    };

    // Close the menu when the screen loses focus (e.g. navigating away)
    useFocusEffect(() => {
        return () => hideCreateMenu();
    });

    // Close menu on dragover — prevents popover from staying open during file drag
    useDragoverDismiss(isCreateMenuActive, hideCreateMenu);

    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
            showCreateMenu();
        }
    };

    return (
        <View style={[styles.justifyContentCenter, styles.flexGrow1, styles.gap3, shouldUseNarrowLayout ? styles.w100 : styles.pv4, containerStyle]}>
            <FABPopoverMenu
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
                onClose={hideCreateMenu}
                onItemSelected={hideCreateMenu}
                anchorRef={fabRef}
                anchorPosition={anchorPosition}
                anchorAlignment={anchorAlignment}
                animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
                animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
            >
                <ExpenseMenuItem reportID={reportID} />
                <CreateReportMenuItem />
                <TrackDistanceMenuItem reportID={reportID} />
                <NewChatMenuItem />
                <InvoiceMenuItem reportID={reportID} />
                <TravelMenuItem />
                <NewWorkspaceMenuItem />
                <QuickActionMenuItem reportID={reportID} />
            </FABPopoverMenu>
            <FABButtons
                isActive={isCreateMenuActive}
                fabRef={fabRef}
                onPress={toggleCreateMenu}
                shouldShowReceiptButton={shouldShowReceiptButton}
                shouldUseSmallSuccessButton={shouldUseSmallSuccessButton}
            />
        </View>
    );
}

export default FloatingActionButtonAndPopover;
