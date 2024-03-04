import PropTypes from 'prop-types';
import React from 'react';
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
import * as PolicyUtils from '@libs/PolicyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
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

    /** The report currently being used */
    report: reportPropTypes,

    /** The policy of the report */
    policy: policyPropTypes.policy,

    /** The category configuration of the report's policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,
};

const defaultProps = {
    report: {},
    policy: null,
    policyTags: null,
    policyCategories: null,
    transaction: {},
};

function IOURequestStepTag({
    policy,
    policyCategories,
    policyTags,
    report,
    route: {
        params: {action, tagIndex: rawTagIndex, transactionID, backTo, iouType},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagIndex = Number(rawTagIndex);
    const policyTagListName = PolicyUtils.getTagListName(policyTags, tagIndex);
    const transactionTag = TransactionUtils.getTag(transaction);
    const tag = TransactionUtils.getTag(transaction, tagIndex);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} selectedTag
     * @param {String} selectedTag.searchText
     */
    const updateTag = (selectedTag) => {
        const isSelectedTag = selectedTag.searchText === tag;
        const updatedTag = IOUUtils.insertTagIntoTransactionTagsString(transactionTag, isSelectedTag ? '' : selectedTag.searchText, tagIndex);
        if (isSplitBill && isEditing) {
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
        >
            {({insets}) => (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: policyTagListName})}</Text>

                    <TagPicker
                        policyID={report.policyID}
                        tag={policyTagListName}
                        tagIndex={tagIndex}
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
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepTag);
