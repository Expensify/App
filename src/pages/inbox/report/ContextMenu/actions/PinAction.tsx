import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';

type PopoverPinItemProps = {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverPinItem({reportID, hideAndRun, isFocused, onFocus, onBlur}: PopoverPinItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pin'] as const);

    return (
        <ContextMenuItem
            text={translate('common.pin')}
            icon={icons.Pin}
            onPress={() =>
                interceptAnonymousUser(() => {
                    togglePinnedState(reportID, false);
                    hideAndRun(ReportActionComposeFocusManager.focus);
                })
            }
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.PIN}
        />
    );
}

function shouldShowPinAction({isPinnedChat}: {isPinnedChat: boolean}): boolean {
    return !isPinnedChat;
}

export {shouldShowPinAction, PopoverPinItem};
