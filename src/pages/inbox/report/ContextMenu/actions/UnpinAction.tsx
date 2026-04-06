import React from 'react';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';

type PopoverUnpinItemProps = {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverUnpinItem({reportID, hideAndRun, isFocused, onFocus, onBlur}: PopoverUnpinItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pin'] as const);

    return (
        <ContextMenuItem
            text={translate('common.unPin')}
            icon={icons.Pin}
            onPress={() =>
                interceptAnonymousUser(() => {
                    togglePinnedState(reportID, true);
                    hideAndRun(ReportActionComposeFocusManager.focus);
                })
            }
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.UNPIN}
        />
    );
}

function shouldShowUnpinAction({isPinnedChat}: {isPinnedChat: boolean}): boolean {
    return isPinnedChat;
}

export {shouldShowUnpinAction, PopoverUnpinItem};
