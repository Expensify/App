import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as IOU from '../../libs/actions/IOU';
import ONYXKEYS from '../../ONYXKEYS';
import DistanceRequest from '../../components/DistanceRequest';
import reportPropTypes from '../reportPropTypes';
import CONST from '../../CONST';
import {iouPropTypes} from './propTypes';
import ScreenWrapper from '../../components/ScreenWrapper';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import * as IOUUtils from '../../libs/IOUUtils';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Passed from the navigator */
    route: PropTypes.shape({
        /** Parameters the route gets */
        params: PropTypes.shape({
            /** Type of IOU */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)),
            /** Id of the report on which the distance request is being created */
            reportID: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    iou: {},
    report: {},
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
};

// This page comes in this flow: + > Request Money > Distance > Confirmation screen > Select "Distance" row to update the waypoints
// It is functionally the same as NewDistanceRequestPage however it adds a page wrapper and a header.
function NewDistanceRequestUpdateWaypointsPage({iou, report, route}) {
    const iouType = lodashGet(route, 'params.iouType');
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('common.distance')}
                            onBackButonBackButtonPress={() => Navigation.goBack()}
                        />
                        <DistanceRequest
                            report={report}
                            transactionID={iou.transactionID}
                            onSubmit={() => IOU.navigateToNextPage(iou, iouType, report)}
                        />
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

NewDistanceRequestUpdateWaypointsPage.displayName = 'NewDistanceRequestUpdateWaypointsPage';
NewDistanceRequestUpdateWaypointsPage.propTypes = propTypes;
NewDistanceRequestUpdateWaypointsPage.defaultProps = defaultProps;
export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', 0)}`,
    },
})(NewDistanceRequestUpdateWaypointsPage);
