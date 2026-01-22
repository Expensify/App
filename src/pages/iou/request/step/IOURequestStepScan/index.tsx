import {useIsFocused} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {LayoutRectangle} from 'react-native';
import {InteractionManager, PanResponder, StyleSheet, View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type Webcam from 'react-webcam';
import TestReceipt from '@assets/images/fake-receipt.png';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import {DragAndDropContext} from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import Icon from '@components/Icon';
import LocationPermissionModal from '@components/LocationPermissionModal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReceiptAlternativeMethods from '@components/ReceiptAlternativeMethods';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFilesValidation from '@hooks/useFilesValidation';
import useIOUUtils from '@hooks/useIOUUtils';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleMoneyRequestStepScanParticipants} from '@libs/actions/IOU/MoneyRequest';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {isMobile, isMobileWebKit} from '@libs/Browser';
import {base64ToFile, isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {getDefaultTaxCode, hasReceipt, shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {checkIfScanFileCanBeRead, replaceReceipt, setMoneyRequestReceipt, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {cropImageToAspectRatio} from './cropImageToAspectRatio';
import type {ImageObject} from './cropImageToAspectRatio';
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
    isStartingScan = false,
    setIsMultiScanEnabled,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);
    // we need to use isSmallScreenWidth instead of shouldUseNarrowLayout because drag and drop is not supported on mobile
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isDraggingOver} = useContext(DragAndDropContext);
    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>('prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(false);
    const [shouldShowMultiScanEducationalPopup, setShouldShowMultiScanEducationalPopup] = useState(false);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});

    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const isArchived = isArchivedReport(reportNameValuePairs);
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan', 'Hand', 'ReceiptUpload', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash', 'ReplaceReceipt', 'SmartScan']);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);
    const {shouldStartLocationPermissionFlow} = useIOUUtils();
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftValuesSelector,
        canBeMissing: true,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});

    const transactions = useMemo(() => {
        const allTransactions = optimisticTransactions && optimisticTransactions.length > 1 ? optimisticTransactions : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, optimisticTransactions]);

    const [videoConstraints, setVideoConstraints] = useState<MediaTrackConstraints>();
    const isTabActive = useIsFocused();

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    const shouldAcceptMultipleFiles = !isEditing && !backTo;

    const selfDMReport = useSelfDMReport();

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

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

        return !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy?.requiresCategory, policy?.requiresTag, isArchived]);

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
                for (const track of stream.getTracks()) {
                    track.stop();
                }
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
                    return Promise.resolve();
                }

                const onFailure = () => {
                    isAllScanFilesCanBeRead = false;
                };

                return checkIfScanFileCanBeRead(item.receipt?.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTabActive]);

    // this effect will pre-fetch location in web if the location permission is already granted to optimize the flow
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

    const navigateToConfirmationStep = useCallback(
        (files: ReceiptFile[], locationPermissionGranted = false, isTestTransaction = false) => {
            handleMoneyRequestStepScanParticipants({
                iouType,
                policy,
                report,
                reportID,
                reportAttributesDerived,
                transactions,
                initialTransaction: {
                    transactionID: initialTransactionID,
                    reportID: initialTransaction?.reportID,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    currency: initialTransaction?.currency,
                    isFromGlobalCreate: initialTransaction?.isFromGlobalCreate,
                    participants: initialTransaction?.participants,
                },
                personalDetails,
                currentUserLogin: currentUserPersonalDetails.login,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                backTo,
                backToReport,
                shouldSkipConfirmation,
                defaultExpensePolicy,
                shouldGenerateTransactionThreadReport,
                isArchivedExpenseReport: isArchived,
                isAutoReporting: !!personalPolicy?.autoReporting,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies,
                introSelected,
                activePolicyID,
                privateIsArchived: reportNameValuePairs?.private_isArchived,
                files,
                isTestTransaction,
                locationPermissionGranted,
                allBetas,
                selfDMReport,
            });
        },
        [
            backTo,
            backToReport,
            shouldGenerateTransactionThreadReport,
            transactions,
            initialTransaction?.isFromGlobalCreate,
            initialTransaction?.currency,
            initialTransaction?.participants,
            initialTransaction?.reportID,
            isArchived,
            iouType,
            defaultExpensePolicy,
            report,
            initialTransactionID,
            currentUserPersonalDetails.accountID,
            currentUserPersonalDetails?.login,
            shouldSkipConfirmation,
            personalDetails,
            reportAttributesDerived,
            reportID,
            transactionTaxCode,
            transactionTaxAmount,
            quickAction,
            policyRecentlyUsedCurrencies,
            policy,
            personalPolicy?.autoReporting,
            selfDMReport,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            introSelected,
            activePolicyID,
            allBetas,
        ],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
            navigateBack();
        },
        [initialTransactionID, navigateBack, policy, policyCategories],
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
            setMoneyRequestReceipt(initialTransactionID, source, file.name ?? '', !isEditing, file.type);
            updateScanAndNavigate(file, source);
            return;
        }

        if (!isMultiScanEnabled) {
            removeDraftTransactions(true);
        }

        for (const [index, file] of files.entries()) {
            const source = URL.createObjectURL(file as Blob);
            const transaction = shouldReuseInitialTransaction(initialTransaction, shouldAcceptMultipleFiles, index, isMultiScanEnabled, transactions)
                ? (initialTransaction as Partial<Transaction>)
                : buildOptimisticTransactionAndCreateDraft({
                      initialTransaction: initialTransaction as Partial<Transaction>,
                      currentUserPersonalDetails,
                      reportID,
                  });

            const transactionID = transaction.transactionID ?? initialTransactionID;
            newReceiptFiles.push({file, source, transactionID});
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
        }

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
        for (const file of files) {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        }

        validateFiles(files, Array.from(e.dataTransfer?.items ?? []));
    };

    /**
     * Sets a test receipt from CONST.TEST_RECEIPT_URL and navigates to the confirmation step
     */
    const setTestReceiptAndNavigate = useCallback(() => {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            removeDraftTransactions(true);
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
        [initialTransaction?.amount, iouType, shouldStartLocationPermissionFlow, navigateToConfirmationStep, shouldSkipConfirmation],
    );

    const viewfinderLayout = useRef<LayoutRectangle>(null);

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

        const originalFileName = `receipt_${Date.now()}.png`;
        const originalFile = base64ToFile(imageBase64 ?? '', originalFileName);
        const imageObject: ImageObject = {file: originalFile, filename: originalFile.name, source: URL.createObjectURL(originalFile)};
        // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
        // while other browsers let the video element overflow and the container crops it from the top.
        // We crop and algin the result image the same way.
        const videoHeight = cameraRef.current.video?.getBoundingClientRect?.()?.height ?? NaN;
        const viewFinderHeight = viewfinderLayout.current?.height ?? NaN;
        const shouldAlignTop = videoHeight > viewFinderHeight;
        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, shouldAlignTop).then(({file, filename, source}) => {
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

            setMoneyRequestReceipt(transactionID, source, filename, !isEditing, file.type);
            setReceiptFiles(newReceiptFiles);

            if (isMultiScanEnabled) {
                return;
            }

            if (isEditing) {
                updateScanAndNavigate(file, source);
                return;
            }

            submitReceipts(newReceiptFiles);
        });
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
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactions(true);
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    };

    const submitMultiScanReceipts = () => {
        const transactionIDs = new Set(optimisticTransactions?.map((transaction) => transaction?.transactionID));
        const validReceiptFiles = receiptFiles.filter((receiptFile) => transactionIDs.has(receiptFile.transactionID));
        submitReceipts(validReceiptFiles);
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
                            src={lazyIllustrations.Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            additionalStyles={[styles.pb5]}
                        />
                        <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                        {cameraPermissionState === 'denied' ? (
                            <Text style={[styles.subTextFileUpload]}>
                                <RenderHTML html={translate('receipt.deniedCameraAccess')} />
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
                    <View
                        style={styles.flex1}
                        onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                    >
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
                                        src={lazyIcons.Bolt}
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
                                src={lazyIcons.Gallery}
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
                    <Icon
                        src={lazyIllustrations.Shutter}
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
                            src={lazyIcons.ReceiptMultiple}
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
                            src={isFlashLightOn ? lazyIcons.Bolt : lazyIcons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                )}
            </View>
            {canUseMultiScan && isMobile() && shouldShowMultiScanEducationalPopup && (
                <FeatureTrainingModal
                    title={translate('iou.scanMultipleReceipts')}
                    image={lazyIllustrations.MultiScan}
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
                    submit={submitMultiScanReceipts}
                />
            )}
        </>
    );

    const [containerHeight, setContainerHeight] = useState(0);
    const [desktopUploadViewHeight, setDesktopUploadViewHeight] = useState(0);
    const [alternativeMethodsHeight, setAlternativeMethodsHeight] = useState(0);
    // We use isMobile() here to explicitly hide the alternative methods component on both mobile web and native apps
    const chooseFilesPaddingVertical = Number(styles.chooseFilesView(isSmallScreenWidth).paddingVertical);
    const shouldHideAlternativeMethods = isMobile() || alternativeMethodsHeight + desktopUploadViewHeight + chooseFilesPaddingVertical * 2 > containerHeight;

    const desktopUploadView = () => (
        <View
            style={[styles.alignItemsCenter, styles.justifyContentCenter]}
            onLayout={(e) => {
                setDesktopUploadViewHeight(e.nativeEvent.layout.height);
            }}
        >
            {PDFValidationComponent}
            <Icon
                src={lazyIllustrations.ReceiptUpload}
                width={CONST.RECEIPT.ICON_SIZE}
                height={CONST.RECEIPT.ICON_SIZE}
            />
            <View
                style={[styles.uploadFileViewTextContainer, styles.userSelectNone]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...panResponder.panHandlers}
            >
                <Text style={[styles.textFileUpload, styles.mb2]}>{translate(shouldAcceptMultipleFiles ? 'receipt.uploadMultiple' : 'receipt.upload')}</Text>
                <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lineHeightLarge]}>
                    {translate(shouldAcceptMultipleFiles ? 'receipt.desktopSubtitleMultiple' : 'receipt.desktopSubtitleSingle')}
                </Text>
            </View>

            <AttachmentPicker allowMultiple={shouldAcceptMultipleFiles}>
                {({openPicker}) => (
                    <Button
                        success
                        text={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                        accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                        style={[styles.p5]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => validateFiles(data),
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
        </View>
    );

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID="IOURequestStepScan"
        >
            {(isDraggingOverWrapper) => (
                <View
                    onLayout={(event) => {
                        setContainerHeight(event.nativeEvent.layout.height);
                        if (!onLayout) {
                            return;
                        }
                        onLayout(setTestReceiptAndNavigate);
                    }}
                    style={[styles.flex1, !isMobile() && styles.chooseFilesView(isSmallScreenWidth)]}
                >
                    <View style={[styles.flex1, !isMobile() && styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!(isDraggingOver ?? isDraggingOverWrapper) && (isMobile() ? mobileCameraView() : desktopUploadView())}
                    </View>
                    <DragAndDropConsumer onDrop={handleDropReceipt}>
                        <DropZoneUI
                            icon={isReplacingReceipt ? lazyIcons.ReplaceReceipt : lazyIcons.SmartScan}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={isReplacingReceipt ? translate('dropzone.replaceReceipt') : translate(shouldAcceptMultipleFiles ? 'dropzone.scanReceipts' : 'quickAction.scanReceipt')}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {!shouldHideAlternativeMethods && <ReceiptAlternativeMethods onLayout={(e) => setAlternativeMethodsHeight(e.nativeEvent.layout.height)} />}
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

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
