import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import TabSelectorBase from './TabSelector/TabSelectorBase';

type WorkspaceTabsProps = {};

export default function WorkspaceTabs({}: WorkspaceTabsProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'Building']);
    const activeTabKey = Navigation.isActiveRoute(ROUTES.WORKSPACES_LIST.route) ? 'workspaces' : 'domains';

    const onTabPress = (key: string) => {
        if (key === activeTabKey) {
            return;
        }

        if (key === 'workspaces') {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
            return;
        }

        if (key === 'domains') {
            Navigation.navigate(ROUTES.WORKSPACES_DOMAINS.route);
            return;
        }
    };

    return (
        <TabSelectorBase
            equalWidth
            activeTabKey={activeTabKey}
            onTabPress={onTabPress}
            tabs={[
                {key: 'workspaces', title: translate('common.workspaces'), icon: icons.Building},
                {key: 'domains', title: translate('common.domains'), icon: icons.Globe},
            ]}
        />
    );
}
