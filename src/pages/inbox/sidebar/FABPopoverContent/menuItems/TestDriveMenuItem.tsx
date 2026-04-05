import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TEST_DRIVE;

function TestDriveMenuItem() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Binoculars'] as const);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const isVisible = !hasSeenTour;

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE}
            icon={icons.Binoculars}
            iconStyles={styles.popoverIconCircle}
            iconFill={theme.icon}
            title={translate('testDrive.quickAction.takeATwoMinuteTestDrive')}
            onPress={() => interceptAnonymousUser(() => startTestDrive())}
        />
    );
}

export default TestDriveMenuItem;
