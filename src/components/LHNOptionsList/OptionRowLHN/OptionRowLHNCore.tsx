import React, {useRef} from 'react';
import {View} from 'react-native';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import Container from './OptionRow/Container';
import DescriptiveText from './OptionRow/DescriptiveText';
import DraftIndicator from './OptionRow/DraftIndicator';
import ErrorBadge from './OptionRow/ErrorBadge';
import InfoBadge from './OptionRow/InfoBadge';
import OnboardingBadge from './OptionRow/OnboardingBadge';
import PinIndicator from './OptionRow/PinIndicator';
import Status from './OptionRow/Status';
import Subtitle from './OptionRow/Subtitle';
import Title from './OptionRow/Title';
import OptionRowAvatar from './OptionRowAvatar';
import OptionRowPressable from './OptionRowPressable';
import OptionRowTooltipLayer from './OptionRowTooltipLayer';

function OptionRowLHN({isOptionFocused = false, onSelectRow = () => {}, optionItem, viewMode = 'default', style, onLayout = () => {}, hasDraftComment, testID}: OptionRowLHNProps) {
    const {isProduction} = useEnvironment();
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);

    const {isScreenFocused} = useLHNTooltipContext();

    const {translate} = useLocalize();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;

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

    const renderPressableRow = () => (
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
                        <Container viewMode={viewMode}>
                            <OptionRowAvatar
                                optionItem={optionItem}
                                isInFocusMode={isInFocusMode}
                                subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                secondaryAvatarBackgroundColor={secondaryAvatarBgColor}
                                singleAvatarContainerStyle={singleAvatarContainerStyle}
                            />
                            <Container.Content viewMode={viewMode}>
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
                            </Container.Content>
                            <DescriptiveText optionItem={optionItem} />
                            <ErrorBadge
                                brickRoadIndicator={brickRoadIndicator}
                                actionBadge={optionItem.actionBadge}
                            />
                        </Container>
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
    );

    return (
        <OptionRowTooltipLayer
            optionItem={optionItem}
            renderChildren={renderPressableRow}
        />
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
