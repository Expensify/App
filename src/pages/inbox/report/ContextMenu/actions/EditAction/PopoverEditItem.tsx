import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getActionHtml} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {deleteReportActionDraft, openReport, saveReportActionDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Beta, IntroSelected, ReportAction} from '@src/types/onyx';

type PopoverEditItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    draftMessage: string;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverEditItem({reportID, reportAction, moneyRequestAction, draftMessage, introSelected, betas, hideAndRun, isFocused, onFocus, onBlur}: PopoverEditItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.editAction', {action: moneyRequestAction ?? reportAction})}
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
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT}
        />
    );
}
