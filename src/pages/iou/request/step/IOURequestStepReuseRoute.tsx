import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';

import {selectReusableRoute} from '@libs/actions/ReusableDistanceRoutes';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';
import {filterRoutes, getRouteEndpoints} from '@libs/ReusableDistanceRoutesUtils';
import {getRateID} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReusableDistanceRoute} from '@src/types/onyx';

import React, {useEffect, useMemo, useState} from 'react';

import type {ReuseRouteListItemData} from './ReuseRouteListItem';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import useDistanceNavigation from './IOURequestStepDistance/hooks/useDistanceNavigation';
import useDistanceRequestData from './IOURequestStepDistance/hooks/useDistanceRequestData';
import ReuseRouteListItem from './ReuseRouteListItem';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepReuseRouteProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REUSE_ROUTE> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REUSE_ROUTE>;

function IOURequestStepReuseRoute({
    report,
    route: {
        params: {action, iouType, transactionID, reportID},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepReuseRouteProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {policy} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID, action, iouType});
    const personalPolicy = usePersonalPolicy();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isArchived = useReportIsArchived(report?.reportID);
    const selfDMReport = useSelfDMReport();
    const [personalDetails] = useAllPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const reportAttributesDerived = useReportAttributes();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [reusableDistanceRoutes] = useOnyx(ONYXKEYS.REUSABLE_DISTANCE_ROUTES);
    const [isLoadingReusableDistanceRoutes] = useOnyx(ONYXKEYS.IS_LOADING_REUSABLE_DISTANCE_ROUTES);
    const [searchValue, setSearchValue] = useState('');
    const [selectedRoute, setSelectedRoute] = useState<ReusableDistanceRoute | null>(null);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const customUnitRateID = getRateID(transaction);

    const setDistanceRequestData = useDistanceRequestData({
        policy,
        personalPolicy,
        transaction,
        customUnitRateID,
        transactionID,
        isSplitRequest: iouType === CONST.IOU.TYPE.SPLIT,
        currentUserAccountID: currentUserPersonalDetails.accountID,
    });

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return iouType !== CONST.IOU.TYPE.SPLIT && !isArchived && !(isPolicyExpenseChatUtil(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy?.requiresCategory, policy?.requiresTag, isArchived, iouType]);

    const navigateToNextStep = useDistanceNavigation({
        iouType,
        action,
        report,
        policy,
        transaction,
        reportID,
        transactionID,
        reportAttributesDerived,
        personalDetails,
        waypoints: selectedRoute?.waypoints ?? transaction?.comment?.waypoints ?? {},
        currentUserLogin: currentUserPersonalDetails.login ?? '',
        currentUserAccountID: currentUserPersonalDetails.accountID,
        currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
        backTo: undefined,
        backToReport: undefined,
        shouldSkipConfirmation,
        defaultExpensePolicy,
        isArchived,
        isAutoReporting: !!personalPolicy?.autoReporting,
        isASAPSubmitBetaEnabled,
        setDistanceRequestData,
        translate,
        selfDMReport,
        policyForMovingExpenses,
        betas,
        recentWaypoints,
        introSelected,
    });

    // Navigation runs after the draft seed lands in state so the distance navigation reads the reused waypoints.
    useEffect(() => {
        if (!selectedRoute) {
            return;
        }
        navigateToNextStep();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- navigateToNextStep is rebuilt every render, only a new selection should trigger navigation
    }, [selectedRoute]);

    const selectRoute = (item: ReuseRouteListItemData) => {
        if (selectedRoute) {
            return;
        }
        selectReusableRoute(transactionID, item.route).then(() => setSelectedRoute(item.route));
    };

    const routes = reusableDistanceRoutes ?? [];
    const filteredRoutes = filterRoutes(routes, searchValue);
    const data: ReuseRouteListItemData[] = filteredRoutes.map((route) => ({
        route,
        text: getRouteEndpoints(route).start,
        keyForList: route.transactionID,
    }));

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, undefined, report, transaction);
    const headerMessage = searchValue && data.length === 0 ? translate('common.noResultsFound') : '';

    return (
        <StepScreenWrapper
            headerTitle={translate('distance.reusePriorRoute')}
            onBackButtonPress={() => Navigation.goBack()}
            shouldShowWrapper
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            testID="IOURequestStepReuseRoute"
            includeSafeAreaPaddingBottom
        >
            {({didScreenTransitionEnd}) => {
                if (!didScreenTransitionEnd) {
                    return null;
                }
                return (
                    <SelectionList
                        data={data}
                        onSelectRow={selectRoute}
                        textInputOptions={{
                            label: translate('distance.findARoute'),
                            value: searchValue,
                            onChangeText: setSearchValue,
                            headerMessage,
                            shouldBeInsideList: true,
                        }}
                        customListHeaderContent={<Text style={[styles.ph5, styles.pb2, styles.textSupporting]}>{translate('distance.choosePreviousRoute')}</Text>}
                        ListItem={ReuseRouteListItem}
                        shouldShowLoadingPlaceholder={!!isLoadingReusableDistanceRoutes && routes.length === 0}
                        shouldSingleExecuteRowSelect
                    />
                );
            }}
        </StepScreenWrapper>
    );
}

const IOURequestStepReuseRouteWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepReuseRoute);

const IOURequestStepReuseRouteWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepReuseRouteWithCurrentUserPersonalDetails);

const IOURequestStepReuseRouteWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepReuseRouteWithWritableReportOrNotFound);

export default IOURequestStepReuseRouteWithFullTransactionOrNotFound;
