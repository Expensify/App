import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction, Transaction} from '@src/types/onyx';

type MiniHoldItemProps = {
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    isOffline: boolean;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniHoldItem({moneyRequestAction, iouTransaction, isOffline, isDelegateAccessRestricted, showDelegateNoAccessModal, hideAndRun}: MiniHoldItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('iou.hold')}
            icon={icons.Stopwatch}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (isDelegateAccessRestricted) {
                        hideContextMenu(false, showDelegateNoAccessModal);
                        return;
                    }
                    hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction, iouTransaction, isOffline));
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD}
        />
    );
}
