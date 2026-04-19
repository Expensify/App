import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type PopoverFlagAsOffensiveItemProps = {
    originalReportID: string | undefined;
    reportAction: ReportAction;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverFlagAsOffensiveItem({originalReportID, reportAction, hideAndRun, isFocused, onFocus, onBlur}: PopoverFlagAsOffensiveItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Flag'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.flagAsOffensive')}
            icon={icons.Flag}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (!originalReportID) {
                        return;
                    }
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() => {
                            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.FLAG_COMMENT.getRoute(originalReportID, reportAction.reportActionID)));
                        });
                    });
                })
            }
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
