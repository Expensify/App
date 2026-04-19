import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';

type MiniLeaveThreadItemProps = {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean | undefined;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniLeaveThreadItem({reportAction, originalReport, currentUserAccountID, introSelected, isSelfTourViewed, betas, hideAndRun}: MiniLeaveThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Exit'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.leaveThread')}
            icon={icons.Exit}
            onPress={() =>
                interceptAnonymousUser(() => {
                    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                    hideAndRun(() => {
                        ReportActionComposeFocusManager.focus();
                        toggleSubscribeToChildReport(
                            reportAction?.childReportID,
                            currentUserAccountID,
                            reportAction,
                            originalReport,
                            introSelected,
                            isSelfTourViewed,
                            betas,
                            childReportNotificationPreference,
                        );
                    });
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD}
        />
    );
}
