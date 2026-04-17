import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction, Transaction} from '@src/types/onyx';

type PopoverHoldItemProps = {
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    isOffline: boolean;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverHoldItem({
    moneyRequestAction,
    iouTransaction,
    isOffline,
    isDelegateAccessRestricted,
    showDelegateNoAccessModal,
    hideAndRun,
    isFocused,
    onFocus,
    onBlur,
}: PopoverHoldItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('iou.hold')}
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
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD}
        />
    );
}
