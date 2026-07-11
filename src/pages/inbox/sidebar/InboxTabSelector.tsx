import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';

import CONST from '@src/CONST';

function InboxTabSelector() {
    const {translate} = useLocalize();
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
        },
        {
            key: CONST.INBOX_TAB.TODO,
            title: translate('inboxTabs.todo'),
            badgeText: getBadgeText(inboxTabCounts[CONST.INBOX_TAB.TODO]),
        },
    ];

    return (
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
            />
        </TabSelectorContextProvider>
    );
}

InboxTabSelector.displayName = 'InboxTabSelector';

export default InboxTabSelector;
