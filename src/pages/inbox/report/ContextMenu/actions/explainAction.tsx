import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {hasReasoning} from '@libs/ReportActionsUtils';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import type {IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type PopoverExplainItemProps = {
    childReport: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    introSelected: OnyxEntry<IntroSelected>;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverExplainItem({childReport, originalReport, reportAction, currentUserPersonalDetails, introSelected, hideAndRun, isFocused, onFocus, onBlur}: PopoverExplainItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Concierge'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.explain')}
            icon={icons.Concierge}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (!originalReport?.reportID) {
                        return;
                    }
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() =>
                            explain(
                                childReport,
                                originalReport,
                                reportAction,
                                translate,
                                currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                                introSelected,
                                currentUserPersonalDetails?.timezone,
                            ),
                        );
                    });
                })
            }
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN}
        />
    );
}

type MiniExplainItemProps = {
    childReport: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    introSelected: OnyxEntry<IntroSelected>;
    hideAndRun: (callback?: () => void) => void;
};

function MiniExplainItem({childReport, originalReport, reportAction, currentUserPersonalDetails, introSelected, hideAndRun}: MiniExplainItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Concierge'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.explain')}
            icon={icons.Concierge}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (!originalReport?.reportID) {
                        return;
                    }
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() =>
                            explain(
                                childReport,
                                originalReport,
                                reportAction,
                                translate,
                                currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                                introSelected,
                                currentUserPersonalDetails?.timezone,
                            ),
                        );
                    });
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN}
        />
    );
}

function shouldShowExplainAction({reportAction, isArchivedRoom}: {reportAction: OnyxEntry<ReportAction>; isArchivedRoom: boolean}): boolean {
    if (isArchivedRoom || !reportAction) {
        return false;
    }
    return hasReasoning(reportAction);
}

export {shouldShowExplainAction, PopoverExplainItem, MiniExplainItem};
