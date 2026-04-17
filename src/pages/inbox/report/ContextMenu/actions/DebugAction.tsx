import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

type PopoverDebugItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverDebugItem({reportID, reportAction, isFocused, onFocus, onBlur}: PopoverDebugItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bug'] as const);

    return (
        <ContextMenuItem
            text={translate('debug.debug')}
            icon={icons.Bug}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (!reportID) {
                        return;
                    }
                    if (reportAction) {
                        Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, reportAction.reportActionID));
                    } else {
                        Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(reportID));
                    }
                    hideContextMenu(false, ReportActionComposeFocusManager.focus);
                }, true)
            }
            isAnonymousAction
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DEBUG}
        />
    );
}

function shouldShowDebugAction({isDebugModeEnabled}: {isDebugModeEnabled: OnyxEntry<boolean>}): boolean {
    return !!isDebugModeEnabled;
}

export {shouldShowDebugAction, PopoverDebugItem};
