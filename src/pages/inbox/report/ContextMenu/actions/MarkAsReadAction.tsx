import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

type PopoverMarkAsReadItemProps = {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverMarkAsReadItem({reportID, hideAndRun, isFocused, onFocus, onBlur}: PopoverMarkAsReadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Mail', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.markAsRead')}
            icon={icons.Mail}
            successIcon={icons.Checkmark}
            onPress={() =>
                interceptAnonymousUser(() => {
                    readNewestAction(reportID, true, true);
                    hideAndRun(ReportActionComposeFocusManager.focus);
                })
            }
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ}
        />
    );
}

function shouldShowMarkAsReadAction({isUnreadChat}: {isUnreadChat: boolean}): boolean {
    return isUnreadChat;
}

export {shouldShowMarkAsReadAction, PopoverMarkAsReadItem};
