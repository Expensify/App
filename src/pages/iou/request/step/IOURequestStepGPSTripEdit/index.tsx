import Button from '@components/ButtonComposed';
import DistanceMapView from '@components/DistanceMapView';
import Text from '@components/Text';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {applyTrimmedTrip, resetTripTrim} from '@libs/actions/GPSDraftDetails';
import {init as initMapboxToken, stop as stopMapboxToken} from '@libs/actions/MapboxToken';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateTrimmedEndPoint, getGpsPoints, getTrimmedGpsTrip, gpsPointsToMapboxCoordinates} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';

import useGPSWaypointMarkers from '@pages/iou/request/step/IOURequestStepDistanceGPS/useGPSWaypointMarkers';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import Slider from './Slider';

type IOURequestStepGPSTripEditProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.GPS_TRIP_EDIT>;

function IOURequestStepGPSTripEdit({
    route: {
        params: {action, iouType, transactionID, reportID, backToReport},
    },
}: IOURequestStepGPSTripEditProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isInLandscapeMode = useIsInLandscapeMode();

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN);

    const gpsPoints = getGpsPoints(gpsDraftDetails);
    const totalDistanceMeters = gpsDraftDetails?.distanceInMeters ?? 0;

    const [isSaving, setIsSaving] = useState(false);
    // The trim the user is dragging out right now; undefined until they touch the slider
    const [pendingTrim, setPendingTrim] = useState<{endPoint: TrimmedGPSPoint; distance: number} | undefined>();

    const trimmedEndPoint = pendingTrim?.endPoint ?? gpsDraftDetails?.trimmedEndPoint;
    const trimmedDistance = pendingTrim?.distance ?? gpsDraftDetails?.modifiedDistance ?? totalDistanceMeters;
    const trimmedDirectionCoords = gpsPointsToMapboxCoordinates(getTrimmedGpsTrip(gpsPoints, trimmedEndPoint));

    const updateTrimmedRoute = (ratio: number) => {
        if (!gpsPoints.length || !totalDistanceMeters) {
            return;
        }
        const distance = ratio * totalDistanceMeters;
        const endPoint = calculateTrimmedEndPoint(gpsPoints, distance);
        if (!endPoint) {
            return;
        }
        setPendingTrim({endPoint, distance});
    };

    useEffect(() => {
        initMapboxToken();
        return stopMapboxToken;
    }, []);

    const goBackRoute = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(action, iouType, transactionID, reportID, backToReport);
    const navigateBack = () => {
        Navigation.goBack(goBackRoute);
    };

    const gpsWaypointMarkers = useGPSWaypointMarkers({gpsDraftDetails, trimmedEndPoint});

    const unit = gpsDraftDetails?.unit ?? 'mi';
    const displayDistance = DistanceRequestUtils.convertDistanceUnit(trimmedDistance, unit).toFixed(1);

    const saveTrimmedTrip = async () => {
        if (!gpsDraftDetails) {
            return;
        }

        if (trimmedDistance === totalDistanceMeters) {
            resetTripTrim();
            navigateBack();
            return;
        }

        setIsSaving(true);
        await applyTrimmedTrip(gpsDraftDetails, trimmedDistance, isOffline);
        setIsSaving(false);

        navigateBack();
    };

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={translate('gps.editStop')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepGPSTripEdit"
        >
            <View style={[styles.flex1, isInLandscapeMode && styles.flexRow, styles.w100]}>
                <View style={styles.flex1}>
                    <DistanceMapView
                        shouldDisplayCurrentLocation={false}
                        accessToken={mapboxAccessToken?.token ?? ''}
                        mapPadding={CONST.MAPBOX.PADDING}
                        pitchEnabled={false}
                        initialState={{
                            zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                            location: gpsWaypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
                        }}
                        style={[styles.mapView, styles.mapEditView]}
                        overlayStyle={styles.mapEditView}
                        styleURL={CONST.MAPBOX.STYLE_URL}
                        waypoints={gpsWaypointMarkers}
                        directionCoordinates={trimmedDirectionCoords}
                    />
                </View>

                <View style={[isInLandscapeMode && [styles.flex1, styles.justifyContentBetween]]}>
                    <View style={[styles.pv3, styles.ph5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('gps.editStop')}</Text>

                        <Slider onSliderRatioChange={updateTrimmedRoute} />

                        <View style={[styles.pv3, styles.gap2]}>
                            <Text style={[styles.textLabelSupporting]}>{translate('gps.totalDistance')}</Text>
                            <Text style={[styles.textNormal]}>
                                {displayDistance} {unit}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.p5, styles.pt0]}>
                        <Button
                            onPress={saveTrimmedTrip}
                            isLoading={isSaving}
                            variant="success"
                            size={CONST.BUTTON_SIZE.LARGE}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_SAVE_EDIT_BUTTON}
                        >
                            <Button.Text>{translate('gps.save')}</Button.Text>
                        </Button>
                    </View>
                </View>
            </View>
        </StepScreenWrapper>
    );
}

export default IOURequestStepGPSTripEdit;
