import Button from '@components/ButtonComposed';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

function FloatingGpsButton() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();

    const icons = useMemoizedLazyExpensifyIcons(['Crosshair']);
    const styles = useThemeStyles();

    if (!gpsDraftDetails?.isTracking) {
        return null;
    }

    const navigateToGpsScreen = () => {
        const reportID = gpsDraftDetails?.reportID ?? generateReportID();
        Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
    };

    return (
        <Button
            onPress={navigateToGpsScreen}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.SMALL}
            style={[styles.floatingGpsButton]}
            testID="floating-gps-button"
            accessibilityLabel={translate('gps.gpsFloatingPillText')}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_GPS_BUTTON}
        >
            <Button.Icon src={icons.Crosshair} />
            <Button.Text>{translate('gps.gpsFloatingPillText')}</Button.Text>
        </Button>
    );
}

FloatingGpsButton.displayName = 'FloatingGpsButton';

export default FloatingGpsButton;
