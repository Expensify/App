import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type MiniReplyInThreadItemProps = {
    childReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniReplyInThreadItem({childReport, reportAction, originalReport, currentUserAccountID, introSelected, betas, hideAndRun}: MiniReplyInThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.replyInThread')}
            icon={icons.ChatBubbleReply}
            onPress={() =>
                interceptAnonymousUser(() => {
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() => navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID, introSelected, betas));
                    });
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD}
        />
    );
}
