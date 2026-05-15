import type {ReactNode} from 'react';
import React, {useRef, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, View} from 'react-native';
import Hoverable from '@components/Hoverable';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import useLHNRowProductTrainingTooltip from '@components/LHNOptionsList/OptionRowLHN/useLHNRowProductTrainingTooltip';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DomUtils from '@libs/DomUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {OptionData} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type PressableProps = {
    /** Option data for the row. Source of accessibility text and the report ID used by press/context-menu actions. */
    optionItem: OptionData;

    /** Whether the row is the currently focused/active option. Drives the focused background and accessibility metadata. */
    isOptionFocused: boolean;

    /** Press handler invoked with the option data and the popover anchor ref. */
    onSelectRow: (optionItem: OptionData, popoverAnchor: React.RefObject<View | null>) => void;

    /** Layout handler forwarded to the underlying pressable. */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Fires when the mouse enters the row. Hover state lives in the parent so leaves like Avatar can react. */
    onHoverIn?: () => void;

    /** Fires when the mouse leaves the row. */
    onHoverOut?: () => void;

    /** Row content. */
    children: ReactNode;
};

function Pressable({optionItem, isOptionFocused, onSelectRow, onLayout, onHoverIn, onHoverOut, children}: PressableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {isScreenFocused} = useLHNTooltipContext();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {hideProductTrainingTooltip} = useLHNRowProductTrainingTooltip();

    const popoverAnchor = useRef<View>(null);
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);

    const reportID = optionItem.reportID;
    const brickRoadIndicator = optionItem.brickRoadIndicator;
    const actionBadgeText = !isProduction && optionItem.actionBadge ? translate(`common.actionBadge.${optionItem.actionBadge}`) : '';

    let accessibilityLabelForBadge = '';
    if (brickRoadIndicator) {
        accessibilityLabelForBadge = [translate('common.yourReviewIsRequired'), actionBadgeText].filter(Boolean).join(', ');
    } else if (optionItem.isPinned) {
        accessibilityLabelForBadge = translate('common.pinned');
    }

    const accessibilityLabel = [
        `${translate('accessibilityHints.navigatesToChat')} ${optionItem.text}`,
        optionItem.isUnread ? translate('common.unread') : '',
        optionItem.alternateText ?? '',
        accessibilityLabelForBadge,
    ]
        .filter(Boolean)
        .join('. ');
    const contextMenuHint = getContextMenuAccessibilityHint({translate});
    const {accessibilityLabel: accessibilityLabelWithContextMenuHint, accessibilityHint} = getContextMenuAccessibilityProps({
        accessibilityLabel,
        nativeAccessibilityHint: accessibilityLabel,
        contextMenuHint,
    });

    // reportID may be a number contrary to the type definition
    const testID = typeof reportID === 'number' ? String(reportID) : reportID;

    const onPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        hideProductTrainingTooltip();
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
            name: 'OptionRowLHN',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });

        event?.preventDefault();
        // Enable Composer to focus on clicking the same chat after opening the context menu.
        ReportActionComposeFocusManager.focus();
        onSelectRow(optionItem, popoverAnchor);
    };

    const showPopover = (event: MouseEvent | GestureResponderEvent) => {
        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsContextMenuActive(true);
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT,
            event,
            selection: '',
            contextMenuAnchor: popoverAnchor.current,
            report: {
                reportID,
                originalReportID: reportID,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: () => setIsContextMenuActive(false),
            },
            withoutOverlay: false,
        });
    };

    return (
        <Hoverable
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
        >
            {(hovered) => (
                <PressableWithSecondaryInteraction
                    ref={popoverAnchor}
                    onPress={onPress}
                    onMouseDown={(event) => {
                        // Allow composer blur on right click
                        if (!event) {
                            return;
                        }
                        // Prevent composer blur on left click
                        event.preventDefault();
                    }}
                    testID={testID}
                    onSecondaryInteraction={(event) => {
                        showPopover(event);
                        // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                        if (DomUtils.getActiveElement()) {
                            (DomUtils.getActiveElement() as HTMLElement | null)?.blur();
                        }
                    }}
                    withoutFocusOnSecondaryInteraction
                    activeOpacity={variables.pressDimValue}
                    opacityAnimationDuration={0}
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                        styles.sidebarLink,
                        styles.sidebarLinkInnerLHN,
                        StyleUtils.getBackgroundColorStyle(theme.sidebar),
                        isOptionFocused ? styles.sidebarLinkActive : null,
                        (hovered || isContextMenuActive) && !isOptionFocused ? styles.sidebarLinkHover : null,
                    ]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={accessibilityLabelWithContextMenuHint}
                    accessibilityHint={accessibilityHint}
                    onLayout={onLayout}
                    needsOffscreenAlphaCompositing={(optionItem?.icons?.length ?? 0) >= 2}
                    sentryLabel={CONST.SENTRY_LABEL.LHN.OPTION_ROW}
                >
                    {children}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
}

Pressable.displayName = 'OptionRow.Pressable';

export default Pressable;
