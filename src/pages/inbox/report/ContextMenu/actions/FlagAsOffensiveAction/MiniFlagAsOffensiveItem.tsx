import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type MiniFlagAsOffensiveItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniFlagAsOffensiveItem({reportID, reportAction, hideAndRun}: MiniFlagAsOffensiveItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.flagAsOffensive')}
            icon={icons.Flag}
            onPress={() => {
                if (!reportID) {
                    return;
                }
                const activeRoute = Navigation.getActiveRoute();
                hideAndRun(() => {
                    KeyboardUtils.dismiss().then(() => {
                        Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                    });
                });
            }}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE}
        />
    );
}
