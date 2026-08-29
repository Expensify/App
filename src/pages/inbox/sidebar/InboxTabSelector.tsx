import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';

import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';

import type {AnchorPosition} from '@styles/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {reportNameValuePairsArchivedSelector} from '@selectors/ReportNameValuePairs';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

const anchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function InboxTabSelector() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {activeTab, inboxTabCounts} = useSidebarOrderedReportsState();
    const {setActiveTab, getReportIDsForTab} = useSidebarOrderedReportsActions();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {selector: reportNameValuePairsArchivedSelector});
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const {showConfirmModal} = useConfirmModal();

    // Anchor the popover to the tab it was opened from (not the whole tab row) so it opens at that tab's left edge.
    const allTabRef = useRef<View | HTMLDivElement>(null);
    const unreadTabRef = useRef<View | HTMLDivElement>(null);
    const todoTabRef = useRef<View | HTMLDivElement>(null);
    const tabRefs = {
        [CONST.INBOX_TAB.ALL]: allTabRef,
        [CONST.INBOX_TAB.UNREAD]: unreadTabRef,
        [CONST.INBOX_TAB.TODO]: todoTabRef,
    };
    const {calculatePopoverPosition} = usePopoverPosition();
    const [popoverPosition, setPopoverPosition] = useState<AnchorPosition>();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuTab, setMenuTab] = useState<ValueOf<typeof CONST.INBOX_TAB>>(CONST.INBOX_TAB.ALL);

    const getBadgeText = (count: number) => (count > 0 ? count.toString() : undefined);

    const openMarkAllAsReadMenu = (key: string) => {
        if (key !== CONST.INBOX_TAB.ALL && key !== CONST.INBOX_TAB.UNREAD && key !== CONST.INBOX_TAB.TODO) {
            return;
        }
        calculatePopoverPosition(tabRefs[key], anchorAlignment).then((position) => {
            setMenuTab(key);
            setPopoverPosition(position);
            setIsMenuVisible(true);
        });
    };

    const confirmMarkAllAsRead = () => {
        const isTodoTab = menuTab === CONST.INBOX_TAB.TODO;
        showConfirmModal({
            title: translate('inboxTabs.markAllAsRead'),
            prompt: translate(isTodoTab ? 'inboxTabs.markAllTodosAsReadConfirmationPrompt' : 'inboxTabs.markAllAsReadConfirmationPrompt'),
            confirmText: translate('inboxTabs.markAllAsRead'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            // From the To-dos tab only the chats listed there are marked read. The All and Unread tabs both cover every
            // unread chat, so they mark all of them.
            markAllMessagesAsRead(reportNameValuePairs, isTodoTab ? getReportIDsForTab(CONST.INBOX_TAB.TODO) : undefined);
        });
    };

    const menuItems: PopoverMenuItem[] = [
        {
            text: translate('inboxTabs.markAllAsRead'),
            icon: icons.Checkmark,
            // Wait for the popover to fully hide before showing the confirmation modal so they don't overlap.
            shouldCallAfterModalHide: true,
            onSelected: confirmMarkAllAsRead,
        },
    ];

    const tabs: TabSelectorBaseItem[] = [
        {
            key: CONST.INBOX_TAB.ALL,
            title: translate('inboxTabs.all'),
            tabRef: allTabRef,
            // Every tab opens the "Mark all as read" menu on long-press / right-click, so they all wire the secondary
            // interaction (which suppresses the native browser context menu on web).
            shouldEnableLongPress: true,
        },
        {
            key: CONST.INBOX_TAB.UNREAD,
            title: translate('inboxTabs.unread'),
            badgeText: getBadgeText(inboxTabCounts[CONST.INBOX_TAB.UNREAD]),
            isBadgeCondensed: true,
            badgeStyles: styles.tabSelectorBadge,
            tabRef: unreadTabRef,
            shouldEnableLongPress: true,
        },
        {
            key: CONST.INBOX_TAB.TODO,
            title: translate('inboxTabs.todo'),
            badgeText: getBadgeText(inboxTabCounts[CONST.INBOX_TAB.TODO]),
            isBadgeCondensed: true,
            badgeStyles: styles.tabSelectorBadge,
            tabRef: todoTabRef,
            shouldEnableLongPress: true,
        },
    ];

    return (
        <View>
            <TabSelectorContextProvider activeTabKey={activeTab}>
                <TabSelectorBase
                    tabs={tabs}
                    activeTabKey={activeTab}
                    onTabPress={(key) => {
                        if (key !== CONST.INBOX_TAB.ALL && key !== CONST.INBOX_TAB.UNREAD && key !== CONST.INBOX_TAB.TODO) {
                            return;
                        }
                        setActiveTab(key);
                    }}
                    onLongTabPress={openMarkAllAsReadMenu}
                />
            </TabSelectorContextProvider>
            <PopoverMenu
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                onItemSelected={() => setIsMenuVisible(false)}
                menuItems={menuItems}
                anchorRef={tabRefs[menuTab]}
                anchorPosition={popoverPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={anchorAlignment}
                // Safari ignores shouldCallAfterModalHide by default, which would show the confirmation modal while the
                // popover is still dismissing and its focus trap is active. Avoid that exception so the sequencing holds on Safari too.
                shouldAvoidSafariException
            />
        </View>
    );
}

InboxTabSelector.displayName = 'InboxTabSelector';

export default InboxTabSelector;
