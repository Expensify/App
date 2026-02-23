import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import React from 'react';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TestDriveMenuItemProps = {
    icons: MenuItemIcons;
};

function TestDriveMenuItem({icons}: TestDriveMenuItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});
    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();

    if (hasSeenTour) {
        return null;
    }

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE}
            icon={icons.Binoculars}
            iconStyles={styles.popoverIconCircle}
            iconFill={theme.icon}
            text={translate('testDrive.quickAction.takeATwoMinuteTestDrive')}
            onSelected={() => interceptAnonymousUser(() => startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember))}
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE}
        />
    );
}

export default TestDriveMenuItem;
