import React, {useMemo} from 'react';
import {View} from 'react-native';
import {AttachmentContext} from '@components/AttachmentContext';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MultipleAvatars from '@components/MultipleAvatars';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportActionItemDate from '@pages/home/report/ReportActionItemDate';
import ReportActionItemFragment from '@pages/home/report/ReportActionItemFragment';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ChatListItemProps, ListItem, ReportActionListItemType} from './types';

function ChatListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const from = reportActionItem.from;
    const icons = [
        {
            type: CONST.ICON_TYPE_AVATAR,
            source: from.avatar,
            name: reportActionItem.formattedFrom,
            id: from.accountID,
        },
    ];
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const attachmentContextValue = {type: CONST.ATTACHMENT_TYPE.SEARCH};

    const contextValue = {
        anchor: null,
        report: undefined,
        reportNameValuePairs: undefined,
        action: undefined,
        transactionThreadReport: undefined,
        checkIfContextMenuActive: () => {},
        isDisabled: true,
    };

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const mentionReportContextValue = useMemo(() => ({currentReportID: item?.reportID ?? '-1'}), [item.reportID]);

    return (
        <BaseListItem
            item={item}
            pressableStyle={[
                [styles.selectionListPressableItemWrapper, styles.textAlignLeft, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive, item.cursorStyle],
            ]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone]}
            containerStyle={styles.mb3}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onLongPressRow={onLongPressRow}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            {(hovered) => (
                <MentionReportContext.Provider value={mentionReportContextValue}>
                    <ShowContextMenuContext.Provider value={contextValue}>
                        <AttachmentContext.Provider value={attachmentContextValue}>
                            <View style={styles.webViewStyles.tagStyles.ol}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb2]}>
                                    <Text style={styles.chatItemMessageHeaderPolicy}>In </Text>
                                    <TextLink
                                        fontSize={variables.fontSizeSmall}
                                        onPress={() => onSelectRow(item)}
                                    >
                                        {/* {ReportUtils.getReportName( */}
                                        Report test
                                    </TextLink>
                                </View>
                                <View style={styles.flexRow}>
                                    <MultipleAvatars
                                        icons={icons}
                                        shouldShowTooltip={showTooltip}
                                        secondAvatarStyle={[
                                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                            isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                            hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                        ]}
                                    />
                                    <View style={[styles.chatItemRight]}>
                                        <View style={[styles.chatItemMessageHeader]}>
                                            <View style={[styles.flexShrink1, styles.mr1]}>
                                                <TextWithTooltip
                                                    shouldShowTooltip={showTooltip}
                                                    text={reportActionItem.formattedFrom}
                                                    style={[
                                                        styles.chatItemMessageHeaderSender,
                                                        isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                                        styles.sidebarLinkTextBold,
                                                        styles.pre,
                                                    ]}
                                                />
                                            </View>
                                            <ReportActionItemDate created={reportActionItem.created ?? ''} />
                                        </View>
                                        <View style={styles.chatItemMessage}>
                                            {reportActionItem.message.map((fragment, index) => (
                                                <ReportActionItemFragment
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={`actionFragment-${reportActionItem.reportActionID}-${index}`}
                                                    fragment={fragment}
                                                    actionName={reportActionItem.actionName}
                                                    source=""
                                                    accountID={from.accountID}
                                                    isFragmentContainingDisplayName={index === 0}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </AttachmentContext.Provider>
                    </ShowContextMenuContext.Provider>
                </MentionReportContext.Provider>
            )}
        </BaseListItem>
    );
}

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
