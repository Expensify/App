import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
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
};

const defaultProps = {
    report: {},
    policyTags: {},
};

function MoneyRequestTagPage({route, report, policyTags}) {
    const {translate} = useLocalize();

    const iouType = lodashGet(route, 'params.iouType', '');

    // Fetches the first tag list of the policy
    const tagListKey = _.first(_.keys(policyTags));
    const tagList = lodashGet(policyTags, tagListKey, {});
    const tagListName = lodashGet(tagList, 'name', '');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, lodashGet(report, 'reportID', '')));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={tagListName || translate('common.tag')}
                onBackButtonPress={navigateBack}
            />
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagListName} || translate('common.tag'))}</Text>
            <TagPicker
                policyID={report.policyID}
                reportID={report.reportID}
                tag={tagListKey}
                iouType={iouType}
            />
        </ScreenWrapper>
    );
}

MoneyRequestTagPage.displayName = 'MoneyRequestTagPage';
MoneyRequestTagPage.propTypes = propTypes;
MoneyRequestTagPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    withOnyx({
        report: {
            // Fetch report ID from IOU participants if no report ID is set in route
            key: ({route, iou}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '') || lodashGet(iou, 'participants.0.reportID', '')}`,
        },
    }),
    withOnyx({
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(MoneyRequestTagPage);
