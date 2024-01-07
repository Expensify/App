import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import categoryPropTypes from '@components/categoryPropTypes';
import ScreenWrapper from '@components/ScreenWrapper';
import tagPropTypes from '@components/tagPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestCategoryPage from './EditRequestCategoryPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestDistancePage from './EditRequestDistancePage';
import EditRequestMerchantPage from './EditRequestMerchantPage';
import EditRequestReceiptPage from './EditRequestReceiptPage';
import EditRequestTagPage from './EditRequestTagPage';
import reportActionPropTypes from './home/report/reportActionPropTypes';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** Onyx props */
    /** The report object for the thread report */
    report: reportPropTypes,

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
    policyCategories: {},
    policyTags: {},
    parentReportActions: {},
    transaction: {},
};

function EditRequestPage({report, route, policyCategories, policyTags, parentReportActions, transaction}) {
    const parentReportActionID = lodashGet(report, 'parentReportActionID', '0');
    const parentReportAction = lodashGet(parentReportActions, parentReportActionID, {});
    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        comment: transactionDescription,
        merchant: transactionMerchant,
        category: transactionCategory,
        tag: transactionTag,
    } = ReportUtils.getTransactionDetails(transaction);

    const defaultCurrency = lodashGet(route, 'params.currency', '') || transactionCurrency;
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');

    // For now, it always defaults to the first tag of the policy
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const tagListName = PolicyUtils.getTagListName(policyTags);

    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = ReportUtils.isGroupPolicy(report);

    // A flag for showing the categories page
    const shouldShowCategories = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));

    // A flag for showing the tags page
    const shouldShowTags = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagList)));

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

    // Update the transaction object and close the modal
    function editMoneyRequest(transactionChanges) {
        IOU.editMoneyRequest(transaction, report.reportID, transactionChanges);
        Navigation.dismissModal(report.reportID);
    }

    const saveAmountAndCurrency = useCallback(
        ({amount, currency: newCurrency}) => {
            const newAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newAmount === TransactionUtils.getAmount(transaction) && newCurrency === TransactionUtils.getCurrency(transaction)) {
                Navigation.dismissModal();
                return;
            }

            IOU.updateMoneyRequestAmountAndCurrency(transaction.transactionID, report.reportID, newCurrency, newAmount);
            Navigation.dismissModal();
        },
        [transaction, report],
    );

    const saveCreated = useCallback(
        ({created: newCreated}) => {
            // If the value hasn't changed, don't request to save changes on the server and just close the modal
            if (newCreated === TransactionUtils.getCreated(transaction)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestDate(transaction.transactionID, report.reportID, newCreated);
            Navigation.dismissModal();
        },
        [transaction, report],
    );

    const saveTag = useCallback(
        ({tag: newTag}) => {
            let updatedTag = newTag;
            if (newTag === transactionTag) {
                // In case the same tag has been selected, reset the tag.
                updatedTag = '';
            }
            IOU.updateMoneyRequestTag(transaction.transactionID, report.reportID, updatedTag);
            Navigation.dismissModal();
        },
        [transactionTag, transaction.transactionID, report.reportID],
    );

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(transactionChanges) => {
                    // In case the comment hasn't been changed, do not make the API request.
                    if (transactionChanges.comment.trim() === transactionDescription) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest({comment: transactionChanges.comment.trim()});
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DATE) {
        return (
            <EditRequestCreatedPage
                defaultCreated={TransactionUtils.getCreated(transaction)}
                onSubmit={saveCreated}
            />
        );
    }

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

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.MERCHANT) {
        return (
            <EditRequestMerchantPage
                defaultMerchant={transactionMerchant}
                isPolicyExpenseChat={isPolicyExpenseChat}
                onSubmit={(transactionChanges) => {
                    const newTrimmedMerchant = transactionChanges.merchant.trim();

                    // In case the merchant hasn't been changed, do not make the API request.
                    // In case the merchant has been set to empty string while current merchant is partial, do nothing too.
                    if (newTrimmedMerchant === transactionMerchant || (newTrimmedMerchant === '' && transactionMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) {
                        Navigation.dismissModal();
                        return;
                    }

                    // This is possible only in case of IOU requests.
                    if (newTrimmedMerchant === '') {
                        editMoneyRequest({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});
                        return;
                    }
                    editMoneyRequest({merchant: newTrimmedMerchant});
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.CATEGORY && shouldShowCategories) {
        return (
            <EditRequestCategoryPage
                defaultCategory={transactionCategory}
                policyID={lodashGet(report, 'policyID', '')}
                onSubmit={(transactionChanges) => {
                    let updatedCategory = transactionChanges.category;
                    // In case the same category has been selected, do reset of the category.
                    if (transactionCategory === updatedCategory) {
                        updatedCategory = '';
                    }
                    editMoneyRequest({category: updatedCategory});
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.TAG && shouldShowTags) {
        return (
            <EditRequestTagPage
                defaultTag={transactionTag}
                tagName={tagListName}
                policyID={lodashGet(report, 'policyID', '')}
                onSubmit={saveTag}
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
