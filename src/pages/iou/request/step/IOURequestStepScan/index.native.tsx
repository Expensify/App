import {useFocusEffect} from '@react-navigation/core';
import reportsSelector from '@selectors/Attributes';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, AppState, InteractionManager, StyleSheet, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {OnyxEntry} from 'react-native-onyx';
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
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
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
import setTestReceipt from '@libs/actions/setTestReceipt';
import {setTransactionReport} from '@libs/actions/Transaction';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getCurrentPosition from '@libs/getCurrentPosition';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import HapticFeedback from '@libs/HapticFeedback';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {getManagerMcTestParticipant, getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {findSelfDMReportID, generateReportID, getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getDefaultTaxCode} from '@libs/TransactionUtils';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
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
import type {GpsPoint} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
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
    const {isLoaderVisible, setIsLoaderVisible} = useFullScreenLoader();
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
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
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
        HapticFeedback.press();
    }, [blinkOpacity]);

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !isArchivedReport(reportNameValuePairs) && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy?.requiresCategory, policy?.requiresTag, reportNameValuePairs]);

    const {translate} = useLocalize();

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        CameraPermission.requestCameraPermission?.()
            .then((status: string) => {
                setCameraPermissionStatus(status);

                if (status === RESULTS.BLOCKED) {
                    showCameraPermissionsAlert();
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
        // eslint-disable-next-line react-compiler/react-compiler
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

    const createTransaction = useCallback(
        (
            files: ReceiptFile[],
            participant: Participant,
            gpsPoint?: GpsPoint,
            policyParams?: {
                policy: OnyxEntry<Policy>;
            },
            billable?: boolean,
            reimbursable = true,
        ) => {
            // eslint-disable-next-line unicorn/no-array-for-each
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
                            reimbursable,
                            gpsPoint,
                        },
                        ...(policyParams ?? {}),
                        shouldHandleNavigation: index === files.length - 1,
                        isASAPSubmitBetaEnabled,
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
                        gpsPoint,
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
                        shouldGenerateTransactionThreadReport,
                        isASAPSubmitBetaEnabled,
                        currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                        currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                        transactionViolations,
                    });
                }
            });
        },
        [
            transactions,
            iouType,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            backToReport,
            shouldGenerateTransactionThreadReport,
            isASAPSubmitBetaEnabled,
            transactionViolations,
        ],
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

            // If the user started this flow from using the + button in the composer inside a report
            // the participants can be automatically assigned from the report and the user can skip the participants step and go straight
            // to the confirmation step.
            // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
            if (!initialTransaction?.isFromGlobalCreate && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
                const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
                const participants = selectedParticipants.map((participant) => {
                    const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
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
                                const gpsPoint = {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                };
                                createTransaction(files, participant, gpsPoint, policyParams, false);
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

                const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipantsFromReport(receiptFile.transactionID, report, currentUserPersonalDetails.accountID));
                Promise.all(setParticipantsPromises).then(() => navigateToConfirmationPage());
                return;
            }

            // If there was no reportID, then that means the user started this flow from the global + menu
            // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
            if (
                iouType === CONST.IOU.TYPE.CREATE &&
                isPaidGroupPolicy(defaultExpensePolicy) &&
                defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
                !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
            ) {
                const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id);
                const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
                const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;

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

                const setParticipantsPromises = files.map((receiptFile) => {
                    setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
                    return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat, currentUserPersonalDetails.accountID);
                });
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
            initialTransaction?.isFromGlobalCreate,
            initialTransaction?.currency,
            initialTransaction?.participants,
            initialTransaction?.reportID,
            reportNameValuePairs,
            iouType,
            personalPolicy?.autoReporting,
            defaultExpensePolicy,
            report,
            initialTransactionID,
            navigateToConfirmationPage,
            shouldSkipConfirmation,
            personalDetails,
            reportAttributesDerived,
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
            replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicyCategories: policyCategories});
        },
        [initialTransactionID, policyCategories, backTo],
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

        for (const [index, file] of files.entries()) {
            const transaction =
                !shouldAcceptMultipleFiles || (index === 0 && transactions.length === 1 && (!initialTransaction?.receipt?.source || initialTransaction?.receipt?.isTestReceipt))
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
        if (isMultiScanEnabled) {
            removeDraftTransactions(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
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
            testID={IOURequestStepScan.displayName}
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
                        submit={submitReceipts}
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

IOURequestStepScan.displayName = 'IOURequestStepScan';

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
