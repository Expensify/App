import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getChildReportNotificationPreference} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';

type PopoverLeaveThreadItemProps = {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean | undefined;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverLeaveThreadItem({
    reportAction,
    originalReport,
    currentUserAccountID,
    introSelected,
    isSelfTourViewed,
    betas,
    hideAndRun,
    isFocused,
    onFocus,
    onBlur,
}: PopoverLeaveThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Exit'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.leaveThread')}
            icon={icons.Exit}
            onPress={() =>
                interceptAnonymousUser(() => {
                    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                    hideAndRun(() => {
                        ReportActionComposeFocusManager.focus();
                        toggleSubscribeToChildReport(
                            reportAction?.childReportID,
                            currentUserAccountID,
                            reportAction,
                            originalReport,
                            introSelected,
                            isSelfTourViewed,
                            betas,
                            childReportNotificationPreference,
                        );
                    });
                }, false)
            }
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD}
        />
    );
}
