import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateMoneyRequestVendor} from '@libs/actions/IOU/UpdateMoneyRequest';
import {openPolicyVendorsPage} from '@libs/actions/Policy/Vendor';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getVendorEmptyState, hasVendorFeature, sortVendors} from '@libs/PolicyUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type VendorListItem = ListItem & {
    value: string;
};

type IOURequestStepVendorProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_VENDOR> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_VENDOR>;

function IOURequestStepVendor({
    report,
    route: {
        params: {action, iouType, transactionID, reportActionID},
    },
    transaction,
}: IOURequestStepVendorProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const [searchValue, setSearchValue] = useState('');

    const [draftVendor, setDraftVendor] = useState<VendorListItem>();

    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: report?.policyID,
        action,
        iouType,
        isPerDiemRequest: isPerDiemRequest(transaction),
    });
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policy?.id}`);
    const delegateAccountID = useDelegateAccountID();

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isFeatureAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled);
    // Stale sessions may never have received the policyVendors_ collection, so fetch it if missing.
    const fetchVendorsIfMissing = () => {
        if (!isFeatureAvailable || !policy?.id || policyVendors !== undefined) {
            return;
        }
        openPolicyVendorsPage(policy.id);
    };

    const {isOffline} = useNetwork({onReconnect: fetchVendorsIfMissing});

    useEffect(() => {
        fetchVendorsIfMissing();
        // Re-run when the policy loads or the collection is cleared, so a missing fetch retries.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFeatureAvailable, policy?.id, policyVendors]);
    const emptyState = getVendorEmptyState(policy, translate);

    // Vendor is scoped to non-reimbursable expenses on a policy expense chat; block deep-link / stale-open access if the transaction is reimbursable or is an invoice (invoices are non-reimbursable but don't route through the vendor-matching flow).
    const isReimbursable = !!transaction?.reimbursable;
    const isInvoice = iouType === CONST.IOU.TYPE.INVOICE;

    const currentVendorID = transaction?.comment?.vendor?.externalID;
    const currentVendor = currentVendorID ? policyVendors?.[currentVendorID] : undefined;
    const isCurrentVendorDisabled = !!currentVendorID && policyVendors !== undefined && !currentVendor?.enabled;

    const isLoading = !isOffline && policyVendors === undefined;

    const enabledVendors = Object.values(policyVendors ?? {}).filter((vendor) => vendor.enabled);
    const sortedEnabledVendors = sortVendors(enabledVendors, localeCompare);

    const trimmedSearch = searchValue.trim().toLowerCase();
    const selectedVendorID = draftVendor ? draftVendor.value : currentVendorID;
    const enabledRows: VendorListItem[] = sortedEnabledVendors
        .filter((vendor) => !trimmedSearch || vendor.name.toLowerCase().includes(trimmedSearch))
        .map((vendor) => ({
            value: vendor.externalID,
            text: vendor.name,
            keyForList: vendor.externalID,
            isSelected: vendor.externalID === selectedVendorID,
            searchText: vendor.name,
        }));

    const disabledCurrentVendorRow: VendorListItem | undefined =
        !trimmedSearch && isCurrentVendorDisabled
            ? {
                  value: currentVendorID,
                  text: currentVendor?.name ?? transaction?.comment?.vendor?.name ?? '',
                  keyForList: currentVendorID,
                  isSelected: selectedVendorID === currentVendorID,
                  searchText: currentVendor?.name ?? transaction?.comment?.vendor?.name ?? '',
                  alternateText: translate('common.disabled'),
              }
            : undefined;

    const shouldShowNoneRow = !!currentVendorID && !trimmedSearch;

    const data: VendorListItem[] = [
        ...(shouldShowNoneRow
            ? [
                  {
                      value: '',
                      text: translate('common.none'),
                      keyForList: 'clear-vendor',
                      isSelected: draftVendor?.keyForList === 'clear-vendor',
                      searchText: '',
                  },
              ]
            : []),
        ...(disabledCurrentVendorRow ? [disabledCurrentVendorRow] : []),
        ...enabledRows,
    ];

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction) || !isFeatureAvailable || isReimbursable || isInvoice;

    const navigateBack = () => {
        Navigation.goBack();
    };

    const selectVendor = (item: VendorListItem) => {
        if (item.value !== currentVendorID) {
            updateMoneyRequestVendor({
                transactionID,
                vendorID: item.value,
                // The injected "None" row clears the vendor: its value is '' but its text is the localized "None" label.
                // Only forward a display name for a real vendor so a clear request never persists a bogus name.
                vendorName: item.value ? (item.text ?? '') : '',
                transaction,
                transactionThreadReport: report,
                parentReport,
                policy,
                delegateAccountID,
                transactionViolations,
            });
        }
        navigateBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: () => {
            if (!draftVendor) {
                return;
            }
            selectVendor(draftVendor);
        },
        isDisabled: !draftVendor || draftVendor.value === currentVendorID,
    };

    const headerMessage = searchValue && data.length === 0 ? translate('common.noResultsFound') : '';

    const listEmptyContent =
        enabledVendors.length === 0 && !disabledCurrentVendorRow ? (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={emptyState.title}
                subtitle={emptyState.subtitle}
                containerStyle={styles.pb10}
            />
        ) : null;

    return (
        <StepScreenWrapper
            headerTitle={translate('common.vendor')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            testID="IOURequestStepVendor"
            includeSafeAreaPaddingBottom
        >
            {({didScreenTransitionEnd}) => {
                // Defer mounting the SelectionList (and its policy-derived data / lazy illustrations)
                // until the RHP entry animation ends. First-open cost otherwise lands mid-transition
                // and shows up as a backdrop flicker on the underlying expense view.
                if (!didScreenTransitionEnd) {
                    return null;
                }
                if (isLoading) {
                    return (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                        />
                    );
                }
                return (
                    <SelectionList
                        data={data}
                        onSelectRow={setDraftVendor}
                        confirmButtonOptions={confirmButtonOptions}
                        textInputOptions={{
                            label: translate('common.search'),
                            value: searchValue,
                            onChangeText: setSearchValue,
                            headerMessage,
                        }}
                        initiallyFocusedItemKey={shouldShowNoneRow ? undefined : currentVendorID}
                        ListItem={SingleSelectListItem}
                        listEmptyContent={listEmptyContent}
                        shouldSingleExecuteRowSelect
                    />
                );
            }}
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepVendor));
