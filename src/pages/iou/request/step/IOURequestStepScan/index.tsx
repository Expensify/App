import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, InteractionManager, PanResponder, PixelRatio, StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type Webcam from 'react-webcam';
import MultiScan from '@assets/images/educational-illustration__multi-scan.svg';
import TestReceipt from '@assets/images/fake-receipt.png';
import Hand from '@assets/images/hand.svg';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import Shutter from '@assets/images/shutter.svg';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import DownloadAppBanner from '@components/DownloadAppBanner';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import LocationPermissionModal from '@components/LocationPermissionModal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {isMobile, isMobileWebKit} from '@libs/Browser';
import {base64ToFile, isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {navigateToParticipantPage, shouldStartLocationPermissionFlow} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getManagerMcTestParticipant, getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {findSelfDMReportID, generateReportID, getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getDefaultTaxCode, hasReceipt} from '@libs/TransactionUtils';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type {GpsPoint} from '@userActions/IOU';
import {
    checkIfScanFileCanBeRead,
    getMoneyRequestParticipantsFromReport,
    replaceReceipt,
    requestMoney,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReceipt,
    setMultipleMoneyRequestParticipantsFromReport,
    startSplitBill,
    trackExpense,
    updateLastLocationPermissionPrompt,
} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getLocationPermission} from './LocationPermission';
import NavigationAwareCamera from './NavigationAwareCamera/WebCamera';
import ReceiptPreviews from './ReceiptPreviews';
import type IOURequestStepScanProps from './types';
import type {ReceiptFile} from './types';

function IOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
    },
    transaction: initialTransaction,
    currentUserPersonalDetails,
    onLayout,
    isMultiScanEnabled = false,
    setIsMultiScanEnabled,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();

    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    // we need to use isSmallScreenWidth instead of shouldUseNarrowLayout because drag and drop is not supported on mobile
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);
    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>('prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(false);
    const [shouldShowMultiScanEducationalPopup, setShouldShowMultiScanEducationalPopup] = useState(false);

    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const canUseMultiScan = !isEditing && iouType !== CONST.IOU.TYPE.SPLIT && !backTo && !backToReport;
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);

    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) => Object.values(items ?? {}),
        canBeMissing: true,
    });
    const transactions = useMemo(() => {
        const allTransactions = initialTransactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID ? (optimisticTransactions ?? []) : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, initialTransactionID, optimisticTransactions]);

    const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>();
    const isTabActive = useIsFocused();

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    const canUseMultiDragAndDrop = isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP);
    const shouldAcceptMultipleFiles = canUseMultiDragAndDrop && !isEditing && !backTo;

    const selfDMReportID = useMemo(() => findSelfDMReportID(), []);

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = useCallback(() => {
        blinkOpacity.set(
            withTiming(0.4, {duration: 10}, () => {
                blinkOpacity.set(withTiming(0, {duration: 50}));
            }),
        );
    }, [blinkOpacity]);

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !isArchivedReport(reportNameValuePairs) && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy, reportNameValuePairs]);

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular len camera.
     */
    const requestCameraPermission = useCallback(() => {
        if (!isMobile()) {
            return;
        }

        const defaultConstraints = {facingMode: {exact: 'environment'}};
        navigator.mediaDevices
            .getUserMedia({video: {facingMode: {exact: 'environment'}, zoom: {ideal: 1}}})
            .then((stream) => {
                setCameraPermissionState('granted');
                stream.getTracks().forEach((track) => track.stop());
                // Only Safari 17+ supports zoom constraint
                if (isMobileWebKit() && stream.getTracks().length > 0) {
                    let deviceId;
                    for (const track of stream.getTracks()) {
                        const setting = track.getSettings();
                        if (setting.zoom === 1) {
                            deviceId = setting.deviceId;
                            break;
                        }
                    }
                    if (deviceId) {
                        setVideoConstraints({deviceId});
                        return;
                    }
                }
                if (!navigator.mediaDevices.enumerateDevices) {
                    setVideoConstraints(defaultConstraints);
                    return;
                }
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    let lastBackDeviceId = '';
                    for (let i = devices.length - 1; i >= 0; i--) {
                        const device = devices.at(i);
                        if (device?.kind === 'videoinput') {
                            lastBackDeviceId = device.deviceId;
                            break;
                        }
                    }
                    if (!lastBackDeviceId) {
                        setVideoConstraints(defaultConstraints);
                        return;
                    }
                    setVideoConstraints({deviceId: lastBackDeviceId});
                });
            })
            .catch(() => {
                setVideoConstraints(defaultConstraints);
                setCameraPermissionState('denied');
            });
    }, []);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, make the user star scanning flow from scratch.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    useEffect(() => {
        let isAllScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptPath = item.receipt?.source;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    return;
                }

                const onFailure = () => {
                    isAllScanFilesCanBeRead = false;
                };

                return checkIfScanFileCanBeRead(item.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
            }),
        ).then(() => {
            if (isAllScanFilesCanBeRead) {
                return;
            }
            setIsMultiScanEnabled?.(false);
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactions(true);
        });
        // We want this hook to run on mounting only
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isMobile() || !isTabActive) {
            setVideoConstraints(undefined);
            return;
        }
        navigator.permissions
            .query({
                name: 'camera',
            })
            .then((permissionState) => {
                setCameraPermissionState(permissionState.state);
                if (permissionState.state === 'granted') {
                    requestCameraPermission();
                }
            })
            .catch(() => {
                setCameraPermissionState('denied');
            })
            .finally(() => {
                setIsQueriedPermissionState(true);
            });
        // We only want to get the camera permission status when the component is mounted
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isTabActive]);

    // this effect will pre-fetch location in web and desktop if the location permission is already granted to optimize the flow
    useEffect(() => {
        const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
        if (!gpsRequired) {
            return;
        }

        getLocationPermission().then((status) => {
            if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
                return;
            }

            clearUserLocation();
            getCurrentPosition(
                (successData) => {
                    setUserLocation({longitude: successData.coords.longitude, latitude: successData.coords.latitude});
                },
                () => {},
                {
                    maximumAge: CONST.GPS.MAX_AGE,
                    timeout: CONST.GPS.TIMEOUT,
                },
            );
        });
    }, [initialTransaction?.amount, iouType]);

    useEffect(() => {
        if (isMultiScanEnabled) {
            return;
        }
        setReceiptFiles([]);
    }, [isMultiScanEnabled]);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const navigateToConfirmationPage = useCallback(
        (shouldNavigateToSubmit = false, reportIDParam: string | undefined = undefined) => {
            switch (iouType) {
                case CONST.IOU.TYPE.REQUEST:
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, initialTransactionID, reportID, backToReport));
                    break;
                case CONST.IOU.TYPE.SEND:
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, initialTransactionID, reportID));
                    break;
                default:
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                            CONST.IOU.ACTION.CREATE,
                            shouldNavigateToSubmit ? CONST.IOU.TYPE.SUBMIT : iouType,
                            initialTransactionID,
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            reportIDParam || reportID,
                            backToReport,
                        ),
                    );
            }
        },
        [backToReport, iouType, reportID, initialTransactionID],
    );

    const createTransaction = useCallback(
        (
            files: ReceiptFile[],
            participant: Participant,
            gpsPoints?: GpsPoint,
            policyParams?: {
                policy: OnyxEntry<Policy>;
            },
            billable?: boolean,
        ) => {
            files.forEach((receiptFile: ReceiptFile, index) => {
                const transaction = transactions.find((item) => item.transactionID === receiptFile.transactionID);
                const receipt: Receipt = receiptFile.file ?? {};
                receipt.source = receiptFile.source;
                receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
                if (iouType === CONST.IOU.TYPE.TRACK && report) {
                    trackExpense({
                        report,
                        isDraftPolicy: false,
                        participantParams: {
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                            participant,
                        },
                        transactionParams: {
                            amount: 0,
                            currency: transaction?.currency ?? 'USD',
                            created: transaction?.created,
                            receipt,
                            billable,
                            ...(gpsPoints ?? {}),
                        },
                        ...(policyParams ?? {}),
                        shouldHandleNavigation: index === files.length - 1,
                    });
                } else {
                    requestMoney({
                        report,
                        participantParams: {
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                            participant,
                        },
                        ...(policyParams ?? {}),
                        ...(gpsPoints ?? {}),
                        transactionParams: {
                            amount: 0,
                            attendees: transaction?.comment?.attendees,
                            currency: transaction?.currency ?? 'USD',
                            created: transaction?.created ?? '',
                            merchant: '',
                            receipt,
                            billable,
                        },
                        shouldHandleNavigation: index === files.length - 1,
                        backToReport,
                    });
                }
            });
        },
        [backToReport, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login, iouType, report, transactions],
    );

    const navigateToConfirmationStep = useCallback(
        (files: ReceiptFile[], locationPermissionGranted = false, isTestTransaction = false) => {
            if (backTo) {
                Navigation.goBack(backTo);
                return;
            }

            if (isTestTransaction) {
                const managerMcTestParticipant = getManagerMcTestParticipant() ?? {};
                let reportIDParam = managerMcTestParticipant.reportID;
                if (!managerMcTestParticipant.reportID && report?.reportID) {
                    reportIDParam = generateReportID();
                }
                setMoneyRequestParticipants(
                    initialTransactionID,
                    [
                        {
                            ...managerMcTestParticipant,
                            reportID: reportIDParam,
                            selected: true,
                        },
                    ],
                    true,
                ).then(() => {
                    navigateToConfirmationPage(true, reportIDParam);
                });
                return;
            }

            // If a reportID exists in the report object, it's because either:
            // - The user started this flow from using the + button in the composer inside a report.
            // - The user started this flow from using the global create menu by selecting the Track expense option.
            // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
            // to the confirm step.
            // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
            if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
                const selectedParticipants = getMoneyRequestParticipantsFromReport(report);
                const participants = selectedParticipants.map((participant) => {
                    const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant);
                });

                if (shouldSkipConfirmation) {
                    const firstReceiptFile = files.at(0);
                    if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
                        const splitReceipt: Receipt = firstReceiptFile.file ?? {};
                        splitReceipt.source = firstReceiptFile.source;
                        splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
                        startSplitBill({
                            participants,
                            currentUserLogin: currentUserPersonalDetails?.login ?? '',
                            currentUserAccountID: currentUserPersonalDetails.accountID,
                            comment: '',
                            receipt: splitReceipt,
                            existingSplitChatReportID: reportID,
                            billable: false,
                            category: '',
                            tag: '',
                            currency: initialTransaction?.currency ?? 'USD',
                            taxCode: transactionTaxCode,
                            taxAmount: transactionTaxAmount,
                        });
                        return;
                    }
                    const participant = participants.at(0);
                    if (!participant) {
                        return;
                    }
                    if (locationPermissionGranted) {
                        getCurrentPosition(
                            (successData) => {
                                const policyParams = {policy};
                                const gpsPoints = {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                };
                                createTransaction(files, participant, gpsPoints, policyParams, false);
                            },
                            (errorData) => {
                                Log.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                                // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                                createTransaction(files, participant);
                            },
                            {
                                maximumAge: CONST.GPS.MAX_AGE,
                                timeout: CONST.GPS.TIMEOUT,
                            },
                        );
                        return;
                    }
                    createTransaction(files, participant);
                    return;
                }
                const transactionIDs = files.map((receiptFile) => receiptFile.transactionID);
                setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report).then(() => navigateToConfirmationPage());
                return;
            }

            // If there was no reportID, then that means the user started this flow from the global + menu
            // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
            if (iouType === CONST.IOU.TYPE.CREATE && isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
                const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);

                // If the initial transaction has different participants selected that means that the user has changed the participant in the confirmation step
                if (initialTransaction?.participants && initialTransaction?.participants?.at(0)?.reportID !== activePolicyExpenseChat?.reportID) {
                    const isTrackExpense = initialTransaction?.participants?.at(0)?.reportID === selfDMReportID;

                    const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipants(receiptFile.transactionID, initialTransaction?.participants));
                    Promise.all(setParticipantsPromises).then(() => {
                        if (isTrackExpense) {
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, initialTransactionID, selfDMReportID));
                        } else {
                            navigateToConfirmationPage(iouType === CONST.IOU.TYPE.CREATE, initialTransaction?.reportID);
                        }
                    });
                    return;
                }

                const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat));
                Promise.all(setParticipantsPromises).then(() =>
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                            CONST.IOU.ACTION.CREATE,
                            iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                            initialTransactionID,
                            activePolicyExpenseChat?.reportID,
                        ),
                    ),
                );
            } else {
                navigateToParticipantPage(iouType, initialTransactionID, reportID);
            }
        },
        [
            backTo,
            report,
            reportNameValuePairs,
            iouType,
            initialTransaction?.participants,
            initialTransaction?.currency,
            initialTransaction?.reportID,
            activePolicy,
            initialTransactionID,
            navigateToConfirmationPage,
            shouldSkipConfirmation,
            personalDetails,
            createTransaction,
            currentUserPersonalDetails?.login,
            currentUserPersonalDetails.accountID,
            reportID,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
            selfDMReportID,
        ],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source});
            navigateBack();
        },
        [initialTransactionID, navigateBack],
    );

    const setReceiptFilesAndNavigate = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }
        // Store the receipt on the transaction object in Onyx
        const newReceiptFiles: ReceiptFile[] = [];

        if (isEditing) {
            const file = files.at(0);
            if (!file) {
                return;
            }
            const source = URL.createObjectURL(file as Blob);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            setMoneyRequestReceipt(initialTransactionID, source, file.name || '', !isEditing);
            updateScanAndNavigate(file, source);
            return;
        }

        files.forEach((file, index) => {
            const source = URL.createObjectURL(file as Blob);
            const transaction =
                !shouldAcceptMultipleFiles || (index === 0 && transactions.length === 1 && !initialTransaction?.receipt?.source)
                    ? (initialTransaction as Partial<Transaction>)
                    : buildOptimisticTransactionAndCreateDraft({
                          initialTransaction: initialTransaction as Partial<Transaction>,
                          currentUserPersonalDetails,
                          reportID,
                      });

            const transactionID = transaction.transactionID ?? initialTransactionID;
            newReceiptFiles.push({file, source, transactionID});
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            setMoneyRequestReceipt(transactionID, source, file.name || '', true);
        });

        if (shouldSkipConfirmation) {
            setReceiptFiles(newReceiptFiles);
            const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && files.length;
            if (gpsRequired) {
                const beginLocationPermissionFlow = shouldStartLocationPermissionFlow();

                if (beginLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
            }
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(setReceiptFilesAndNavigate);

    const handleDropReceipt = (e: DragEvent) => {
        const files = Array.from(e?.dataTransfer?.files ?? []);
        if (files.length === 0) {
            return;
        }
        files.forEach((file) => {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        });

        validateFiles(files);
    };

    /**
     * Sets a test receipt from CONST.TEST_RECEIPT_URL and navigates to the confirmation step
     */
    const setTestReceiptAndNavigate = useCallback(() => {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            navigateToConfirmationStep([{file, source, transactionID: initialTransactionID}], false, true);
        });
    }, [initialTransactionID, isEditing, navigateToConfirmationStep]);

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const submitReceipts = useCallback(
        (files: ReceiptFile[]) => {
            if (shouldSkipConfirmation) {
                const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
                if (gpsRequired) {
                    const beginLocationPermissionFlow = shouldStartLocationPermissionFlow();
                    if (beginLocationPermissionFlow) {
                        setStartLocationPermissionFlow(true);
                        return;
                    }
                }
            }
            navigateToConfirmationStep(files, false);
        },
        [initialTransaction, iouType, navigateToConfirmationStep, shouldSkipConfirmation],
    );

    const getScreenshot = useCallback(() => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        const imageBase64 = cameraRef.current.getScreenshot();

        if (imageBase64 === null) {
            return;
        }

        if (isMultiScanEnabled) {
            showBlink();
        }

        const filename = `receipt_${Date.now()}.png`;
        const file = base64ToFile(imageBase64 ?? '', filename);
        const source = URL.createObjectURL(file);
        const transaction =
            isMultiScanEnabled && initialTransaction?.receipt?.source
                ? buildOptimisticTransactionAndCreateDraft({
                      initialTransaction,
                      currentUserPersonalDetails,
                      reportID,
                  })
                : initialTransaction;
        const transactionID = transaction?.transactionID ?? initialTransactionID;
        const newReceiptFiles = [...receiptFiles, {file, source, transactionID}];

        setMoneyRequestReceipt(transactionID, source, file.name, !isEditing);
        setReceiptFiles(newReceiptFiles);

        if (isMultiScanEnabled) {
            return;
        }

        if (isEditing) {
            updateScanAndNavigate(file, source);
            return;
        }

        submitReceipts(newReceiptFiles);
    }, [
        isMultiScanEnabled,
        initialTransaction,
        currentUserPersonalDetails,
        reportID,
        initialTransactionID,
        receiptFiles,
        isEditing,
        submitReceipts,
        requestCameraPermission,
        showBlink,
        updateScanAndNavigate,
    ]);

    const toggleMultiScan = () => {
        if (!dismissedProductTraining?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            setShouldShowMultiScanEducationalPopup(true);
        }
        if (isMultiScanEnabled) {
            removeDraftTransactions(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        setIsMultiScanEnabled?.(!isMultiScanEnabled);
    };

    const clearTorchConstraints = useCallback(() => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            advanced: [{torch: false}],
        });
    }, []);

    const capturePhoto = useCallback(() => {
        if (trackRef.current && isFlashLightOn) {
            trackRef.current
                .applyConstraints({
                    advanced: [{torch: true}],
                })
                .then(() => {
                    getScreenshotTimeoutRef.current = setTimeout(() => {
                        getScreenshot();
                        clearTorchConstraints();
                    }, 2000);
                });
            return;
        }

        getScreenshot();
    }, [isFlashLightOn, getScreenshot, clearTorchConstraints]);

    const panResponder = useRef(
        PanResponder.create({
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    useEffect(
        () => () => {
            if (!getScreenshotTimeoutRef.current) {
                return;
            }
            clearTimeout(getScreenshotTimeoutRef.current);
        },
        [],
    );

    const dismissMultiScanEducationalPopup = () => {
        InteractionManager.runAfterInteractions(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    };

    const mobileCameraView = () => (
        <>
            <View style={[styles.cameraView]}>
                {PDFValidationComponent}
                {((cameraPermissionState === 'prompt' && !isQueriedPermissionState) || (cameraPermissionState === 'granted' && isEmptyObject(videoConstraints))) && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.textSupporting}
                    />
                )}
                {cameraPermissionState !== 'granted' && isQueriedPermissionState && (
                    <View style={[styles.flex1, styles.permissionView, styles.userSelectNone]}>
                        <Icon
                            src={Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            additionalStyles={[styles.pb5]}
                        />
                        <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                        {cameraPermissionState === 'denied' ? (
                            <Text style={[styles.subTextFileUpload]}>
                                {translate('receipt.deniedCameraAccess')}
                                <TextLink href={CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}>{translate('receipt.deniedCameraAccessInstructions')}</TextLink>.
                            </Text>
                        ) : (
                            <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                        )}
                        <Button
                            success
                            text={translate('common.continue')}
                            accessibilityLabel={translate('common.continue')}
                            style={[styles.p9, styles.pt5]}
                            onPress={capturePhoto}
                        />
                    </View>
                )}
                {cameraPermissionState === 'granted' && !isEmptyObject(videoConstraints) && (
                    <View style={styles.flex1}>
                        <NavigationAwareCamera
                            onUserMedia={setupCameraPermissionsAndCapabilities}
                            onUserMediaError={() => setCameraPermissionState('denied')}
                            style={{
                                ...styles.videoContainer,
                                display: cameraPermissionState !== 'granted' ? 'none' : 'block',
                            }}
                            ref={cameraRef}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            forceScreenshotSourceSize
                            audio={false}
                            disablePictureInPicture={false}
                            imageSmoothing={false}
                            mirrored={false}
                            screenshotQuality={0}
                        />
                        {canUseMultiScan && isMobile() ? (
                            <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, isFlashLightOn && styles.bgGreenSuccess, !isTorchAvailable && styles.opacity0]}>
                                <PressableWithFeedback
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={translate('receipt.flash')}
                                    disabled={!isTorchAvailable}
                                    onPress={toggleFlashlight}
                                >
                                    <Icon
                                        height={16}
                                        width={16}
                                        src={Expensicons.Bolt}
                                        fill={isFlashLightOn ? theme.white : theme.icon}
                                    />
                                </PressableWithFeedback>
                            </View>
                        ) : null}
                        <Animated.View
                            pointerEvents="none"
                            style={[StyleSheet.absoluteFillObject, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                        />
                    </View>
                )}
            </View>

            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker
                    acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}
                    allowMultiple={shouldAcceptMultipleFiles}
                >
                    {({openPicker}) => (
                        <PressableWithFeedback
                            accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                            role={CONST.ROLE.BUTTON}
                            style={isMultiScanEnabled && styles.opacity0}
                            onPress={() => {
                                openPicker({
                                    onPicked: (data) => validateFiles(data),
                                });
                            }}
                        >
                            <Icon
                                height={32}
                                width={32}
                                src={Expensicons.Gallery}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </AttachmentPicker>
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    style={[styles.alignItemsCenter]}
                    onPress={capturePhoto}
                >
                    <Shutter
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                {canUseMultiScan && isMobile() ? (
                    <PressableWithFeedback
                        accessibilityRole="button"
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.multiScan')}
                        style={styles.alignItemsEnd}
                        onPress={toggleMultiScan}
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={Expensicons.ReceiptMultiple}
                            fill={isMultiScanEnabled ? theme.iconMenu : theme.textSupporting}
                        />
                    </PressableWithFeedback>
                ) : (
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsEnd, !isTorchAvailable && styles.opacity0]}
                        onPress={toggleFlashlight}
                        disabled={!isTorchAvailable}
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={isFlashLightOn ? Expensicons.Bolt : Expensicons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                )}
            </View>
            {canUseMultiScan && isMobile() && shouldShowMultiScanEducationalPopup && (
                <FeatureTrainingModal
                    title={translate('iou.scanMultipleReceipts')}
                    image={MultiScan}
                    shouldRenderSVG
                    imageHeight="auto"
                    imageWidth="auto"
                    modalInnerContainerStyle={styles.pt0}
                    illustrationOuterContainerStyle={styles.multiScanEducationalPopupImage}
                    onConfirm={dismissMultiScanEducationalPopup}
                    titleStyles={styles.mb2}
                    confirmText={translate('common.buttonConfirm')}
                    description={translate('iou.scanMultipleReceiptsDescription')}
                    contentInnerContainerStyles={styles.mb6}
                    shouldGoBack={false}
                />
            )}

            {canUseMultiScan && (
                <ReceiptPreviews
                    isMultiScanEnabled={isMultiScanEnabled}
                    submit={submitReceipts}
                />
            )}
        </>
    );

    const desktopUploadView = () => (
        <>
            {PDFValidationComponent}
            <View onLayout={({nativeEvent}) => setReceiptImageTopPosition(PixelRatio.roundToNearestPixel((nativeEvent.layout as DOMRect).top))}>
                <ReceiptUpload
                    width={CONST.RECEIPT.ICON_SIZE}
                    height={CONST.RECEIPT.ICON_SIZE}
                />
            </View>

            <View
                style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...panResponder.panHandlers}
            >
                <Text style={[styles.textFileUpload]}>{translate(shouldAcceptMultipleFiles ? 'receipt.uploadMultiple' : 'receipt.upload')}</Text>
                <Text style={[styles.subTextFileUpload]}>
                    {isSmallScreenWidth
                        ? translate(shouldAcceptMultipleFiles ? 'receipt.chooseReceipts' : 'receipt.chooseReceipt')
                        : translate(shouldAcceptMultipleFiles ? 'receipt.dragReceiptsBeforeEmail' : 'receipt.dragReceiptBeforeEmail')}
                    <CopyTextToClipboard
                        text={CONST.EMAIL.RECEIPTS}
                        textStyles={[styles.textBlue]}
                    />
                    {isSmallScreenWidth ? null : translate(shouldAcceptMultipleFiles ? 'receipt.dragReceiptsAfterEmail' : 'receipt.dragReceiptAfterEmail')}
                </Text>
            </View>

            <AttachmentPicker allowMultiple={shouldAcceptMultipleFiles}>
                {({openPicker}) => (
                    <Button
                        success
                        text={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                        accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                        style={[styles.p9]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => validateFiles(data),
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </>
    );

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID={IOURequestStepScan.displayName}
        >
            {(isDraggingOverWrapper) => (
                <View
                    onLayout={() => {
                        if (!onLayout) {
                            return;
                        }
                        onLayout(setTestReceiptAndNavigate);
                    }}
                    style={[styles.flex1, !isMobile() && styles.uploadFileView(isSmallScreenWidth)]}
                >
                    <View style={[styles.flex1, !isMobile() && styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!(isDraggingOver ?? isDraggingOverWrapper) && (isMobile() ? mobileCameraView() : desktopUploadView())}
                    </View>
                    {/* TODO: remove beta check after the feature is enabled */}
                    {canUseMultiDragAndDrop ? (
                        <DragAndDropConsumer onDrop={handleDropReceipt}>
                            <DropZoneUI
                                icon={isReplacingReceipt ? Expensicons.ReplaceReceipt : Expensicons.SmartScan}
                                dropStyles={styles.receiptDropOverlay(true)}
                                dropTitle={
                                    isReplacingReceipt ? translate('dropzone.replaceReceipt') : translate(shouldAcceptMultipleFiles ? 'dropzone.scanReceipts' : 'quickAction.scanReceipt')
                                }
                                dropTextStyles={styles.receiptDropText}
                                dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)}
                            />
                        </DragAndDropConsumer>
                    ) : (
                        <ReceiptDropUI
                            onDrop={(e) => {
                                const file = e?.dataTransfer?.files[0];
                                if (file) {
                                    file.uri = URL.createObjectURL(file);
                                    validateFiles([file]);
                                }
                            }}
                            receiptImageTopPosition={receiptImageTopPosition}
                        />
                    )}
                    {/*  We use isMobile() here to explicitly hide DownloadAppBanner component on both mobile web and native apps */}
                    {!isMobile() && <DownloadAppBanner />}
                    {ErrorModal}
                    {startLocationPermissionFlow && !!receiptFiles.length && (
                        <LocationPermissionModal
                            startPermissionFlow={startLocationPermissionFlow}
                            resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                            onGrant={() => navigateToConfirmationStep(receiptFiles, true)}
                            onDeny={() => {
                                updateLastLocationPermissionPrompt();
                                navigateToConfirmationStep(receiptFiles, false);
                            }}
                        />
                    )}
                </View>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

IOURequestStepScan.displayName = 'IOURequestStepScan';

const IOURequestStepScanWithOnyx = IOURequestStepScan;

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScanWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
