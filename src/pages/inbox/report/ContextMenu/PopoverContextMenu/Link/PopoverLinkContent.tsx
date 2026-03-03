import React from 'react';
import {InteractionManager, View} from 'react-native';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import type {PopoverContentProps} from '..';

function PopoverLinkContent({menuState, contentRef}: PopoverContentProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    const interceptAnonymousUser = (callback: () => void, isAnonymousAction = false) => {
        if (isAnonymousUser() && !isAnonymousAction) {
            hideContextMenu(false);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                signOutAndRedirectToSignIn();
            });
        } else {
            callback();
        }
    };

    const handlePress = () => {
        interceptAnonymousUser(() => {
            Clipboard.setString(menuState.selection);
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        }, true);
    };

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            <ContextMenuItem
                text={translate('reportActionContextMenu.copyURLToClipboard')}
                icon={icons.Copy}
                onPress={handlePress}
                wrapperStyle={[styles.pr8]}
                description={menuState.selection}
                isAnonymousAction
                successText={translate('reportActionContextMenu.copied')}
                successIcon={icons.Checkmark}
                sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_URL}
            />
        </View>
    );
}

export default PopoverLinkContent;
