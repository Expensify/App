import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import DestinationPicker from '@components/DestinationPicker';
import FixedFooter from '@components/FixedFooter';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionListWithSections/types';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit, isPolicyAdmin} from '@libs/PolicyUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import variables from '@styles/variables';
import {
    clearSubrates,
    getIOURequestPolicyID,
    setCustomUnitID,
    setCustomUnitRateID,
    setMoneyRequestCategory,
    setMoneyRequestCurrency,
    setMoneyRequestParticipantsFromReport,
} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDestinationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DESTINATION | typeof SCREENS.MONEY_REQUEST.CREATE> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DESTINATION | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        openedFromStartPage?: boolean;
        explicitPolicyID?: string;
    };

function IOURequestStepDestination({
    report,
    route: {
        params: {transactionID, backTo, action, iouType, reportID},
    },
    transaction,
    openedFromStartPage = false,
    explicitPolicyID,
}: IOURequestStepDestinationProps) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${explicitPolicyID ?? getIOURequestPolicyID(transaction, report)}`, {canBeMissing: false});
    const personalPolicy = usePersonalPolicy();
    const {accountID} = useCurrentUserPersonalDetails();
    const policyExpenseReport = policy?.id ? getPolicyExpenseChat(accountID, policy.id) : undefined;
    const {top} = useSafeAreaInsets();
    const customUnit = getPerDiemCustomUnit(policy);
    const selectedDestination = transaction?.comment?.customUnit?.customUnitRateID;

    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses']);
    const {translate} = useLocalize();

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isEmptyObject(policy);

    const {isOffline} = useNetwork();
    const isLoading = !isOffline && (!customUnit?.rates || isLoadingOnyxValue(policyMetadata));
    const shouldShowEmptyState = isEmptyObject(customUnit?.rates) && !isOffline && !isLoading;
    const shouldShowOfflineView = isEmptyObject(customUnit?.rates) && isOffline;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateDestination = (destination: ListItem & {currency: string}) => {
        if (isEmptyObject(customUnit)) {
            return;
        }
        if (selectedDestination !== destination.keyForList) {
            if (openedFromStartPage) {
                // If we are not coming from the global create menu then this is always reported
                const shouldAutoReport = !!policy?.autoReporting || !!personalPolicy?.autoReporting || action !== CONST.IOU.ACTION.CREATE || !transaction?.isFromGlobalCreate;
                const autoReportID = report && !transaction?.isFromGlobalCreate ? report.reportID : policyExpenseReport?.reportID;
                const transactionReportID = shouldAutoReport ? autoReportID : CONST.REPORT.UNREPORTED_REPORT_ID;
                setTransactionReport(transactionID, {reportID: transactionReportID}, true);
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseReport, accountID);
                setCustomUnitID(transactionID, customUnit.customUnitID);
                setMoneyRequestCategory(transactionID, customUnit?.defaultCategory ?? '', undefined);
            }
            setCustomUnitRateID(transactionID, destination.keyForList ?? '');
            setMoneyRequestCurrency(transactionID, destination.currency);
            clearSubrates(transactionID);
        }

        if (backTo) {
            navigateBack();
        } else if (explicitPolicyID && transaction?.isFromGlobalCreate) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, policyExpenseReport?.reportID ?? reportID));
        } else {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID));
        }
    };

    const tabTitles = {
        [CONST.IOU.TYPE.REQUEST]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SUBMIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SEND]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.PAY]: translate('iou.paySomeone', {name: ''}),
        [CONST.IOU.TYPE.SPLIT]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.SPLIT_EXPENSE]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.TRACK]: translate('iou.createExpense'),
        [CONST.IOU.TYPE.INVOICE]: translate('workspace.invoices.sendInvoice'),
        [CONST.IOU.TYPE.CREATE]: translate('iou.createExpense'),
    };

    useEffect(() => {
        if (!isEmptyObject(customUnit?.rates) || isOffline) {
            return;
        }
        fetchPerDiemRates(policy?.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    useEffect(() => {
        // When the rates are not available for the policy, the transaction does not have valid customUnitID and moneyRequestCategory
        // So, we set these in the transaction when the rates are fetched in fetchPerDiemRates
        const perDiemUnit = getPerDiemCustomUnit(policy);
        if (!perDiemUnit || transaction?.comment?.customUnit?.customUnitID === perDiemUnit.customUnitID || !!transaction?.category) {
            return;
        }
        setCustomUnitID(transactionID, perDiemUnit?.customUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        setMoneyRequestCategory(transactionID, perDiemUnit?.defaultCategory ?? '', undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionID, policy?.customUnits]);

    const keyboardVerticalOffset = openedFromStartPage ? variables.contentHeaderHeight + top + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding : 0;

    return (
        <ScreenWrapper
            includePaddingTop={false}
            keyboardVerticalOffset={keyboardVerticalOffset}
            testID="IOURequestStepDestination-container"
            shouldShowOfflineIndicator={false}
        >
            <StepScreenWrapper
                headerTitle={backTo ? translate('common.destination') : tabTitles[iouType]}
                onBackButtonPress={navigateBack}
                shouldShowWrapper={!openedFromStartPage}
                shouldShowNotFoundPage={shouldShowNotFoundPage}
                testID="IOURequestStepDestination"
            >
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {shouldShowOfflineView && <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>}
                {shouldShowEmptyState && (
                    <View style={[styles.flex1]}>
                        <WorkspaceEmptyStateSection
                            shouldStyleAsCard={false}
                            icon={illustrations.EmptyStateExpenses}
                            title={translate('workspace.perDiem.emptyList.title')}
                            subtitle={translate('workspace.perDiem.emptyList.subtitle')}
                            containerStyle={[styles.flex1, styles.justifyContentCenter]}
                        />
                        {isPolicyAdmin(policy) && !!policy?.areCategoriesEnabled && (
                            <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                                <Button
                                    large
                                    success
                                    style={[styles.w100]}
                                    onPress={() => {
                                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                                        InteractionManager.runAfterInteractions(() => {
                                            Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM.getRoute(policy.id, Navigation.getActiveRoute()));
                                        });
                                    }}
                                    text={translate('workspace.perDiem.editPerDiemRates')}
                                    pressOnEnter
                                />
                            </FixedFooter>
                        )}
                    </View>
                )}
                {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && !!policy?.id && (
                    <DestinationPicker
                        selectedDestination={selectedDestination}
                        policyID={policy.id}
                        onSubmit={updateDestination}
                    />
                )}
            </StepScreenWrapper>
        </ScreenWrapper>
    );
}

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepDestinationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDestination);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepDestinationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDestinationWithFullTransactionOrNotFound);
export default IOURequestStepDestinationWithWritableReportOrNotFound;
