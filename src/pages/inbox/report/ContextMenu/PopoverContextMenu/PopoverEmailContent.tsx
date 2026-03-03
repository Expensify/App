import React from 'react';
import {View} from 'react-native';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {PopoverContentProps} from '.';

function PopoverEmailContent({menuState, contentRef}: PopoverContentProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    const handlePress = () => {
        interceptAnonymousUser(() => {
            Clipboard.setString(EmailUtils.trimMailTo(menuState.selection));
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        }, true);
    };

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);
    const description = EmailUtils.prefixMailSeparatorsWithBreakOpportunities(EmailUtils.trimMailTo(menuState.selection ?? ''));

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            <ContextMenuItem
                text={translate('reportActionContextMenu.copyEmailToClipboard')}
                icon={icons.Copy}
                onPress={handlePress}
                wrapperStyle={[styles.pr8]}
                description={description}
                isAnonymousAction
                successText={translate('reportActionContextMenu.copied')}
                successIcon={icons.Checkmark}
                sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_EMAIL}
            />
        </View>
    );
}

export default PopoverEmailContent;
