import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {InteractionManager, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethodType} from '@components/KYCWall/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {PaymentData, SearchParams} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useBulkPayOptions from '@hooks/useBulkPayOptions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter, searchInServer} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    getExportTemplates,
    getLastPolicyPaymentMethod,
    getPayOption,
    getReportType,
    isCurrencySupportWalletBulkPay,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    search,
    unholdMoneyRequestOnSearch,
} from '@libs/actions/Search';
import {setTransactionReport} from '@libs/actions/Transaction';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {getActiveAdminWorkspaces, hasDynamicExternalWorkflow, hasVBBA, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID, getPolicyExpenseChat, getReportOrDraftReport, isExpenseReport as isExpenseReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import variables from '@styles/variables';
import {initMoneyRequest, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import SearchModalsWrapper from './SearchModalsWrapper';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isFocused = useIsFocused();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {selectedTransactions, clearSelectedTransactions, selectedReports, lastSearchType, setLastSearchType, areAllMatchingItemsSelected, selectAllMatchingItems} = useSearchContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const newReportID = generateReportID();
    const [newReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReportID}`, {canBeMissing: true});
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReport?.parentReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const personalPolicy = usePersonalPolicy();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isDeleteExpensesConfirmModalVisible, setIsDeleteExpensesConfirmModalVisible] = useState(false);
    const [isDownloadExportModalVisible, setIsDownloadExportModalVisible] = useState(false);
    const [isExportWithTemplateModalVisible, setIsExportWithTemplateModalVisible] = useState(false);
    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const [isDEWModalVisible, setIsDEWModalVisible] = useState(false);
    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q), [route.params.q]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, currentUserPersonalDetails?.accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));

    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);
    const selectedTransactionReportIDs = useMemo(() => [...new Set(Object.values(selectedTransactions).map((transaction) => transaction.reportID))], [selectedTransactions]);
    const selectedReportIDs = Object.values(selectedReports).map((report) => report.reportID);
    const isCurrencySupportedBulkWallet = isCurrencySupportWalletBulkPay(selectedReports, selectedTransactions);
    const isBetaBulkPayEnabled = isBetaEnabled(CONST.BETAS.PAYMENT_BUTTONS);
    const [showSceletons, setShowSceletons] = useState<boolean>(true);
    const selectedPolicyIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.policyID)
                    .filter(Boolean),
            ),
        ],
        [selectedTransactions],
    );

    const {bulkPayButtonOptions, latestBankItems} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
        activeAdminPolicies,
        isCurrencySupportedWallet: isCurrencySupportedBulkWallet,
    });

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            lastNonEmptySearchResults.current = currentSearchResults;
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, policyID: string | undefined) => {
            if (areAllMatchingItemsSelected) {
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: JSON.stringify(queryJSON),
                    reportIDList: [],
                    transactionIDList: [],
                    policyID,
                });
            } else {
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: '{}',
                    reportIDList: selectedTransactionReportIDs,
                    transactionIDList: selectedTransactionsKeys,
                    policyID,
                });
            }

            setIsExportWithTemplateModalVisible(true);
        },
        [queryJSON, selectedTransactionsKeys, areAllMatchingItemsSelected, selectedTransactionReportIDs],
    );

    const onBulkPaySelected = useCallback(
        (paymentMethod?: PaymentMethodType) => {
            if (!hash) {
                return;
            }
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            const activeRoute = Navigation.getActiveRoute();
            const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
            const selectedOptions = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

            for (const item of selectedOptions) {
                const itemPolicyID = item.policyID;
                const itemReportID = item.reportID;
                const isExpenseReport = isExpenseReportUtil(itemReportID);
                const isIOUReport = isIOUReportUtil(itemReportID);
                const reportType = getReportType(itemReportID);
                const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(itemPolicyID, lastPaymentMethods, reportType) ?? paymentMethod;

                if (!lastPolicyPaymentMethod) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: itemReportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }

                const hasPolicyVBBA = hasVBBA(itemPolicyID);

                if (isExpenseReport && lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: item.reportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }
                const isPolicyPaymentMethod = !Object.values(CONST.IOU.PAYMENT_TYPE).includes(lastPolicyPaymentMethod as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>);
                if (isPolicyPaymentMethod && isIOUReport) {
                    const adminPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${lastPolicyPaymentMethod}`];
                    if (!adminPolicy) {
                        Navigation.navigate(
                            ROUTES.SEARCH_REPORT.getRoute({
                                reportID: item.reportID,
                                backTo: activeRoute,
                            }),
                        );
                        return;
                    }
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(itemReportID, adminPolicy, formatPhoneNumber);
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReportID, adminPolicy);
                    }
                }
            }

            const paymentData = (
                selectedReports.length
                    ? selectedReports.map((report) => ({
                          reportID: report.reportID,
                          amount: report.total,
                          paymentType: getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods) ?? paymentMethod,
                      }))
                    : Object.values(selectedTransactions).map((transaction) => ({
                          reportID: transaction.reportID,
                          amount: transaction.amount,
                          paymentType: getLastPolicyPaymentMethod(transaction.policyID, lastPaymentMethods) ?? paymentMethod,
                      }))
            ) as PaymentData[];

            payMoneyRequestOnSearch(hash, paymentData, transactionIDList);
            InteractionManager.runAfterInteractions(() => {
                clearSelectedTransactions();
            });
        },
        [clearSelectedTransactions, hash, isOffline, lastPaymentMethods, selectedReports, selectedTransactions, policies, formatPhoneNumber],
    );

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return CONST.EMPTY_ARRAY as unknown as Array<DropdownOption<SearchHeaderOptionValue>>;
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const getExportOptions = () => {
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: Expensicons.Table,
                    onSelected: () => {
                        if (isOffline) {
                            setIsOfflineModalVisible(true);
                            return;
                        }

                        if (areAllMatchingItemsSelected) {
                            setIsDownloadExportModalVisible(true);
                            return;
                        }

                        exportSearchItemsToCSV(
                            {
                                query: status,
                                jsonQuery: JSON.stringify(queryJSON),
                                reportIDList: selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [],
                                transactionIDList: selectedTransactionsKeys,
                            },
                            () => {
                                setIsDownloadErrorModalVisible(true);
                            },
                        );
                        clearSelectedTransactions(undefined, true);
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                },
            ];

            const areFullReportsSelected = selectedTransactionReportIDs.length === selectedReportIDs.length && selectedTransactionReportIDs.every((id) => selectedReportIDs.includes(id));
            const typeExpenseReport = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
            const typeInvoice = queryJSON?.type === CONST.REPORT.TYPE.INVOICE;
            const typeExpense = queryJSON?.type === CONST.REPORT.TYPE.EXPENSE;
            const isAllOneTransactionReport = Object.values(selectedTransactions).every((transaction) => transaction.isFromOneTransactionReport);

            const includeReportLevelExport = ((typeExpenseReport || typeInvoice) && areFullReportsSelected) || (typeExpense && !typeExpenseReport && isAllOneTransactionReport);

            const policy = selectedPolicyIDs.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyIDs.at(0)}`] : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);
            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: Expensicons.Table,
                    description: template.description,
                    onSelected: () => {
                        beginExportWithTemplate(template.templateName, template.type, template.policyID);
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                });
            }

            return exportOptions;
        };

        const exportButtonOption: DropdownOption<SearchHeaderOptionValue> & Pick<PopoverMenuItem, 'rightIcon'> = {
            icon: Expensicons.Export,
            rightIcon: Expensicons.ArrowRight,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            subMenuItems: getExportOptions(),
        };

        if (areAllMatchingItemsSelected) {
            return [exportButtonOption];
        }

        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE))
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.APPROVE));

        if (shouldShowApproveOption) {
            options.push({
                icon: Expensicons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const selectedPolicyIDList = selectedReports.length
                        ? selectedReports.map((report) => report.policyID)
                        : Object.values(selectedTransactions).map((transaction) => transaction.policyID);
                    const hasDEWPolicy = selectedPolicyIDList.some((policyID) => {
                        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
                        return hasDynamicExternalWorkflow(policy);
                    });

                    if (hasDEWPolicy) {
                        setIsDEWModalVisible(true);
                        return;
                    }

                    const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    const reportIDList = !selectedReports.length
                        ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
                        : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);
                    approveMoneyRequestOnSearch(hash, reportIDList, transactionIDList);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }
        const shouldEnableExpenseBulk = selectedReports.length
            ? selectedReports.every(
                  (report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.PAY) && report.policyID && getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods),
              )
            : selectedTransactionsKeys.every(
                  (id) =>
                      selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.PAY &&
                      selectedTransactions[id].policyID &&
                      getLastPolicyPaymentMethod(selectedTransactions[id].policyID, lastPaymentMethods),
              );

        const {shouldEnableBulkPayOption, isFirstTimePayment} = getPayOption(selectedReports, selectedTransactions, lastPaymentMethods, selectedReportIDs);

        const shouldShowPayOption = !isOffline && !isAnyTransactionOnHold && (isBetaBulkPayEnabled ? shouldEnableBulkPayOption : shouldEnableExpenseBulk);

        if (shouldShowPayOption) {
            const payButtonOption = {
                icon: Expensicons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                rightIcon: isFirstTimePayment ? Expensicons.ArrowRight : undefined,
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                subMenuItems: isFirstTimePayment ? bulkPayButtonOptions : undefined,
                onSelected: () => onBulkPaySelected(undefined),
            };
            options.push(payButtonOption);
        }

        options.push(exportButtonOption);

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        const ownerAccountIDs = new Set<number>();
        let hasUnknownOwner = false;
        for (const id of selectedTransactionsKeys) {
            const transactionEntry = selectedTransactions[id];
            if (!transactionEntry) {
                continue;
            }
            const ownerAccountID = transactionEntry.ownerAccountID ?? getReportOrDraftReport(transactionEntry.reportID)?.ownerAccountID;
            if (typeof ownerAccountID === 'number') {
                ownerAccountIDs.add(ownerAccountID);
                if (ownerAccountIDs.size > 1) {
                    break;
                }
            } else {
                hasUnknownOwner = true;
            }
        }
        const hasMultipleOwners = ownerAccountIDs.size > 1 || (hasUnknownOwner && (ownerAccountIDs.size > 0 || selectedTransactionsKeys.length > 1));

        const canAllTransactionsBeMoved = selectedTransactionsKeys.every((id) => selectedTransactions[id].canChangeReport);

        if (canAllTransactionsBeMoved && !hasMultipleOwners) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionsKeys.length}),
                icon: Expensicons.DocumentMerge,
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP),
            });
        }

        const shouldShowDeleteOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canDelete);

        if (shouldShowDeleteOption) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        setIsDeleteExpensesConfirmModalVisible(true);
                    });
                },
            });
        }

        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables.iconSizeLarge,
                iconWidth: variables.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal, ...styles.textWrap},
            };

            options.push({
                icon: Expensicons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        selectedTransactionsKeys,
        status,
        hash,
        selectedTransactions,
        translate,
        areAllMatchingItemsSelected,
        isOffline,
        selectedReports,
        queryJSON,
        clearSelectedTransactions,
        lastPaymentMethods,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
        beginExportWithTemplate,
        integrationsExportTemplates,
        csvExportLayouts,
        policies,
        bulkPayButtonOptions,
        onBulkPaySelected,
        selectedPolicyIDs,
        selectedReportIDs,
        selectedTransactionReportIDs,
        isBetaBulkPayEnabled,
    ]);

    const handleDeleteExpenses = () => {
        if (selectedTransactionsKeys.length === 0 || !hash) {
            return;
        }

        setIsDeleteExpensesConfirmModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            deleteMoneyRequestOnSearch(hash, selectedTransactionsKeys);
            clearSelectedTransactions();
        });
    };

    const saveFileAndInitMoneyRequest = (files: FileObject[]) => {
        const initialTransaction = initMoneyRequest({
            isFromGlobalCreate: true,
            reportID: newReportID,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report: newReport,
            parentReport: newParentReport,
            currentDate,
        });

        const newReceiptFiles: ReceiptFile[] = [];

        files.forEach((file, index) => {
            const source = URL.createObjectURL(file as Blob);
            const transaction =
                index === 0
                    ? (initialTransaction as Partial<Transaction>)
                    : buildOptimisticTransactionAndCreateDraft({
                          initialTransaction: initialTransaction as Partial<Transaction>,
                          currentUserPersonalDetails,
                          reportID: newReportID,
                      });
            const transactionID = transaction.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
            newReceiptFiles.push({
                file,
                source,
                transactionID,
            });
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true);
        });

        if (isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);
            const shouldAutoReport = !!activePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
            const setParticipantsPromises = newReceiptFiles.map((receiptFile) => {
                setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
                return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat);
            });
            Promise.all(setParticipantsPromises).then(() =>
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        CONST.IOU.TYPE.SUBMIT,
                        initialTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                        activePolicyExpenseChat?.reportID,
                    ),
                ),
            );
        } else {
            navigateToParticipantPage(CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, newReportID);
        }
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(saveFileAndInitMoneyRequest);

    const initScanRequest = (e: DragEvent) => {
        const files = Array.from(e?.dataTransfer?.files ?? []);

        if (files.length === 0) {
            return;
        }
        files.forEach((file) => {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        });

        validateFiles(files, Array.from(e.dataTransfer?.items ?? []));
    };

    const createExportAll = useCallback(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return [];
        }

        setIsDownloadExportModalVisible(false);
        const reportIDList = selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [];
        queueExportSearchItemsToCSV({
            query: status,
            jsonQuery: JSON.stringify(queryJSON),
            reportIDList,
            transactionIDList: selectedTransactionsKeys,
        });
        selectAllMatchingItems(false);
        clearSelectedTransactions();
    }, [selectedTransactionsKeys, status, hash, selectedReports, queryJSON, selectAllMatchingItems, clearSelectedTransactions]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    const {resetVideoPlayerData} = usePlaybackContext();

    const [isSorting, setIsSorting] = useState(false);

    let searchResults;
    if (currentSearchResults?.data) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    const metadata = searchResults?.search;
    const shouldShowOfflineIndicator = !!searchResults?.data;
    const shouldShowFooter = !!metadata?.count || selectedTransactionsKeys.length > 0;

    const offlineIndicatorStyle = useMemo(() => {
        if (shouldShowFooter) {
            return [styles.mtAuto, styles.pAbsolute, styles.h10, styles.b0];
        }

        return [styles.mtAuto];
    }, [shouldShowFooter, styles]);

    useEffect(() => {
        if (shouldUseNarrowLayout) {
            return;
        }
        resetVideoPlayerData();
        return () => {
            if (shouldUseNarrowLayout) {
                return;
            }
            resetVideoPlayerData();
        };
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const prevIsLoading = usePrevious(currentSearchResults?.isLoading);

    useEffect(() => {
        if (!isSorting || !prevIsLoading || currentSearchResults?.isLoading) {
            return;
        }

        setIsSorting(false);
    }, [currentSearchResults?.isLoading, isSorting, prevIsLoading]);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        console.log('duppppppa dupa _________________');
        console.log('Search naprawdę się wywołał');
        console.log('duppppppa dupa _________________');
        debugger;
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value).then((jsonCode) => {
                setSearchRequestResponseStatusCode(Number(jsonCode ?? 0));
                if (isFocused) {
                    setShowSceletons(false);
                }
            });
        }
    }, []);

    const footerData = useMemo(() => {
        const shouldUseClientTotal = !metadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
        const selectedTransactionItems = Object.values(selectedTransactions);
        const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.convertedCurrency;
        const count = shouldUseClientTotal ? selectedTransactionsKeys.length : metadata?.count;
        const total = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.convertedAmount ?? 0), 0) : metadata?.total;

        return {count, total, currency};
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys.length]);

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, []);

    const scrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!e.nativeEvent.contentOffset.y) {
            return;
        }

        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    };

    useEffect(() => {
        console.log('zmiana statusu search duuuuupa dupa');
        console.log(currentSearchResults);
        console.log('____________________________________');
    }, [currentSearchResults]);

    if (true) {
        if (shouldUseNarrowLayout) {
            return (
                <>
                    <DragAndDropProvider>
                        {PDFValidationComponent}
                        <SearchPageNarrow
                            queryJSON={queryJSON}
                            metadata={metadata}
                            headerButtonsOptions={headerButtonsOptions}
                            searchResults={searchResults}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            footerData={footerData}
                            currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                            currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                            confirmPayment={onBulkPaySelected}
                            latestBankItems={latestBankItems}
                        />
                        <DragAndDropConsumer onDrop={initScanRequest}>
                            <DropZoneUI
                                icon={Expensicons.SmartScan}
                                dropTitle={translate('dropzone.scanReceipts')}
                                dropStyles={styles.receiptDropOverlay(true)}
                                dropTextStyles={styles.receiptDropText}
                                dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                                dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                            />
                        </DragAndDropConsumer>
                        {ErrorModal}
                    </DragAndDropProvider>
                    {!!isMobileSelectionModeEnabled && (
                        <SearchModalsWrapper
                            isDeleteExpensesConfirmModalVisible={isDeleteExpensesConfirmModalVisible}
                            handleDeleteExpenses={handleDeleteExpenses}
                            setIsDeleteExpensesConfirmModalVisible={setIsDeleteExpensesConfirmModalVisible}
                            selectedTransactionsKeys={selectedTransactionsKeys}
                            setIsOfflineModalVisible={setIsOfflineModalVisible}
                            isOfflineModalVisible={isOfflineModalVisible}
                            setIsDownloadErrorModalVisible={setIsDownloadErrorModalVisible}
                            isDownloadErrorModalVisible={isDownloadErrorModalVisible}
                            isExportWithTemplateModalVisible={isExportWithTemplateModalVisible}
                            setIsExportWithTemplateModalVisible={setIsExportWithTemplateModalVisible}
                            clearSelectedTransactions={clearSelectedTransactions}
                            isDEWModalVisible={isDEWModalVisible}
                            setIsDEWModalVisible={setIsDEWModalVisible}
                        />
                    )}
                </>
            );
        }

        return (
            <ScreenWrapper
                testID={Search.displayName}
                shouldEnableMaxHeight
                headerGapStyles={[styles.searchHeaderGap, styles.h0]}
            >
                <FullPageNotFoundView
                    shouldForceFullScreen
                    shouldShow={!queryJSON}
                    onBackButtonPress={handleOnBackButtonPress}
                    shouldShowLink={false}
                >
                    <SearchPageWide
                        queryJSON={queryJSON}
                        searchResults={searchResults}
                        searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                        headerButtonsOptions={headerButtonsOptions}
                        footerData={footerData}
                        selectedPolicyIDs={selectedPolicyIDs}
                        selectedTransactionReportIDs={selectedTransactionReportIDs}
                        selectedReportIDs={selectedReportIDs}
                        latestBankItems={latestBankItems}
                        onBulkPaySelected={onBulkPaySelected}
                        handleSearchAction={handleSearchAction}
                        onSortPressedCallback={onSortPressedCallback}
                        scrollHandler={scrollHandler}
                        initScanRequest={initScanRequest}
                        PDFValidationComponent={PDFValidationComponent}
                        ErrorModal={ErrorModal}
                        shouldShowOfflineIndicator={shouldShowOfflineIndicator}
                        offlineIndicatorStyle={offlineIndicatorStyle}
                        shouldShowFooter={shouldShowFooter}
                    />
                    <SearchModalsWrapper
                        isDeleteExpensesConfirmModalVisible={isDeleteExpensesConfirmModalVisible}
                        handleDeleteExpenses={handleDeleteExpenses}
                        setIsDeleteExpensesConfirmModalVisible={setIsDeleteExpensesConfirmModalVisible}
                        selectedTransactionsKeys={selectedTransactionsKeys}
                        setIsOfflineModalVisible={setIsOfflineModalVisible}
                        isOfflineModalVisible={isOfflineModalVisible}
                        setIsDownloadErrorModalVisible={setIsDownloadErrorModalVisible}
                        isDownloadErrorModalVisible={isDownloadErrorModalVisible}
                        isExportWithTemplateModalVisible={isExportWithTemplateModalVisible}
                        setIsExportWithTemplateModalVisible={setIsExportWithTemplateModalVisible}
                        clearSelectedTransactions={clearSelectedTransactions}
                        isDEWModalVisible={isDEWModalVisible}
                        setIsDEWModalVisible={setIsDEWModalVisible}
                        isDownloadExportModalVisible={isDownloadExportModalVisible}
                        createExportAll={createExportAll}
                        setIsDownloadExportModalVisible={setIsDownloadExportModalVisible}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
    return (
        <View style={styles.searchSplitContainer}>
            <ScreenWrapper
                testID={Search.displayName}
                shouldShowOfflineIndicatorInWideScreen={!!shouldShowOfflineIndicator}
                offlineIndicatorStyle={offlineIndicatorStyle}
            >
                <SearchPageHeader
                    queryJSON={queryJSON}
                    headerButtonsOptions={headerButtonsOptions}
                    handleSearch={handleSearchAction}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                />
                <SearchFiltersSkeleton shouldAnimate />
                <Animated.View
                    entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                    exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                    style={[styles.flex1]}
                >
                    <SearchRowSkeleton
                        shouldAnimate
                        containerStyle={shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3}
                    />
                </Animated.View>
                {shouldShowFooter && (
                    <SearchPageFooter
                        count={footerData.count}
                        total={footerData.total}
                        currency={footerData.currency}
                    />
                )}
            </ScreenWrapper>
        </View>
    );
}

SearchPage.displayName = 'SearchPage';
SearchPage.whyDidYouRender = true;

export default SearchPage;
