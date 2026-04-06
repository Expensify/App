import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type PopoverCopyOnyxDataItemProps = {
    report: OnyxEntry<Report>;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverCopyOnyxDataItem({report, isFocused, onFocus, onBlur}: PopoverCopyOnyxDataItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.copyOnyxData')}
            icon={icons.Copy}
            successIcon={icons.Checkmark}
            successText={translate('reportActionContextMenu.copied')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    Clipboard.setString(JSON.stringify(report, null, 4));
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }, true)
            }
            isAnonymousAction
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA}
        />
    );
}

function shouldShowCopyOnyxDataAction({isProduction}: {isProduction: boolean}): boolean {
    return !isProduction;
}

export {shouldShowCopyOnyxDataAction, PopoverCopyOnyxDataItem};
