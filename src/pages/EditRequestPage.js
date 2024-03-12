import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import categoryPropTypes from '@components/categoryPropTypes';
import ScreenWrapper from '@components/ScreenWrapper';
import tagPropTypes from '@components/tagPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {isTaxPolicyEnabled} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestDistancePage from './EditRequestDistancePage';
import EditRequestReceiptPage from './EditRequestReceiptPage';
import EditRequestTagPage from './EditRequestTagPage';
import EditRequestTaxAmountPage from './EditRequestTaxAmountPage';
import EditRequestTaxRatePage from './EditRequestTaxRatePage';
import reportActionPropTypes from './home/report/reportActionPropTypes';
import reportPropTypes from './reportPropTypes';
import {policyPropTypes} from './workspace/withPolicy';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,

            /** The index of a tag list */
            tagIndex: PropTypes.string,
        }),
    }).isRequired,

    /** Onyx props */
    /** The report object for the thread report */
    report: reportPropTypes,

    /** The policy of the report */
    policy: policyPropTypes.policy,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** The actions from the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Transaction that stores the request data */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    policy: {},
    policyCategories: {},
    policyTags: {},
    parentReportActions: {},
    transaction: {},
};

const getTaxAmount = (transactionAmount, transactionTaxCode, taxRates) => {
    const percentage = (transactionTaxCode ? taxRates.taxes[transactionTaxCode].value : taxRates.defaultValue) || '';
    return CurrencyUtils.convertToBackendAmount(Number.parseFloat(TransactionUtils.calculateTaxAmount(percentage, Math.abs(transactionAmount))));
};

function EditRequestPage({report, route, policy, policyCategories, policyTags, parentReportActions, transaction}) {
    const parentReportActionID = lodashGet(report, 'parentReportActionID', '0');
    const parentReportAction = lodashGet(parentReportActions, parentReportActionID, {});
    const {
        amount: transactionAmount,
        taxAmount: transactionTaxAmount,
        taxCode: transactionTaxCode,
        currency: transactionCurrency,
        tag: transactionTag,
    } = ReportUtils.getTransactionDetails(transaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');
    const tagIndex = Number(lodashGet(route, ['params', 'tagIndex'], undefined));

    const tag = TransactionUtils.getTag(transaction, tagIndex);
    const policyTagListName = PolicyUtils.getTagListName(policyTags, tagIndex);
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    const taxRates = lodashGet(policy, 'taxRates', {});

    const taxRateTitle = TransactionUtils.getTaxName(taxRates.taxes, transactionTaxCode);

    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = ReportUtils.isGroupPolicy(report);

    // A flag for showing the tags page
    const shouldShowTags = useMemo(() => isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists)), [isPolicyExpenseChat, policyTagLists, transactionTag]);

    // A flag for showing tax rate
    const shouldShowTax = isTaxPolicyEnabled(isPolicyExpenseChat, policy);

    // Decides whether to allow or disallow editing a money request
    useEffect(() => {
        // Do not dismiss the modal, when a current user can edit this property of the money request.
        if (ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, fieldToEdit)) {
            return;
        }

        // Dismiss the modal when a current user cannot edit a money request.
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }, [parentReportAction, fieldToEdit]);

    const updateTaxAmount = useCallback(
        (transactionChanges) => {
            const newTaxAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges.amount));

            if (newTaxAmount === TransactionUtils.getTaxAmount(transaction)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestTaxAmount(transaction.transactionID, report.reportID, newTaxAmount, policy, policyTags, policyCategories);
            Navigation.dismissModal(report.reportID);
        },
        [transaction, report, policy, policyTags, policyCategories],
    );

    const updateTaxRate = useCallback(
        (transactionChanges) => {
            const newTaxCode = transactionChanges.data.code;

            if (newTaxCode === undefined || newTaxCode === TransactionUtils.getTaxCode(transaction)) {
                Navigation.dismissModal();
                return;
            }

            IOU.updateMoneyRequestTaxRate(transaction.transactionID, report.reportID, newTaxCode, policy, policyTags, policyCategories);
            Navigation.dismissModal(report.reportID);
        },
        [transaction, report, policy, policyTags, policyCategories],
    );

    const saveAmountAndCurrency = useCallback(
        ({amount, currency: newCurrency}) => {
            const newAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newAmount === TransactionUtils.getAmount(transaction) && newCurrency === TransactionUtils.getCurrency(transaction)) {
                Navigation.dismissModal();
                return;
            }

            IOU.updateMoneyRequestAmountAndCurrency(transaction.transactionID, report.reportID, newCurrency, newAmount, policy, policyTags, policyCategories);
            Navigation.dismissModal();
        },
        [transaction, report, policy, policyTags, policyCategories],
    );

    const saveTag = useCallback(
        ({tag: newTag}) => {
            let updatedTag = newTag;
            if (newTag === tag) {
                // In case the same tag has been selected, reset the tag.
                updatedTag = '';
            }
            IOU.updateMoneyRequestTag(
                transaction.transactionID,
                report.reportID,
                IOUUtils.insertTagIntoTransactionTagsString(transactionTag, updatedTag, tagIndex),
                policy,
                policyTags,
                policyCategories,
            );
            Navigation.dismissModal();
        },
        [tag, transaction.transactionID, report.reportID, transactionTag, tagIndex, policy, policyTags, policyCategories],
    );

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount}
                defaultCurrency={defaultCurrency}
                reportID={report.reportID}
                onSubmit={saveAmountAndCurrency}
                onNavigateToCurrency={() => {
                    const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
                    Navigation.navigate(ROUTES.EDIT_CURRENCY_REQUEST.getRoute(report.reportID, defaultCurrency, activeRoute));
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAG && shouldShowTags) {
        return (
            <EditRequestTagPage
                defaultTag={tag}
                tagName={policyTagListName}
                tagIndex={tagIndex}
                policyID={lodashGet(report, 'policyID', '')}
                onSubmit={saveTag}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAX_AMOUNT && shouldShowTax) {
        return (
            <EditRequestTaxAmountPage
                defaultAmount={transactionTaxAmount}
                defaultTaxAmount={getTaxAmount(transaction.amount, transactionTaxCode, taxRates)}
                defaultCurrency={defaultCurrency}
                onSubmit={updateTaxAmount}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAX_RATE && shouldShowTax) {
        return (
            <EditRequestTaxRatePage
                defaultTaxRate={taxRateTitle}
                policyID={lodashGet(report, 'policyID', '')}
                onSubmit={updateTaxRate}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.RECEIPT) {
        return (
            <EditRequestReceiptPage
                route={route}
                transactionID={transaction.transactionID}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DISTANCE) {
        return (
            <EditRequestDistancePage
                report={report}
                transactionID={transaction.transactionID}
                route={route}
            />
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestPage.displayName}
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

EditRequestPage.displayName = 'EditRequestPage';
EditRequestPage.propTypes = propTypes;
EditRequestPage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
            canEvict: false,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        transaction: {
            key: ({report, parentReportActions}) => {
                const parentReportActionID = lodashGet(report, 'parentReportActionID', '0');
                const parentReportAction = lodashGet(parentReportActions, parentReportActionID);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(parentReportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
    }),
)(EditRequestPage);
