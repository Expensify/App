import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import useFABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TEST_DRIVE;

function TestDriveMenuItem() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Binoculars'] as const);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector});
    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();
    const isVisible = !hasSeenTour;

    const {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress} = useFABMenuItem(ITEM_ID, isVisible);

    if (!isVisible) {
        return null;
    }

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE}
            icon={icons.Binoculars}
            iconStyles={styles.popoverIconCircle}
            iconFill={theme.icon}
            title={translate('testDrive.quickAction.takeATwoMinuteTestDrive')}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(() => startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember)))}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default TestDriveMenuItem;
