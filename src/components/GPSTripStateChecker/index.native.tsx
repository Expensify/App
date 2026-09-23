import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {resetGPSDraftDetails} from '@libs/actions/GPSDraftDetails';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {checkAndCleanGpsNotification, startGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSplashScreenState} from '@src/SplashScreenStateContext';

import {accountIDSelector} from '@selectors/Session';
import {hasStartedLocationUpdatesAsync, startLocationUpdatesAsync, stopLocationUpdatesAsync} from 'expo-location';
import {useEffect, useRef, useState} from 'react';

import useUpdateGpsNotification from './useUpdateGpsNotification';
import useUpdateGpsTripOnReconnect from './useUpdateGpsTripOnReconnect';

// Names this component's entry on the global modal stack so the effect below can take that one entry down, rather
// than whatever modal happens to be on top when the trip stops being resumable.
const CONTINUE_TRIP_MODAL_ID = 'gpsContinueTrip';

function GPSTripStateChecker() {
    const {translate} = useLocalize();
    const [showContinueTripModal, setShowContinueTripModal] = useState(false);
    const [gpsDraftDetails, gpsDraftDetailsMetadata] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [currentAccountID, currentAccountIDResult] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const isSessionLoaded = currentAccountIDResult.status === 'loaded';
    const hasHandledAppRestart = useRef(false);
    const {isOffline} = useNetwork();
    const {showConfirmModal, closeModalByID} = useConfirmModal();

    const {splashScreenState} = useSplashScreenState();

    const reportID = gpsDraftDetails?.reportID ?? generateReportID();

    useUpdateGpsTripOnReconnect({gpsPoints: getGpsPoints(gpsDraftDetails)});
    useUpdateGpsNotification();

    // A trip started before this shipped records no accountID, so only a different one means another user.
    const isTripFromDifferentUser = isSessionLoaded && !!gpsDraftDetails?.accountID && gpsDraftDetails.accountID !== currentAccountID;

    // The prompt used to be rendered inline with this as its `isVisible`, so it hid itself again the moment any of
    // these went false. On the global modal stack that no longer happens for free, so the effect below both shows
    // the entry when this turns true and takes it down when it turns false.
    const shouldShowContinueTripModal = showContinueTripModal && !!gpsDraftDetails?.isTracking && !isTripFromDifferentUser && splashScreenState === CONST.BOOT_SPLASH_STATE.HIDDEN;

    // Keeps a re-render from stacking a second prompt, and tells the effect whether there is an entry left to close.
    const isContinueTripModalOpenRef = useRef(false);

    // Tells "the user answered" apart from "the conditions went false and we closed it ourselves". Both resolve the
    // promise with CLOSE, and CLOSE means "stop the trip" here, so without this an auto-close would stop the trip.
    const hasAutoClosedContinueTripModalRef = useRef(false);

    // The trip keeps recording points while the prompt is open, so the handlers have to read the trip as it stands
    // when the user answers. Reading the show-time values would submit a truncated trip.
    const gpsDraftDetailsRef = useRef(gpsDraftDetails);
    const isOfflineRef = useRef(isOffline);
    const reportIDRef = useRef(reportID);
    useEffect(() => {
        gpsDraftDetailsRef.current = gpsDraftDetails;
        isOfflineRef.current = isOffline;
        reportIDRef.current = reportID;
    });

    useEffect(() => {
        if (!isTripFromDifferentUser) {
            return;
        }

        resetGPSDraftDetails();
        hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).then((isRunning) => {
            if (!isRunning) {
                return;
            }

            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) =>
                console.error('[GPS distance request] Failed to stop tracking for a trip from another user', error),
            );
        });
    }, [isTripFromDifferentUser]);

    useEffect(() => {
        // Wait for the GPS_DRAFT_DETAILS subscription to hydrate before running the restart check once, so we don't
        // misread the not-yet-loaded state as "no trip" and wrongly stop an in-progress trip's background task.
        if (gpsDraftDetailsMetadata.status !== 'loaded' || hasHandledAppRestart.current) {
            return;
        }
        hasHandledAppRestart.current = true;

        async function handleGpsTripInProgressOnAppRestart() {
            await checkAndCleanGpsNotification();

            if (!gpsDraftDetails?.isTracking) {
                const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);
                if (isBackgroundTaskRunning) {
                    stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) =>
                        console.error('[GPS distance request] Failed to stop orphaned location tracking', error),
                    );
                }
                return;
            }

            setShowContinueTripModal(true);
        }

        handleGpsTripInProgressOnAppRestart();
    }, [gpsDraftDetails?.isTracking, gpsDraftDetailsMetadata.status]);

    useEffect(() => {
        return () => {
            hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).then((isRunning) => {
                if (!isRunning) {
                    return;
                }

                stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
            });
        };
    }, []);

    const navigateToGpsScreen = () => {
        Navigation.navigate(
            ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportIDRef.current),
        );
    };

    const continueGpsTrip = async () => {
        const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);

        const unit = gpsDraftDetailsRef.current?.unit;

        if (isBackgroundTaskRunning) {
            if (unit) {
                startGpsTripNotification(translate, reportIDRef.current, unit, gpsDraftDetailsRef.current?.distanceInMeters);
            }
            return;
        }

        try {
            await startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME, BACKGROUND_LOCATION_TASK_OPTIONS);
        } catch (error) {
            console.error('[GPS distance request] Failed to restart location tracking', error);
            return;
        }

        if (!unit) {
            return;
        }

        startGpsTripNotification(translate, reportIDRef.current, unit, gpsDraftDetailsRef.current?.distanceInMeters);
    };

    const onContinueTrip = () => {
        continueGpsTrip();
        navigateToGpsScreen();
    };

    const onViewTrip = () => {
        stopGpsTrip(isOfflineRef.current, getGpsPoints(gpsDraftDetailsRef.current));
        navigateToGpsScreen();
    };

    useEffect(() => {
        if (!shouldShowContinueTripModal) {
            if (!isContinueTripModalOpenRef.current) {
                return;
            }

            // Closing by ID rather than with `closeModal()`, which pops whatever sits on top and would take an
            // unrelated modal down if one had been opened over this one.
            hasAutoClosedContinueTripModalRef.current = true;
            closeModalByID(CONTINUE_TRIP_MODAL_ID);
            return;
        }

        if (isContinueTripModalOpenRef.current) {
            return;
        }
        isContinueTripModalOpenRef.current = true;

        showConfirmModal({
            id: CONTINUE_TRIP_MODAL_ID,
            title: translate('gps.continueGpsTripModal.title'),
            prompt: translate('gps.continueGpsTripModal.prompt'),
            shouldReverseStackedButtons: true,
            confirmText: translate('gps.continueGpsTripModal.confirm'),
            cancelText: translate('gps.continueGpsTripModal.cancel'),
            // Cancelling here stops the trip rather than dismissing the prompt, so Android hardware back must not be
            // routed into it. The hook defaults this to true when it is left undefined.
            shouldHandleNavigationBack: false,
        }).then((result) => {
            isContinueTripModalOpenRef.current = false;
            setShowContinueTripModal(false);

            // The conditions went false and the branch above took the entry down, so the user never answered and
            // neither branch below may run.
            if (hasAutoClosedContinueTripModalRef.current) {
                hasAutoClosedContinueTripModalRef.current = false;
                return;
            }

            if (result.action === ModalActions.CONFIRM) {
                onContinueTrip();
                return;
            }

            onViewTrip();
        });
    }, [closeModalByID, onContinueTrip, onViewTrip, shouldShowContinueTripModal, showConfirmModal, translate]);

    return null;
}

GPSTripStateChecker.displayName = 'GPSTripStateChecker';

export default GPSTripStateChecker;
