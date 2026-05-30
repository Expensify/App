import React from 'react';
import type {ValueOf} from 'type-fest';
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
        {key: CONST.INBOX_TAB.TODO, title: translate('inboxTabs.todo')},
        {key: CONST.INBOX_TAB.UNREAD, title: translate('inboxTabs.unread')},
    ];

    return (
        <TabSelectorContextProvider activeTabKey={activeTab}>
            <TabSelectorBase
                tabs={tabs}
                activeTabKey={activeTab}
                onTabPress={(key) => setActiveTab(key as ValueOf<typeof CONST.INBOX_TAB>)}
                size="small"
            />
        </TabSelectorContextProvider>
    );
}

InboxTabSelector.displayName = 'InboxTabSelector';

export default InboxTabSelector;
