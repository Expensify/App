import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type PopoverFlagAsOffensiveItemProps = {
    reportID: string | undefined;
    reportAction: ReportAction;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverFlagAsOffensiveItem({reportID, reportAction, hideAndRun, isFocused, onFocus, onBlur}: PopoverFlagAsOffensiveItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.flagAsOffensive')}
            icon={icons.Flag}
            onPress={() => {
                if (!reportID) {
                    return;
                }
                const activeRoute = Navigation.getActiveRoute();
                hideAndRun(() => {
                    KeyboardUtils.dismiss().then(() => {
                        Navigation.navigate(ROUTES.FLAG_COMMENT.getRoute(reportID, reportAction?.reportActionID, activeRoute));
                    });
                });
            }}
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE}
        />
    );
}
