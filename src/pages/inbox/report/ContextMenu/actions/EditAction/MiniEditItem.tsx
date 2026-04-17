import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getActionHtml} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Beta, IntroSelected, ReportAction} from '@src/types/onyx';

type MiniEditItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    draftMessage: string;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniEditItem({reportID, reportAction, moneyRequestAction, draftMessage, introSelected, betas, hideAndRun}: MiniEditItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.editAction', {action: moneyRequestAction ?? reportAction})}
            icon={icons.Pencil}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (isMoneyRequestAction(reportAction) || isMoneyRequestAction(moneyRequestAction)) {
                        hideAndRun(() => {
                            const childReportID = reportAction?.childReportID;
                            openReport({reportID: childReportID, introSelected, betas});
                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
                        });
                        return;
                    }
                    hideAndRun(() => {
                        if (!draftMessage) {
                            saveReportActionDraft(reportID, reportAction, Parser.htmlToMarkdown(getActionHtml(reportAction)));
                        } else {
                            deleteReportActionDraft(reportID, reportAction);
                        }
                    });
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT}
        />
    );
}
