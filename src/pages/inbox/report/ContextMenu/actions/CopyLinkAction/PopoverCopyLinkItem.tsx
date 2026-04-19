import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type PopoverCopyLinkItemProps = {
    reportAction: ReportAction;
    originalReportID: string | undefined;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverCopyLinkItem({reportAction, originalReportID, isFocused, onFocus, onBlur}: PopoverCopyLinkItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['LinkCopy', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.copyLink')}
            icon={icons.LinkCopy}
            successIcon={icons.Checkmark}
            successText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    getEnvironmentURL().then((environmentURL) => {
                        const reportActionID = reportAction?.reportActionID;
                        Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
                    });
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            isAnonymousAction
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK}
        />
    );
}
