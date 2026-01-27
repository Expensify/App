import {useFocusEffect} from '@react-navigation/core';
import reportsSelector from '@selectors/Attributes';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, AppState, InteractionManager, StyleSheet, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, PhotoFile, Point} from 'react-native-vision-camera';
import {useCameraDevice} from 'react-native-vision-camera';
import {scheduleOnRN} from 'react-native-worklets';
import TestReceipt from '@assets/images/fake-receipt.png';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import {useFullScreenLoaderActions, useFullScreenLoaderState} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import LocationPermissionModal from '@components/LocationPermissionModal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleMoneyRequestStepScanParticipants} from '@libs/actions/IOU/MoneyRequest';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import HapticFeedback from '@libs/HapticFeedback';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {getDefaultTaxCode, shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import {replaceReceipt, setMoneyRequestReceipt, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import CameraPermission from './CameraPermission';
import {cropImageToAspectRatio} from './cropImageToAspectRatio';
import type {ImageObject} from './cropImageToAspectRatio';
import NavigationAwareCamera from './NavigationAwareCamera/Camera';
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
}: IOURequestStepScanProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const {isLoaderVisible} = useFullScreenLoaderState();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const device = useCameraDevice('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const hasFlash = !!device?.hasFlash;
    const camera = useRef<Camera>(null);
    const [flash, setFlash] = useState(false);
    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);
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
    const lazyIllustrations = useMemoizedLazyIllustrations(['MultiScan', 'Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);
    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS, {canBeMissing: true});
    const isPlatformMuted = mutedPlatforms[platform];
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);
    const [shouldShowMultiScanEducationalPopup, setShouldShowMultiScanEducationalPopup] = useState(false);
    const {shouldStartLocationPermissionFlow} = useIOUUtils();
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true, selector: hasSeenTourSelector});

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftValuesSelector,
        canBeMissing: true,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const transactions = useMemo(() => {
        const allTransactions = optimisticTransactions && optimisticTransactions.length > 1 ? optimisticTransactions : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, optimisticTransactions]);

    const shouldAcceptMultipleFiles = !isEditing && !backTo;

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
        HapticFeedback.press();
    }, [blinkOpacity]);

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy?.requiresCategory, policy?.requiresTag, isArchived]);

    const {translate} = useLocalize();

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        CameraPermission.requestCameraPermission?.()
            .then((status: string) => {
                setCameraPermissionStatus(status);

                if (status === RESULTS.BLOCKED) {
                    showCameraPermissionsAlert(translate);
                }
            })
            .catch(() => {
                setCameraPermissionStatus(RESULTS.UNAVAILABLE);
            });
    };

    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(2);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const cameraFocusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: focusIndicatorOpacity.get(),
        transform: [{translateX: focusIndicatorPosition.get().x}, {translateY: focusIndicatorPosition.get().y}, {scale: focusIndicatorScale.get()}],
    }));

    const focusCamera = (point: Point) => {
        if (!camera.current) {
            return;
        }

        camera.current.focus(point).catch((error: Record<string, unknown>) => {
            if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log.warn('Error focusing camera', error);
        });
    };

    const tapGesture = Gesture.Tap()
        .enabled(device?.supportsFocus ?? false)
        .onStart((ev: {x: number; y: number}) => {
            const point = {x: ev.x, y: ev.y};

            focusIndicatorOpacity.set(withSequence(withTiming(0.8, {duration: 250}), withDelay(1000, withTiming(0, {duration: 250}))));
            focusIndicatorScale.set(2);
            focusIndicatorScale.set(withSpring(1, {damping: 10, stiffness: 200}));
            focusIndicatorPosition.set(point);

            scheduleOnRN(focusCamera, point);
        });

    useFocusEffect(
        useCallback(() => {
            setDidCapturePhoto(false);
            const refreshCameraPermissionStatus = () => {
                CameraPermission?.getCameraPermissionStatus?.()
                    .then(setCameraPermissionStatus)
                    .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
            };

            refreshCameraPermissionStatus();

            // Refresh permission status when app gain focus
            const subscription = AppState.addEventListener('change', (appState) => {
                if (appState !== 'active') {
                    return;
                }

                refreshCameraPermissionStatus();
            });

            return () => {
                subscription.remove();

                if (isLoaderVisible) {
                    setIsLoaderVisible(false);
                }
            };
        }, [isLoaderVisible, setIsLoaderVisible]),
    );

    useEffect(() => {
        if (isMultiScanEnabled) {
            return;
        }
        setReceiptFiles([]);
    }, [isMultiScanEnabled]);

    const navigateBack = () => {
        Navigation.goBack();
    };

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
                isSelfTourViewed,
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reportNameValuePairs?.private_isArchived is not needed
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
            policy,
            personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            isSelfTourViewed,
        ],
    );

    const updateScanAndNavigate = useCallback(
        (file: FileObject, source: string) => {
            // Fix for the issue where the navigation state is lost after returning from device settings https://github.com/Expensify/App/issues/65992
            const navigationState = navigationRef.current?.getState();
            const reportsSplitNavigator = navigationState?.routes?.findLast((route) => route.name === 'ReportsSplitNavigator');
            const hasLostNavigationsState = reportsSplitNavigator && !reportsSplitNavigator.state;
            if (hasLostNavigationsState) {
                if (backTo) {
                    Navigation.navigate(backTo as Route);
                } else {
                    Navigation.navigate(ROUTES.HOME);
                }
            } else {
                navigateBack();
            }
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
        },
        [initialTransactionID, policy, policyCategories, backTo],
    );

    /**
     * Sets a test receipt from CONST.TEST_RECEIPT_URL and navigates to the confirmation step
     */
    const setTestReceiptAndNavigate = useCallback(() => {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            if (!file?.uri) {
                return;
            }

            // Set file type as 'image/png' since the test receipt is a PNG file
            // prepareRequestPayload requires the file type to properly construct the FormData for API upload
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, 'image/png', true);
            removeDraftTransactions(true);
            navigateToConfirmationStep([{file, source: file.uri, transactionID: initialTransactionID}], false, true);
        });
    }, [initialTransactionID, isEditing, navigateToConfirmationStep]);

    const dismissMultiScanEducationalPopup = () => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    };

    /**
     * Sets the Receipt objects and navigates the user to the next page
     */
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
            setMoneyRequestReceipt(initialTransactionID, file.uri ?? '', file.name ?? '', !isEditing, file.type);
            updateScanAndNavigate(file, file.uri ?? '');
            return;
        }

        if (!isMultiScanEnabled) {
            removeDraftTransactions(true);
        }

        for (const [index, file] of files.entries()) {
            const transaction = shouldReuseInitialTransaction(initialTransaction, shouldAcceptMultipleFiles, index, isMultiScanEnabled, transactions)
                ? (initialTransaction as Partial<Transaction>)
                : buildOptimisticTransactionAndCreateDraft({
                      initialTransaction: initialTransaction as Partial<Transaction>,
                      currentUserPersonalDetails,
                      reportID,
                  });

            const transactionID = transaction.transactionID ?? initialTransactionID;
            newReceiptFiles.push({file, source: file.uri ?? '', transactionID});
            setMoneyRequestReceipt(transactionID, file.uri ?? '', file.name ?? '', true, file.type);
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
        [shouldSkipConfirmation, navigateToConfirmationStep, initialTransaction?.amount, iouType, shouldStartLocationPermissionFlow],
    );

    const submitMultiScanReceipts = () => {
        const transactionIDs = new Set(optimisticTransactions?.map((transaction) => transaction?.transactionID));
        const validReceiptFiles = receiptFiles.filter((receiptFile) => transactionIDs.has(receiptFile.transactionID));
        submitReceipts(validReceiptFiles);
    };

    const viewfinderLayout = useRef<LayoutRectangle>(null);

    const capturePhoto = useCallback(() => {
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
        }

        if (didCapturePhoto) {
            return;
        }

        if (isMultiScanEnabled) {
            showBlink();
        }

        setDidCapturePhoto(true);

        const path = getReceiptsUploadFolderPath();

        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }

                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the directory exists', error);
            })
            .then(() => {
                camera?.current
                    ?.takePhoto({
                        flash: flash && hasFlash ? 'on' : 'off',
                        enableShutterSound: !isPlatformMuted,
                        path,
                    })
                    .then((photo: PhotoFile) => {
                        // Store the receipt on the transaction object in Onyx
                        const transaction =
                            isMultiScanEnabled && initialTransaction?.receipt?.source
                                ? buildOptimisticTransactionAndCreateDraft({
                                      initialTransaction,
                                      currentUserPersonalDetails,
                                      reportID,
                                  })
                                : initialTransaction;
                        const transactionID = transaction?.transactionID ?? initialTransactionID;
                        const imageObject: ImageObject = {file: photo, filename: photo.path, source: getPhotoSource(photo.path)};
                        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, undefined, photo.orientation).then(
                            ({file, filename, source}) => {
                                // Add source property to file for prepareRequestPayload compatibility
                                const cameraFile = {
                                    ...file,
                                    source,
                                };

                                setMoneyRequestReceipt(transactionID, source, filename, !isEditing, file.type);

                                if (isEditing) {
                                    updateScanAndNavigate(cameraFile as FileObject, source);
                                    return;
                                }

                                const newReceiptFiles = [...receiptFiles, {file: cameraFile as FileObject, source, transactionID}];
                                setReceiptFiles(newReceiptFiles);

                                if (isMultiScanEnabled) {
                                    setDidCapturePhoto(false);
                                    return;
                                }

                                submitReceipts(newReceiptFiles);
                            },
                        );
                    })
                    .catch((error: string) => {
                        setDidCapturePhoto(false);
                        showCameraAlert();
                        Log.warn('Error taking photo', error);
                    });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- askForPermissions is not needed
    }, [
        cameraPermissionStatus,
        didCapturePhoto,
        isMultiScanEnabled,
        translate,
        showBlink,
        flash,
        hasFlash,
        isPlatformMuted,
        initialTransaction,
        currentUserPersonalDetails,
        reportID,
        initialTransactionID,
        isEditing,
        receiptFiles,
        submitReceipts,
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

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo || isEditing}
            testID="IOURequestStepScan"
        >
            <View
                style={styles.flex1}
                onLayout={() => {
                    if (!onLayout) {
                        return;
                    }
                    onLayout(setTestReceiptAndNavigate);
                }}
            >
                {PDFValidationComponent}
                <View style={[styles.flex1]}>
                    {cameraPermissionStatus !== RESULTS.GRANTED && (
                        <View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                            <ImageSVG
                                contentFit="contain"
                                src={lazyIllustrations.Hand}
                                width={CONST.RECEIPT.HAND_ICON_WIDTH}
                                height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                                style={styles.pb5}
                            />

                            <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                            <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                            <Button
                                success
                                text={translate('common.continue')}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={capturePhoto}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                        <View style={[styles.cameraView]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.textSupporting}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <View style={[styles.cameraView]}>
                            <GestureDetector gesture={tapGesture}>
                                <View style={styles.flex1}>
                                    <NavigationAwareCamera
                                        ref={camera}
                                        device={device}
                                        style={styles.flex1}
                                        zoom={device.neutralZoom}
                                        photo
                                        cameraTabIndex={1}
                                        onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                                    />
                                    <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                                    {canUseMultiScan ? (
                                        <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                            <PressableWithFeedback
                                                role={CONST.ROLE.BUTTON}
                                                accessibilityLabel={translate('receipt.flash')}
                                                disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                                onPress={() => setFlash((prevFlash) => !prevFlash)}
                                            >
                                                <Icon
                                                    height={16}
                                                    width={16}
                                                    src={lazyIcons.Bolt}
                                                    fill={flash ? theme.white : theme.icon}
                                                />
                                            </PressableWithFeedback>
                                        </View>
                                    ) : null}
                                    <Animated.View
                                        pointerEvents="none"
                                        style={[StyleSheet.absoluteFillObject, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                                    />
                                </View>
                            </GestureDetector>
                        </View>
                    )}
                </View>
                {shouldShowMultiScanEducationalPopup && (
                    <FeatureTrainingModal
                        title={translate('iou.scanMultipleReceipts')}
                        image={lazyIllustrations.MultiScan}
                        shouldRenderSVG
                        imageHeight={220}
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
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker
                        onOpenPicker={() => setIsLoaderVisible(true)}
                        fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.gallery')}
                                style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => validateFiles(data),
                                        onCanceled: () => setIsLoaderVisible(false),
                                        // makes sure the loader is not visible anymore e.g. when there is an error while uploading a file
                                        onClosed: () => {
                                            setIsLoaderVisible(false);
                                        },
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
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrations.Shutter}
                            width={CONST.RECEIPT.SHUTTER_SIZE}
                            height={CONST.RECEIPT.SHUTTER_SIZE}
                        />
                    </PressableWithFeedback>
                    {canUseMultiScan ? (
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
                            style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                            disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                            onPress={() => setFlash((prevFlash) => !prevFlash)}
                        >
                            <Icon
                                height={32}
                                width={32}
                                src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </View>

                {canUseMultiScan && (
                    <ReceiptPreviews
                        isMultiScanEnabled={isMultiScanEnabled}
                        submit={submitMultiScanReceipts}
                    />
                )}

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
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
