import React from 'react';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';

function InboxTabSelector() {
    const {translate} = useLocalize();
    const {activeTab} = useSidebarOrderedReportsState();
    const {setActiveTab} = useSidebarOrderedReportsActions();

    const tabs: TabSelectorBaseItem[] = [
        {key: CONST.INBOX_TAB.ALL, title: translate('inboxTabs.all')},
        {key: CONST.INBOX_TAB.UNREADS, title: translate('inboxTabs.unreads')},
        {key: CONST.INBOX_TAB.EXPENSES, title: translate('inboxTabs.expenses')},
        {key: CONST.INBOX_TAB.DIRECT_MESSAGES, title: translate('inboxTabs.directMessages')},
    ];

    return (
        <TabSelectorContextProvider activeTabKey={activeTab}>
            <TabSelectorBase
                tabs={tabs}
                activeTabKey={activeTab}
                onTabPress={setActiveTab}
                size="small"
            />
        </TabSelectorContextProvider>
    );
}

InboxTabSelector.displayName = 'InboxTabSelector';

export default InboxTabSelector;
