import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function FloatingGpsButton() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Location'] as const);
    const {textMutedReversed} = useTheme();
    const styles = useThemeStyles();

    if (!gpsDraftDetails?.isTracking) {
        return null;
    }

    const navigateToGpsScreen = () => {
        const reportID = gpsDraftDetails?.reportID ?? generateReportID();
        Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
    };

    return (
        <PressableWithoutFeedback
            style={[styles.navigationTabBarFABItem, styles.ph0, styles.userSelectNone, styles.floatingGpsButton]}
            accessibilityLabel={translate('gps.fabGpsTripExplained')}
            onPress={navigateToGpsScreen}
            role={CONST.ROLE.BUTTON}
            testID="floating-gps-button"
        >
            <View
                style={styles.floatingSecondaryActionButton}
                testID="floating-gps-button-container"
            >
                <Icon
                    fill={textMutedReversed}
                    src={icons.Location}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

FloatingGpsButton.displayName = 'FloatingGpsButton';

export default FloatingGpsButton;
