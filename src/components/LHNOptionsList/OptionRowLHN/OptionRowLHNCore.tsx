import React, {useRef} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import Avatar from './OptionRow/Avatar';
import DescriptiveText from './OptionRow/DescriptiveText';
import DraftIndicator from './OptionRow/DraftIndicator';
import ErrorBadge from './OptionRow/ErrorBadge';
import InfoBadge from './OptionRow/InfoBadge';
import OfflineWrapper from './OptionRow/OfflineWrapper';
import OnboardingBadge from './OptionRow/OnboardingBadge';
import PinIndicator from './OptionRow/PinIndicator';
import ProductTrainingTooltip from './OptionRow/ProductTrainingTooltip';
import Status from './OptionRow/Status';
import Subtitle from './OptionRow/Subtitle';
import Title from './OptionRow/Title';
import OptionRowPressable from './OptionRowPressable';

function OptionRowLHN({isOptionFocused = false, onSelectRow = () => {}, optionItem, viewMode = 'default', style, onLayout = () => {}, hasDraftComment, testID}: OptionRowLHNProps) {
    const {isProduction} = useEnvironment();
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();

    const {isScreenFocused} = useLHNTooltipContext();

    const {translate} = useLocalize();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];

    const brickRoadIndicator = optionItem.brickRoadIndicator;
    const actionBadgeText = !isProduction && optionItem.actionBadge ? translate(`common.actionBadge.${optionItem.actionBadge}`) : '';
    let accessibilityLabelForBadge = '';
    if (brickRoadIndicator) {
        accessibilityLabelForBadge = [translate('common.yourReviewIsRequired'), actionBadgeText].filter(Boolean).join(', ');
    } else if (optionItem.isPinned) {
        accessibilityLabelForBadge = translate('common.pinned');
    }
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = shouldUseBoldText(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0, style];

    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;

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

    return (
        <OfflineWrapper
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
        >
            <ProductTrainingTooltip optionItem={optionItem}>
                <OptionRowPressable
                    optionItem={optionItem}
                    isOptionFocused={isOptionFocused}
                    isScreenFocused={isScreenFocused}
                    popoverAnchor={popoverAnchor}
                    onSelectRow={onSelectRow}
                    onLayout={onLayout}
                    accessibilityLabel={accessibilityLabelWithContextMenuHint}
                    accessibilityHint={accessibilityHint}
                    // reportID may be a number contrary to the type definition
                    testID={typeof optionItem.reportID === 'number' ? String(optionItem.reportID) : optionItem.reportID}
                >
                    {(hovered) => {
                        let secondaryAvatarBgColor = theme.sidebar;
                        if (isOptionFocused) {
                            secondaryAvatarBgColor = focusedBackgroundColor;
                        } else if (hovered) {
                            secondaryAvatarBgColor = hoveredBackgroundColor;
                        }
                        return (
                            <>
                                <View style={sidebarInnerRowStyle}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <Avatar
                                            optionItem={optionItem}
                                            isInFocusMode={isInFocusMode}
                                            subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                            secondaryAvatarBackgroundColor={secondaryAvatarBgColor}
                                            singleAvatarContainerStyle={singleAvatarContainerStyle}
                                        />
                                        <View style={contentContainerStyles}>
                                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                                <Title
                                                    optionItem={optionItem}
                                                    displayNameStyle={displayNameStyle}
                                                    testID={testID}
                                                />
                                                <OnboardingBadge optionItem={optionItem} />
                                                <Status optionItem={optionItem} />
                                            </View>
                                            <Subtitle
                                                optionItem={optionItem}
                                                viewMode={viewMode}
                                                isOptionFocused={isOptionFocused}
                                                style={style}
                                            />
                                        </View>
                                        <DescriptiveText optionItem={optionItem} />
                                        <ErrorBadge
                                            brickRoadIndicator={brickRoadIndicator}
                                            actionBadge={optionItem.actionBadge}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                    <InfoBadge
                                        brickRoadIndicator={brickRoadIndicator}
                                        actionBadge={optionItem.actionBadge}
                                    />
                                    <DraftIndicator
                                        hasDraftComment={hasDraftComment}
                                        isAllowedToComment={optionItem.isAllowedToComment}
                                    />
                                    <PinIndicator
                                        isPinned={optionItem.isPinned}
                                        brickRoadIndicator={brickRoadIndicator}
                                    />
                                </View>
                            </>
                        );
                    }}
                </OptionRowPressable>
            </ProductTrainingTooltip>
        </OfflineWrapper>
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
