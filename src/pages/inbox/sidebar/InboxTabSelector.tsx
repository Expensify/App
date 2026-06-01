import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function InboxTabSelector() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {activeTab, inboxTabCounts} = useSidebarOrderedReportsState();
    const {setActiveTab} = useSidebarOrderedReportsActions();

    const getBadgeText = (count: number) => (count > 0 ? count.toString() : undefined);

    const tabs: TabSelectorBaseItem[] = [
        {
            key: CONST.INBOX_TAB.ALL,
            title: translate('inboxTabs.all'),
        },
        {
            key: CONST.INBOX_TAB.UNREAD,
            title: translate('inboxTabs.unread'),
            badgeText: getBadgeText(inboxTabCounts[CONST.INBOX_TAB.UNREAD]),
            isBadgeCondensed: true,
            badgeStyles: styles.inboxTabBadge,
        },
        {
            key: CONST.INBOX_TAB.TODO,
            title: translate('inboxTabs.todo'),
            badgeText: getBadgeText(inboxTabCounts[CONST.INBOX_TAB.TODO]),
            isBadgeCondensed: true,
            badgeStyles: styles.inboxTabBadge,
        },
    ];

    return (
        <TabSelectorContextProvider activeTabKey={activeTab}>
            <View style={styles.mb2}>
                <TabSelectorBase
                    tabs={tabs}
                    activeTabKey={activeTab}
                    onTabPress={(key) => setActiveTab(key as ValueOf<typeof CONST.INBOX_TAB>)}
                    size="small"
                    equalWidth
                />
            </View>
        </TabSelectorContextProvider>
    );
}

InboxTabSelector.displayName = 'InboxTabSelector';

export default InboxTabSelector;
