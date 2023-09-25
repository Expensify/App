import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import TagPicker from '../../components/TagPicker';
import Text from '../../components/Text';
import tagPropTypes from '../../components/tagPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../reportPropTypes';
import styles from '../../styles/styles';
import {iouPropTypes, iouDefaultProps} from './propTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen via route :iouType/new/tag/:reportID? */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx props */
    /** The report currently being used */
    report: reportPropTypes,

    /** Collection of tags attached to a policy */
    policyTags: PropTypes.objectOf(
        PropTypes.shape({
            name: PropTypes.string,
            tags: PropTypes.objectOf(tagPropTypes),
        }),
    ),

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,
};

const defaultProps = {
    report: {},
    policyTags: {},
    iou: iouDefaultProps,
};

function MoneyRequestTagPage({route, report, policyTags, iou}) {
    const {translate} = useLocalize();

    const iouType = lodashGet(route, 'params.iouType', '');

    // Fetches the first tag list of the policy
    const tagListKey = _.first(_.keys(policyTags));
    const tagList = lodashGet(policyTags, tagListKey, {});
    const tagListName = lodashGet(tagList, 'name', translate('common.tag'));

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report.reportID));
    };

    const updateTag = (selectedTag) => {
        if (selectedTag.searchText === iou.tag) {
            IOU.resetMoneyRequestTag();
        } else {
            IOU.setMoneyRequestTag(selectedTag.searchText);
        }
        navigateBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MoneyRequestTagPage.displayName}
        >
            <HeaderWithBackButton
                title={tagListName}
                onBackButtonPress={navigateBack}
            />
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: tagListName})}</Text>
            <TagPicker
                policyID={report.policyID}
                tag={tagListKey}
                selectedTag={iou.tag}
                onSubmit={updateTag}
            />
        </ScreenWrapper>
    );
}

MoneyRequestTagPage.displayName = 'MoneyRequestTagPage';
MoneyRequestTagPage.propTypes = propTypes;
MoneyRequestTagPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
        },
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(MoneyRequestTagPage);
