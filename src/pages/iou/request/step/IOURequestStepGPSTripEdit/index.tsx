import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DistanceMapView from '@components/DistanceMapView';
import type {Coordinate, MapViewHandle} from '@components/MapView/MapViewTypes';
import Text from '@components/Text';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {applyTrimmedTrip, resetTripTrim} from '@libs/actions/GPSDraftDetails';
import {init as initMapboxToken, stop as stopMapboxToken} from '@libs/actions/MapboxToken';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateTrimmedEndPoint, getGpsPoints, getTrimmedGpsRoute} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import useGPSWaypointMarkers from '@pages/iou/request/step/IOURequestStepDistanceGPS/useGPSWaypointMarkers';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
    const [trimmedEndPoint, setTrimmedEndPoint] = useState(gpsDraftDetails?.trimmedEndPoint);
    const [trimmedDistance, setTrimmedDistance] = useState(gpsDraftDetails?.modifiedDistance ?? gpsDraftDetails?.distanceInMeters ?? 0);
    const [trimmedDirectionCoords, setTrimmedDirectionCoords] = useState<Coordinate[][]>(() => {
        if (!trimmedEndPoint) {
            return gpsPoints.map((points): Coordinate[] => points.map(({lat, long}) => [long, lat]));
        }
        const trimmedCoords = getTrimmedGpsRoute(gpsPoints, trimmedEndPoint);
        return trimmedCoords.map((seg): Coordinate[] => seg.map(({lat, long}) => [long, lat]));
    });

    const mapRef = useRef<MapViewHandle>(null);

    // Use refs so the animated-reaction callback is always fresh without re-creating the gesture
    const gpsPointsRef = useRef(gpsPoints);
    const totalDistanceMetersRef = useRef(totalDistanceMeters);

    useEffect(() => {
        initMapboxToken();
        return stopMapboxToken;
    }, []);

    const goBackRoute = ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(action, iouType, transactionID, reportID, backToReport);
    const navigateBack = () => {
        Navigation.goBack(goBackRoute);
    };

    const updateTrimmedRoute = (ratio: number) => {
        if (!gpsPointsRef.current || !totalDistanceMetersRef.current) {
            return;
        }

        const newTrimmedDistance = ratio * totalDistanceMetersRef.current;
        setTrimmedDistance(newTrimmedDistance);

        const newTrimmedEndPoint = calculateTrimmedEndPoint(gpsPointsRef.current, newTrimmedDistance);

        if (!newTrimmedEndPoint) {
            return;
        }

        setTrimmedEndPoint(newTrimmedEndPoint);

        const trimmedCoords = getTrimmedGpsRoute(gpsPointsRef.current, newTrimmedEndPoint);
        setTrimmedDirectionCoords(trimmedCoords.map((seg): Coordinate[] => seg.map(({lat, long}) => [long, lat])));
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
                <View style={[styles.mapViewContainer, {minHeight: undefined}]}>
                    <DistanceMapView
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
                        ref={mapRef}
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
                            success
                            allowBubble
                            pressOnEnter
                            large
                            text={translate('gps.save')}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_SAVE_EDIT_BUTTON}
                        />
                    </View>
                </View>
            </View>
        </StepScreenWrapper>
    );
}

export default IOURequestStepGPSTripEdit;
