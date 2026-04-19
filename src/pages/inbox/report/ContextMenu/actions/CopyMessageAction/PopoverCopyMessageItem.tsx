import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {CopyMessageClipboardParams} from './copyMessageAction';
import {copyMessageToClipboard} from './copyMessageAction';

type PopoverCopyMessageItemProps = Omit<CopyMessageClipboardParams, 'translate'> & {
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverCopyMessageItem({
    reportAction,
    transaction,
    selection,
    report,
    conciergeReportID,
    bankAccountList,
    card,
    originalReport,
    isHarvestReport,
    isTryNewDotNVPDismissed,
    movedFromReport,
    movedToReport,
    childReport,
    policy,
    getLocalDateFromDatetime,
    policyTags,
    harvestReport,
    currentUserPersonalDetails,
    isFocused,
    onFocus,
    onBlur,
}: PopoverCopyMessageItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.copyMessage')}
            icon={icons.Copy}
            successIcon={icons.Checkmark}
            successText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    copyMessageToClipboard({
                        reportAction,
                        transaction,
                        selection,
                        report,
                        conciergeReportID,
                        bankAccountList,
                        card,
                        originalReport,
                        isHarvestReport,
                        isTryNewDotNVPDismissed,
                        movedFromReport,
                        movedToReport,
                        childReport,
                        policy,
                        getLocalDateFromDatetime,
                        policyTags,
                        translate,
                        harvestReport,
                        currentUserPersonalDetails,
                    });
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            isAnonymousAction
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE}
        />
    );
}
