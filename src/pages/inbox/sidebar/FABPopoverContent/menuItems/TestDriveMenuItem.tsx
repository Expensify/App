import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {startTestDrive} from '@libs/actions/Tour';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TestDriveMenuItemProps = {
    icons: MenuItemIcons;
    /** Injected by FABPopoverMenu via React.cloneElement */
    itemIndex?: number;
};

function useTestDriveMenuItemVisible(): boolean {
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});
    return !hasSeenTour;
}

function TestDriveMenuItem({icons, itemIndex = -1}: TestDriveMenuItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});
    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();
    const {focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE}
            icon={icons.Binoculars}
            iconStyles={styles.popoverIconCircle}
            iconFill={theme.icon}
            title={translate('testDrive.quickAction.takeATwoMinuteTestDrive')}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(() => startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember)))}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export {useTestDriveMenuItemVisible};
export default TestDriveMenuItem;
