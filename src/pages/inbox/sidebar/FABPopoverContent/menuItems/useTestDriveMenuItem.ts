import {useMemo} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseTestDriveMenuItemParams = {
    icons: MenuItemIcons;
};

function useTestDriveMenuItem({icons}: UseTestDriveMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});
    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();

    return useMemo(() => {
        if (hasSeenTour) {
            return [];
        }
        return [
            {
                icon: icons.Binoculars,
                iconStyles: styles.popoverIconCircle,
                iconFill: theme.icon,
                text: translate('testDrive.quickAction.takeATwoMinuteTestDrive'),
                onSelected: () => interceptAnonymousUser(() => startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember)),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE,
            },
        ];
    }, [hasSeenTour, icons.Binoculars, styles.popoverIconCircle, theme.icon, translate, introSelected, tryNewDot?.hasBeenAddedToNudgeMigration, isUserPaidPolicyMember]);
}

export default useTestDriveMenuItem;
