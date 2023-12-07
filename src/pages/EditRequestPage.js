import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo} from 'react';
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

    /** The parent report object for the thread report */
    parentReport: reportPropTypes,

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
    parentReport: {},
    policyCategories: {},
    policyTags: {},
    parentReportActions: {},
    transaction: {},
};

function EditRequestPage({report, route, parentReport, policyCategories, policyTags, parentReportActions, transaction}) {
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

    // Take only the YYYY-MM-DD value
    const transactionCreated = TransactionUtils.getCreated(transaction);
    const fieldToEdit = lodashGet(route, ['params', 'field'], '');

    // For now, it always defaults to the first tag of the policy
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const tagListName = PolicyUtils.getTagListName(policyTags);

    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    // A flag for showing the categories page
    const shouldShowCategories = isPolicyExpenseChat && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));

    // A flag for showing the tags page
    const shouldShowTags = isPolicyExpenseChat && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagList)));

    // Decides whether to allow or disallow editing a money request
    useEffect(() => {
        // Do not dismiss the modal, when a current user can edit this property of the money request.
        if (ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, parentReport.reportID, fieldToEdit)) {
            return;
        }

        // Dismiss the modal when a current user cannot edit a money request.
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }, [parentReportAction, parentReport.reportID, fieldToEdit]);

    // Update the transaction object and close the modal
    function editMoneyRequest(transactionChanges) {
        IOU.editMoneyRequest(transaction, report.reportID, transactionChanges);
        Navigation.dismissModal(report.reportID);
    }

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
                defaultCreated={transactionCreated}
                onSubmit={(transactionChanges) => {
                    // In case the date hasn't been changed, do not make the API request.
                    if (transactionChanges.created === transactionCreated) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest(transactionChanges);
                }}
            />
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT) {
        return (
            <EditRequestAmountPage
                defaultAmount={transactionAmount}
                defaultCurrency={defaultCurrency}
                reportID={report.reportID}
                onSubmit={(transactionChanges) => {
                    const amount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(transactionChanges));
                    // In case the amount hasn't been changed, do not make the API request.
                    if (amount === transactionAmount && transactionCurrency === defaultCurrency) {
                        Navigation.dismissModal();
                        return;
                    }
                    // Temporarily disabling currency editing and it will be enabled as a quick follow up
                    editMoneyRequest({
                        amount,
                        currency: defaultCurrency,
                    });
                }}
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
                onSubmit={(transactionChanges) => {
                    // In case the merchant hasn't been changed, do not make the API request.
                    if (transactionChanges.merchant.trim() === transactionMerchant) {
                        Navigation.dismissModal();
                        return;
                    }
                    editMoneyRequest({merchant: transactionChanges.merchant.trim()});
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
                onSubmit={(transactionChanges) => {
                    let updatedTag = transactionChanges.tag;

                    // In case the same tag has been selected, reset the tag.
                    if (transactionTag === updatedTag) {
                        updatedTag = '';
                    }
                    editMoneyRequest({tag: updatedTag, tagListName});
                }}
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
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
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
