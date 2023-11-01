import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '@styles/styles';
import transactionPropTypes from '@components/transactionPropTypes';
import CONST from '@src/CONST';
import compose from '@libs/compose';
import ROUTES from '@src/ROUTES';
import * as IOU from '@userActions/IOU';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@libs/Navigation/Navigation';
import useLocalize from '@hooks/useLocalize';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import tagPropTypes from '@components/tagPropTypes';
import ONYXKEYS from '@src/ONYXKEYS';
import reportPropTypes from '@pages/reportPropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** The report currently being used */
    report: reportPropTypes,

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,
};

const defaultProps = {
    report: {},
    policyTags: {},
    transaction: {},
};

function IOURequestStepTag({
    policyTags,
    report,
    route: {
        params: {iouType, transactionID, reportID},
    },
    transaction: {tag},
}) {
    const {translate} = useLocalize();

    // Fetches the first tag list of the policy
    const tagListKey = _.first(_.keys(policyTags));
    const policyTagListName = PolicyUtils.getTagListName(policyTags) || translate('common.tag');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} selectedTag
     * @param {String} selectedTag.searchText
     */
    const updateTag = (selectedTag) => {
        IOU.setMoneeRequestTag_temporaryForRefactor(transactionID, selectedTag.searchText);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={policyTagListName}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepTag.displayName}
        >
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: policyTagListName})}</Text>
            <TagPicker
                policyID={report.policyID}
                tag={tagListKey}
                selectedTag={tag || ''}
                onSubmit={updateTag}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepTag.displayName = 'IOURequestStepTag';
IOURequestStepTag.propTypes = propTypes;
IOURequestStepTag.defaultProps = defaultProps;

export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
        },
        transaction: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepTag);
