import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, PanResponder, PixelRatio, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import type Webcam from 'react-webcam';
import TestReceipt from '@assets/images/fake-receipt.png';
import Hand from '@assets/images/hand.svg';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import Shutter from '@assets/images/shutter.svg';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import DownloadAppBanner from '@components/DownloadAppBanner';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZoneUI';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import LocationPermissionModal from '@components/LocationPermissionModal';
import PDFThumbnail from '@components/PDFThumbnail';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {isMobile, isMobileWebKit} from '@libs/Browser';
import {base64ToFile, resizeImageIfNeeded, validateReceipt} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import getCurrentPosition from '@libs/getCurrentPosition';
import getPlatform from '@libs/getPlatform';
import {navigateToParticipantPage, shouldStartLocationPermissionFlow} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getIsUserSubmittedExpenseOrScannedReceipt, getManagerMcTestParticipant, getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy, isUserInvitedToWorkspace} from '@libs/PolicyUtils';
import {generateReportID, getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getDefaultTaxCode} from '@libs/TransactionUtils';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import variables from '@styles/variables';
import type {GpsPoint} from '@userActions/IOU';
import {
    getMoneyRequestParticipantsFromReport,
    replaceReceipt,
    requestMoney,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReceipt,
    startSplitBill,
    trackExpense,
    updateLastLocationPermissionPrompt,
} from '@userActions/IOU';
import {generateTransactionID} from '@userActions/Transaction';
import {createDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getLocationPermission} from './LocationPermission';
import NavigationAwareCamera from './NavigationAwareCamera/WebCamera';
import type IOURequestStepScanProps from './types';
import type {ReceiptFile} from './types';

const SMALL_SCREEN_TOOLTIP_OFFSET = 10;
const DEFAULT_TOOLTIP_OFFSET = 8;

function IOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
    },
    transaction: initialTransaction,
    currentUserPersonalDetails,
    isTooltipAllowed = false,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const theme = useTheme();
    const styles = useThemeStyles();

    // Grouping related states
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths>();
    const [attachmentInvalidReason, setAttachmentValidReason] = useState<TranslationPaths>();
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
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
    const [elementTop, setElementTop] = useState(0);

    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

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

    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    const {isBetaEnabled} = usePermissions();

    const platform = getPlatform(true);

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

    const hideReceiptModal = () => {
        setIsAttachmentInvalid(false);
    };

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
        setPdfFile(null);
    };

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const navigateToConfirmationPage = useCallback(
        (isTestTransaction = false, reportIDParam: string | undefined = undefined) => {
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
                            isTestTransaction ? CONST.IOU.TYPE.SUBMIT : iouType,
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

    const buildOptimisticTransaction = useCallback((): Transaction => {
        const newTransactionID = generateTransactionID();
        const {comment, currency, category, iouRequestType, isFromGlobalCreate, splitPayerAccountIDs} = initialTransaction ?? {};
        const newTransaction = {
            amount: 0,
            comment,
            created: format(new Date(), 'yyyy-MM-dd'),
            currency,
            category,
            iouRequestType,
            reportID,
            transactionID: newTransactionID,
            isFromGlobalCreate,
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            splitPayerAccountIDs,
        } as Transaction;
        createDraftTransaction(newTransaction);
        return newTransaction;
    }, [initialTransaction, reportID]);

    const createTransaction = useCallback(
        (files: ReceiptFile[], participant: Participant, gpsPoints?: GpsPoint, policyParams?: {policy: OnyxEntry<Policy>}, billable?: boolean) => {
            files.forEach((receiptFile: ReceiptFile, index) => {
                const transaction = transactions.find((item) => item.transactionID === receiptFile.transactionID);
                const receipt: Receipt = receiptFile.file;
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
                        const splitReceipt: Receipt = firstReceiptFile.file;
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

                const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipantsFromReport(receiptFile.transactionID, report));
                Promise.all(setParticipantsPromises).then(() => navigateToConfirmationPage());
                return;
            }

            // If there was no reportID, then that means the user started this flow from the global + menu
            // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
            if (iouType === CONST.IOU.TYPE.CREATE && isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
                const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);
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
            activePolicy,
            initialTransactionID,
            navigateToConfirmationPage,
            shouldSkipConfirmation,
            personalDetails,
            createTransaction,
            currentUserPersonalDetails?.login,
            currentUserPersonalDetails.accountID,
            reportID,
            initialTransaction?.currency,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
        ],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source});
            navigateBack();
        },
        [initialTransactionID, navigateBack],
    );

    /**
     * Converts HEIC image to JPEG using promises
     */
    const convertHeicImageToJpegPromise = (file: FileObject): Promise<FileObject> => {
        return new Promise((resolve, reject) => {
            convertHeicImage(file, {
                onStart: () => setIsLoadingReceipt(true),
                onSuccess: (convertedFile) => resolve(convertedFile),
                onError: (nonConvertedFile) => {
                    reject(nonConvertedFile);
                },
                onFinish: () => setIsLoadingReceipt(false),
            });
        });
    };

    /**
     * Sets the Receipt objects and navigates the user to the next page
     */
    const setReceiptAndNavigate = (originalFile: FileObject, isPdfValidated?: boolean) => {
        validateReceipt(originalFile, setUploadReceiptError).then((isFileValid) => {
            if (!isFileValid) {
                return;
            }

            // If we have a pdf file and if it is not validated then set the pdf file for validation and return
            if (Str.isPDF(originalFile.name ?? '') && !isPdfValidated) {
                setPdfFile(originalFile);
                return;
            }

            // Helper function to process the file after any conversion
            const processFile = (file: FileObject) => {
                // With the image size > 24MB, we use manipulateAsync to resize the image.
                // It takes a long time so we should display a loading indicator while the resize image progresses.
                if (Str.isImage(file.name ?? '') && (file?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                    setIsLoadingReceipt(true);
                }
                resizeImageIfNeeded(file).then((resizedFile) => {
                    setIsLoadingReceipt(false);
                    // Store the receipt on the transaction object in Onyx
                    const source = URL.createObjectURL(resizedFile as Blob);
                    const newReceiptFiles = [{file: resizedFile, source, transactionID: initialTransactionID}];
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    setMoneyRequestReceipt(initialTransactionID, source, resizedFile.name || '', !isEditing);

                    if (isEditing) {
                        updateScanAndNavigate(resizedFile, source);
                        return;
                    }
                    if (shouldSkipConfirmation) {
                        setReceiptFiles(newReceiptFiles);
                        const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && resizedFile;
                        if (gpsRequired) {
                            const beginLocationPermissionFlow = shouldStartLocationPermissionFlow();

                            if (beginLocationPermissionFlow) {
                                setStartLocationPermissionFlow(true);
                                return;
                            }
                        }
                    }
                    navigateToConfirmationStep(newReceiptFiles, false);
                });
            };

            // Check if the file is HEIC/HEIF and needs conversion
            if (
                originalFile?.type?.startsWith('image') &&
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (originalFile.name?.toLowerCase().endsWith('.heic') || originalFile.name?.toLowerCase().endsWith('.heif'))
            ) {
                convertHeicImageToJpegPromise(originalFile)
                    .then((convertedFile) => {
                        processFile(convertedFile);
                    })
                    .catch((fallbackFile: FileObject) => {
                        // Use the original file if conversion fails
                        processFile(fallbackFile);
                    });
                return;
            }

            // Process the file directly if no conversion is needed
            processFile(originalFile);
        });
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

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP,
        isTooltipAllowed && !getIsUserSubmittedExpenseOrScannedReceipt() && isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) && isTabActive && !isUserInvitedToWorkspace(),
        {
            onConfirm: setTestReceiptAndNavigate,
            onDismiss: () => {
                dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, true);
            },
        },
    );

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const getScreenshot = useCallback(() => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        const imageBase64 = cameraRef.current.getScreenshot();

        if (imageBase64 === null) {
            return;
        }

        const filename = `receipt_${Date.now()}.png`;
        const file = base64ToFile(imageBase64 ?? '', filename);
        const source = URL.createObjectURL(file);
        const transaction = receiptFiles.length > 0 ? buildOptimisticTransaction() : initialTransaction;
        const transactionID = transaction?.transactionID ?? initialTransactionID;
        const newReceiptFiles = [...receiptFiles, {file, source, transactionID}];

        setMoneyRequestReceipt(transactionID, source, file.name, !isEditing);

        if (isEditing) {
            updateScanAndNavigate(file, source);
            return;
        }
        if (shouldSkipConfirmation) {
            setReceiptFiles(newReceiptFiles);
            const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && file;
            if (gpsRequired) {
                const beginLocationPermissionFlow = shouldStartLocationPermissionFlow();
                if (beginLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
            }
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    }, [
        receiptFiles,
        buildOptimisticTransaction,
        initialTransaction,
        initialTransactionID,
        isEditing,
        shouldSkipConfirmation,
        navigateToConfirmationStep,
        requestCameraPermission,
        updateScanAndNavigate,
        iouType,
    ]);

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

    const PDFThumbnailView = pdfFile ? (
        <PDFThumbnail
            style={styles.invisiblePDF}
            previewSourceURL={pdfFile.uri ?? ''}
            onLoadSuccess={() => {
                setPdfFile(null);
                setReceiptAndNavigate(pdfFile, true);
            }}
            onPassword={() => {
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.protectedPDFNotSupported');
            }}
            onLoadError={() => {
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment');
            }}
        />
    ) : null;

    const getConfirmModalPrompt = () => {
        if (!attachmentInvalidReason) {
            return '';
        }
        if (attachmentInvalidReason === 'attachmentPicker.sizeExceededWithLimit') {
            return translate(attachmentInvalidReason, {maxUploadSizeInMB: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE / (1024 * 1024)});
        }
        return translate(attachmentInvalidReason);
    };

    const mobileCameraView = () => (
        <>
            <View style={[styles.cameraView]}>
                {PDFThumbnailView}
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
                )}
            </View>

            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}>
                    {({openPicker}) => (
                        <PressableWithFeedback
                            accessibilityLabel={translate('common.chooseFile')}
                            role={CONST.ROLE.BUTTON}
                            onPress={() => {
                                openPicker({
                                    onPicked: (data) => setReceiptAndNavigate(data.at(0) ?? {}),
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
            </View>
        </>
    );

    const desktopUploadView = () => (
        <>
            {PDFThumbnailView}
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
                <Text style={[styles.textFileUpload]}>{translate('receipt.upload')}</Text>
                <Text style={[styles.subTextFileUpload]}>
                    {isSmallScreenWidth ? translate('receipt.chooseReceipt') : translate('receipt.dragReceiptBeforeEmail')}
                    <CopyTextToClipboard
                        text={CONST.EMAIL.RECEIPTS}
                        textStyles={[styles.textBlue]}
                    />
                    {isSmallScreenWidth ? null : translate('receipt.dragReceiptAfterEmail')}
                </Text>
            </View>

            <AttachmentPicker>
                {({openPicker}) => (
                    <Button
                        success
                        text={translate('common.chooseFile')}
                        accessibilityLabel={translate('common.chooseFile')}
                        style={[styles.p9]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => setReceiptAndNavigate(data.at(0) ?? {}),
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </>
    );

    const elementTopOffset = useMemo(() => {
        if (platform === CONST.PLATFORM.MOBILE_WEB) {
            return SMALL_SCREEN_TOOLTIP_OFFSET;
        }

        if (isSmallScreenWidth) {
            return -variables.tabSelectorButtonHeight + SMALL_SCREEN_TOOLTIP_OFFSET;
        }

        return -variables.tabSelectorButtonHeight + DEFAULT_TOOLTIP_OFFSET;
    }, [isSmallScreenWidth, platform]);

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID={IOURequestStepScan.displayName}
        >
            {(isDraggingOverWrapper) => (
                <>
                    {isLoadingReceipt && <FullScreenLoadingIndicator />}
                    <View
                        onLayout={(e) => setElementTop(e.nativeEvent.layout.height + elementTopOffset)}
                        style={[styles.flex1, !isMobile() && styles.uploadFileView(isSmallScreenWidth)]}
                    >
                        <EducationalTooltip
                            shouldRender={shouldShowProductTrainingTooltip}
                            renderTooltipContent={renderProductTrainingTooltip}
                            shouldHideOnNavigate
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                            wrapperStyle={styles.productTrainingTooltipWrapper}
                            shiftVertical={-elementTop}
                        >
                            <View style={[styles.flex1, !isMobile() && styles.alignItemsCenter, styles.justifyContentCenter]}>
                                {!(isDraggingOver ?? isDraggingOverWrapper) && (isMobile() ? mobileCameraView() : desktopUploadView())}
                            </View>
                        </EducationalTooltip>
                        {/* TODO: remove beta check after the feature is enabled */}
                        {isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? (
                            <DropZoneUI
                                onDrop={(e) => {
                                    const file = e?.dataTransfer?.files[0];
                                    if (file) {
                                        file.uri = URL.createObjectURL(file);
                                        setReceiptAndNavigate(file);
                                    }
                                }}
                                icon={isEditing ? Expensicons.ReplaceReceipt : Expensicons.SmartScan}
                                dropStyles={styles.receiptDropOverlay}
                                dropTitle={isEditing ? translate('dropzone.replaceReceipt') : translate('dropzone.scanReceipts')}
                                dropTextStyles={styles.receiptDropText}
                                dropInnerWrapperStyles={styles.receiptDropInnerWrapper}
                            />
                        ) : (
                            <ReceiptDropUI
                                onDrop={(e) => {
                                    const file = e?.dataTransfer?.files[0];
                                    if (file) {
                                        file.uri = URL.createObjectURL(file);
                                        setReceiptAndNavigate(file);
                                    }
                                }}
                                receiptImageTopPosition={receiptImageTopPosition}
                            />
                        )}
                        {/*  We use isMobile() here to explicitly hide DownloadAppBanner component on both mobile web and native apps */}
                        {!isMobile() && <DownloadAppBanner />}
                        <ConfirmModal
                            title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                            onConfirm={hideReceiptModal}
                            onCancel={hideReceiptModal}
                            isVisible={isAttachmentInvalid}
                            prompt={getConfirmModalPrompt()}
                            confirmText={translate('common.close')}
                            shouldShowCancelButton={false}
                        />
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
                </>
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
