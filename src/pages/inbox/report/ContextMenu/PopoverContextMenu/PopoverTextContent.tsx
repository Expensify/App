import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {View as ViewType} from 'react-native';
import {View} from 'react-native';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

type PopoverTextContentProps = {
    selection: string;
    contentRef: React.RefObject<ViewType | null>;
};

function PopoverTextContent({selection, contentRef}: PopoverTextContentProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Checkmark'] as const);

    const handlePress = () => {
        interceptAnonymousUser(() => {
            Clipboard.setString(selection);
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
                text={translate('common.copyToClipboard')}
                icon={icons.Copy}
                onPress={handlePress}
                wrapperStyle={[styles.pr8]}
                isAnonymousAction
                successText={translate('reportActionContextMenu.copied')}
                successIcon={icons.Checkmark}
                sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_TO_CLIPBOARD}
            />
        </View>
    );
}

export default PopoverTextContent;
