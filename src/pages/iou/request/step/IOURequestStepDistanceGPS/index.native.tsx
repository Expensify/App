import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import DistanceMapView from '@components/DistanceMapView';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import type {Coordinate, MapViewHandle} from '@components/MapView/MapViewTypes';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {setGPSTransactionDraftData} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import {init as initMapboxToken, stop as stopMapboxToken} from '@libs/actions/MapboxToken';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getGPSConvertedDistance, getGpsPoints, getGPSWaypoints, getLastGpsPoint, getStringifiedGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import GPSButtons from './GPSButtons';
import type IOURequestStepDistanceGPSProps from './types';
import useGPSWaypointMarkers from './useGPSWaypointMarkers';
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

    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isInLandscapeMode = useIsInLandscapeMode();

    const mapRef = useRef<MapViewHandle>(null);

    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const isArchived = useReportIsArchived(report?.reportID);
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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !isEditing;

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const personalPolicy = usePersonalPolicy();
    const policy = usePolicy(report?.policyID);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const shouldUseDefaultExpensePolicy = shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd);

    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;

    const shouldSkipConfirmation = !skipConfirmation || !report?.reportID ? false : !(isArchived || isPolicyExpenseChatUtils(report));

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const navigateToNextStep = () => {
        const gpsCoordinates = getStringifiedGPSCoordinates(gpsDraftDetails);
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
            privateIsArchived: isArchived,
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
            conciergeReportID,
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

    // Fly to the latest point on location updates when the trip is ongoing
    useEffect(() => {
        if (!gpsDraftDetails?.isTracking) {
            return;
        }
        const latestPoint = getLastGpsPoint(gpsDraftDetails);
        if (!latestPoint) {
            return;
        }
        mapRef.current?.flyTo([latestPoint.long, latestPoint.lat], CONST.MAPBOX.DEFAULT_ZOOM, 1000);
    }, [gpsDraftDetails]);

    const waypointMarkers = useGPSWaypointMarkers();

    const directionCoordinates: Coordinate[][] = getGpsPoints(gpsDraftDetails).map((points): Coordinate[] => points.map(({lat, long}) => [long, lat]));

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={() => Navigation.goBack()}
            testID="IOURequestStepDistanceGPS"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <View style={[styles.flex1, isInLandscapeMode && styles.flexRow, styles.w100]}>
                <View style={[styles.mapViewContainer, {minHeight: undefined}]}>
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

                <View style={[isInLandscapeMode && [styles.flex1, styles.justifyContentEnd]]}>
                    <Waypoints
                        unit={unit}
                        isInLandscapeMode={isInLandscapeMode}
                    />

                    <View style={[styles.gap3, styles.ph5, isInLandscapeMode ? styles.pv3 : styles.pb5]}>
                        <DotIndicatorMessage
                            messages={getError()}
                            type="error"
                        />
                        <GPSButtons
                            navigateToNextStep={navigateToNextStep}
                            setShouldShowStartError={setShouldShowStartError}
                            setShouldShowPermissionsError={setShouldShowPermissionsError}
                            reportID={reportID}
                            unit={unit}
                            gpsPoints={getGpsPoints(gpsDraftDetails)}
                        />
                    </View>
                </View>
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);

const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);

const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
