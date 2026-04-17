import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {explain} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type MiniExplainItemProps = {
    childReport: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniExplainItem({childReport, originalReport, reportAction, currentUserPersonalDetails, introSelected, betas, hideAndRun}: MiniExplainItemProps) {
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
                                betas,
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
