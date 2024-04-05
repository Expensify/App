import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import categoryPropTypes from '@components/categoryPropTypes';
import TagPicker from '@components/TagPicker';
import tagPropTypes from '@components/tagPropTypes';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {canEditMoneyRequest} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import {policyPropTypes} from '@pages/workspace/withPolicy';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: transactionPropTypes,

    /** The report currently being used */
    report: reportPropTypes,

    /** The policy of the report */
    policy: policyPropTypes.policy,

    /** The category configuration of the report's policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** The actions from the parent report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,

        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    report: {},
    policy: null,
    policyTags: null,
    policyCategories: null,
    transaction: {},
    splitDraftTransaction: {},
    reportActions: {},
};

function IOURequestStepTag({
    policy,
    policyCategories,
    policyTags,
    report,
    route: {
        params: {action, tagIndex: rawTagIndex, transactionID, backTo, iouType, reportActionID},
    },
    transaction,
    splitDraftTransaction,
    reportActions,
    session,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagListIndex = Number(rawTagIndex);
    const policyTagListName = PolicyUtils.getTagListName(policyTags, tagListIndex);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const currentTransaction = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionTag = TransactionUtils.getTag(currentTransaction);
    const tag = TransactionUtils.getTag(currentTransaction, tagListIndex);
    const reportAction = reportActions[report.parentReportActionID || reportActionID];
    const canEditSplitBill = isSplitBill && reportAction && session.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    const shouldShowTag = ReportUtils.isGroupPolicy(report) && (transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists));

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !shouldShowTag || (isEditing && (isSplitBill ? !canEditSplitBill : !canEditMoneyRequest(reportAction)));

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} selectedTag
     * @param {String} selectedTag.searchText
     */
    const updateTag = (selectedTag) => {
        const isSelectedTag = selectedTag.searchText === tag;
        const updatedTag = IOUUtils.insertTagIntoTransactionTagsString(transactionTag, isSelectedTag ? '' : selectedTag.searchText, tagListIndex);
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transactionID, {tag: updatedTag});
            navigateBack();
            return;
        }
        if (isEditing) {
            IOU.updateMoneyRequestTag(transactionID, report.reportID, updatedTag, policy, policyTags, policyCategories);
            Navigation.dismissModal();
            return;
        }
        IOU.setMoneyRequestTag(transactionID, updatedTag);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={policyTagListName}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepTag.displayName}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            {({insets}) => (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection')}</Text>
                    <TagPicker
                        policyID={report.policyID}
                        tagListName={policyTagListName}
                        tagListIndex={tagListIndex}
                        selectedTag={tag}
                        insets={insets}
                        onSubmit={updateTag}
                    />
                </>
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepTag.displayName = 'IOURequestStepTag';
IOURequestStepTag.propTypes = propTypes;
IOURequestStepTag.defaultProps = defaultProps;

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        splitDraftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
            },
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
        reportActions: {
            key: ({
                report,
                route: {
                    params: {action, iouType},
                },
            }) => {
                let reportID = '0';
                if (action === CONST.IOU.ACTION.EDIT) {
                    reportID = iouType === CONST.IOU.TYPE.SPLIT ? report.reportID : report.parentReportID;
                }
                return `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
            },
            canEvict: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(IOURequestStepTag);
