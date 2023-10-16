import React, {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashValues from 'lodash/values';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as PolicyUtils from '../libs/PolicyUtils';
import * as TransactionUtils from '../libs/TransactionUtils';
import * as Policy from '../libs/actions/Policy';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import Permissions from '../libs/Permissions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../components/withCurrentUserPersonalDetails';
import tagPropTypes from '../components/tagPropTypes';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import EditRequestMerchantPage from './EditRequestMerchantPage';
import EditRequestCreatedPage from './EditRequestCreatedPage';
import EditRequestAmountPage from './EditRequestAmountPage';
import EditRequestReceiptPage from './EditRequestReceiptPage';
import reportPropTypes from './reportPropTypes';
import EditRequestDistancePage from './EditRequestDistancePage';
import EditRequestCategoryPage from './EditRequestCategoryPage';
import EditRequestTagPage from './EditRequestTagPage';
import categoryPropTypes from '../components/categoryPropTypes';
import ScreenWrapper from '../components/ScreenWrapper';
import transactionPropTypes from '../components/transactionPropTypes';

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
    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The report object for the thread report */
    report: reportPropTypes,

    /** The parent report object for the thread report */
    parentReport: reportPropTypes,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** The original transaction that is being edited */
    transaction: transactionPropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    betas: [],
    report: {},
    parentReport: {},
    policy: null,
    session: {
        email: null,
    },
    policyCategories: {},
    policyTags: {},
    transaction: {},
};

function EditRequestPage({betas, report, route, parentReport, policy, session, policyCategories, policyTags, parentReportActions, transaction}) {
    const parentReportActionID = lodashGet(report, 'parentReportActionID', '0');
    const parentReportAction = lodashGet(parentReportActions, parentReportActionID);
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

    const isDeleted = ReportActionsUtils.isDeletedAction(parentReportAction);
    const isSettled = ReportUtils.isSettled(parentReport.reportID);

    const isAdmin = Policy.isAdminOfFreePolicy([policy]) && ReportUtils.isExpenseReport(parentReport);
    const isRequestor = ReportUtils.isMoneyRequestReport(parentReport) && lodashGet(session, 'accountID', null) === parentReportAction.actorAccountID;
    const canEdit = !isSettled && !isDeleted && (isAdmin || isRequestor);

    // For now, it always defaults to the first tag of the policy
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const tagListName = PolicyUtils.getTagListName(policyTags);

    // A flag for verifying that the current report is a sub-report of a workspace chat
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);

    // A flag for showing the categories page
    const shouldShowCategories = isPolicyExpenseChat && Permissions.canUseCategories(betas) && (transactionCategory || OptionsListUtils.hasEnabledOptions(lodashValues(policyCategories)));

    // A flag for showing the tags page
    const shouldShowTags = isPolicyExpenseChat && Permissions.canUseTags(betas) && (transactionTag || OptionsListUtils.hasEnabledOptions(lodashValues(policyTagList)));

    // Dismiss the modal when the request is paid or deleted
    useEffect(() => {
        if (canEdit) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }, [canEdit]);

    // Update the transaction object and close the modal
    function editMoneyRequest(transactionChanges) {
        if (TransactionUtils.isDistanceRequest(transaction)) {
            IOU.updateDistanceRequest(transaction.transactionID, report.reportID, transactionChanges);
        } else {
            IOU.editMoneyRequest(transaction.transactionID, report.reportID, transactionChanges);
        }
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
                    const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
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
    withCurrentUserPersonalDetails,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
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
