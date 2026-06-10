import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateMoneyRequestVendor} from '@libs/actions/IOU/UpdateMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getQBOVendors, hasVendorFeature} from '@libs/PolicyUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
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
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const [searchValue, setSearchValue] = useState('');

    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: report?.policyID,
        action,
        iouType,
        isPerDiemRequest: isPerDiemRequest(transaction),
    });
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const delegateAccountID = useDelegateAccountID();

    const isFeatureAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));

    // Vendor is scoped to non-reimbursable expenses on a policy expense chat; block deep-link / stale-open access if the transaction is reimbursable or is an invoice (invoices are non-reimbursable but don't route through the QBO CC vendor-matching flow).
    const isReimbursable = !!transaction?.reimbursable;
    const isInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const vendors = getQBOVendors(policy);
    const currentVendorID = transaction?.comment?.vendor?.externalID;

    const trimmedSearch = searchValue.trim().toLowerCase();
    const vendorRows: VendorListItem[] = vendors
        .filter((vendor) => !trimmedSearch || vendor.name.toLowerCase().includes(trimmedSearch))
        .map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.id,
            isSelected: vendor.id === currentVendorID,
            searchText: vendor.name,
        }));

    // When a vendor is currently set, offer a "None" row so the user can clear a stale (e.g. removed-from-QBO) vendor without picking a replacement, which resolves an inactiveVendor violation. Hidden during search to keep results clean.
    const data: VendorListItem[] =
        !currentVendorID || trimmedSearch
            ? vendorRows
            : [
                  {
                      value: '',
                      text: translate('common.none'),
                      keyForList: 'clear-vendor',
                      isSelected: false,
                      searchText: '',
                  },
                  ...vendorRows,
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
                transaction,
                transactionThreadReport: report,
                parentReport,
                policy,
                delegateAccountID,
            });
        }
        navigateBack();
    };

    const headerMessage = searchValue && data.length === 0 ? translate('common.noResultsFound') : '';

    const listEmptyContent =
        vendors.length === 0 ? (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
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
            <SelectionList
                data={data}
                onSelectRow={selectVendor}
                textInputOptions={{
                    label: translate('common.search'),
                    value: searchValue,
                    onChangeText: setSearchValue,
                    headerMessage,
                }}
                initiallyFocusedItemKey={data.find((item) => item.isSelected)?.keyForList}
                ListItem={SingleSelectListItem}
                shouldShowLoadingPlaceholder={!policy}
                listEmptyContent={listEmptyContent}
                shouldSingleExecuteRowSelect
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepVendor));
