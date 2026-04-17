import React from 'react';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type MiniFlagAsOffensiveItemProps = {
    originalReportID: string | undefined;
    reportAction: ReportAction;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniFlagAsOffensiveItem({originalReportID, reportAction, hideAndRun}: MiniFlagAsOffensiveItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.flagAsOffensive')}
            icon={icons.Flag}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (!originalReportID) {
                        return;
                    }
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() => {
                            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.FLAG_COMMENT.getRoute(originalReportID, reportAction.reportActionID)));
                        });
                    });
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE}
        />
    );
}
