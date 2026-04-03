import React, {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import DistanceMapView from '@components/DistanceMapView';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import ImageSVG from '@components/ImageSVG';
import type {MapViewHandle, WayPoint} from '@components/MapView/MapViewTypes';
import mapUtils from '@components/MapView/utils';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setGPSTransactionDraftData} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import {init as initMapboxToken, stop as stopMapboxToken} from '@libs/actions/MapboxToken';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getGPSConvertedDistance, getGPSCoordinates, getGPSWaypoints} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {getRateID} from '@libs/TransactionUtils';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import GPSButtons from './GPSButtons';
import type IOURequestStepDistanceGPSProps from './types';
import Waypoints from './Waypoints';

function IOURequestStepDistanceGPS({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, reportActionID, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceGPSProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicatorUnfilled', 'Location']);

    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const reportAttributesDerived = useReportAttributes();
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !isEditing;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const personalPolicy = usePersonalPolicy();
    const policy = usePolicy(report?.policyID);
    const isArchived = isArchivedReport(reportNameValuePairs);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const shouldUseDefaultExpensePolicy = shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd);

    const customUnitRateID = getRateID(transaction);
    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;

    const shouldSkipConfirmation = !skipConfirmation || !report?.reportID ? false : !(isArchived || isPolicyExpenseChatUtils(report));

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const navigateToNextStep = () => {
        const gpsCoordinates = getGPSCoordinates(gpsDraftDetails);
        const distance = getGPSConvertedDistance(gpsDraftDetails, unit);

        setGPSTransactionDraftData(transactionID, gpsDraftDetails, distance);

        const waypoints = getGPSWaypoints(gpsDraftDetails);

        handleMoneyRequestStepDistanceNavigation({
            iouType,
            report,
            policy,
            transaction,
            reportID,
            transactionID,
            reportAttributesDerived,
            personalDetails,
            waypoints,
            customUnitRateID,
            currentUserLogin: currentUserEmailParam,
            currentUserAccountID: currentUserAccountIDParam,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            lastSelectedDistanceRates,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            privateIsArchived: reportNameValuePairs?.private_isArchived,
            gpsCoordinates,
            gpsDistance: distance,
            selfDMReport,
            policyForMovingExpenses,
            betas,
            recentWaypoints,
            unit,
            personalOutputCurrency: personalPolicy?.outputCurrency,
            draftTransactionIDs,
            isSelfTourViewed: !!isSelfTourViewed,
            amountOwed,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
        });
    };

    const [shouldShowStartError, setShouldShowStartError] = useState(false);
    const [shouldShowPermissionsError, setShouldShowPermissionsError] = useState(false);
    const getError = (): Errors => {
        if (shouldShowStartError) {
            return {startError: translate('gps.error.failedToStart')};
        }
        if (shouldShowPermissionsError) {
            return {permissionsError: translate('gps.error.failedToGetPermissions')};
        }
        return {};
    };

    useEffect(() => {
        initMapboxToken();
        return stopMapboxToken;
    }, []);

    const mapRef = useRef<MapViewHandle>(null);

    const getMarkerComponent = (icon: IconAsset): ReactNode => (
        <ImageSVG
            src={icon}
            width={CONST.MAP_MARKER_SIZE}
            height={CONST.MAP_MARKER_SIZE}
            fill={theme.icon}
        />
    );

    const directionCoordinates: Array<[number, number]> = (gpsDraftDetails?.gpsPoints ?? []).map(({lat, long}) => [long, lat]);
    const isTripCaptured = !gpsDraftDetails?.isTracking && (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0;

    const getWaypointMarkers = (): WayPoint[] => {
        const points = gpsDraftDetails?.gpsPoints ?? [];
        const firstPoint = points.at(0);
        const lastPoint = points.at(-1);
        const markers: WayPoint[] = [];

        if (firstPoint) {
            const StartIcon = expensifyIcons.DotIndicatorUnfilled;
            markers.push({
                id: 'gps-start',
                coordinate: [firstPoint.long, firstPoint.lat],
                markerComponent: (): ReactNode => getMarkerComponent(StartIcon),
            });
        }

        if (lastPoint && lastPoint !== firstPoint && isTripCaptured) {
            const EndIcon = expensifyIcons.Location;
            markers.push({
                id: 'gps-end',
                coordinate: [lastPoint.long, lastPoint.lat],
                markerComponent: (): ReactNode => getMarkerComponent(EndIcon),
            });
        }

        return markers;
    };

    const waypointMarkers = getWaypointMarkers();

    useEffect(() => {
        if (!gpsDraftDetails?.isTracking) {
            return;
        }
        const latestPoint = gpsDraftDetails.gpsPoints?.at(-1);
        if (!latestPoint) {
            return;
        }
        mapRef.current?.flyTo([latestPoint.long, latestPoint.lat], CONST.MAPBOX.DEFAULT_ZOOM, 1000);
    }, [gpsDraftDetails?.gpsPoints, gpsDraftDetails?.isTracking]);

    const showFullRouteAfterStopping = () => {
        if (directionCoordinates.length < 2) {
            return;
        }
        const {northEast, southWest} = mapUtils.getBounds(
            waypointMarkers.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        mapRef.current?.fitBounds(northEast, southWest, CONST.MAPBOX.PADDING, 1000);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={() => Navigation.goBack()}
            testID="IOURequestStepDistanceGPS"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <View style={styles.mapViewContainer}>
                <DistanceMapView
                    accessToken={mapboxAccessToken?.token ?? ''}
                    mapPadding={CONST.MAPBOX.PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: waypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
                    }}
                    style={[styles.mapView, styles.mapEditView]}
                    overlayStyle={styles.mapEditView}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                    waypoints={waypointMarkers}
                    directionCoordinates={directionCoordinates}
                    ref={mapRef}
                />
            </View>

            <View style={[styles.w100]}>
                <Waypoints unit={unit} />
                <DotIndicatorMessage
                    style={[styles.ph5, styles.pb3]}
                    messages={getError()}
                    type="error"
                />
                <GPSButtons
                    navigateToNextStep={navigateToNextStep}
                    setShouldShowStartError={setShouldShowStartError}
                    setShouldShowPermissionsError={setShouldShowPermissionsError}
                    onTripStopped={showFullRouteAfterStopping}
                    reportID={reportID}
                    unit={unit}
                />
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
