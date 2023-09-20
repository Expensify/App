import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CategoryPicker from '../../components/CategoryPicker';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../reportPropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen via route :iouType/new/category/:reportID? */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report currently being used */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function MoneyRequestCategoryPage({route, report}) {
    const {translate} = useLocalize();

    const reportID = lodashGet(route, 'params.reportID', '');
    const iouType = lodashGet(route, 'params.iouType', '');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={navigateBack}
            />

            <CategoryPicker
                policyID={report.policyID}
                reportID={reportID}
                iouType={iouType}
            />
        </ScreenWrapper>
    );
}

MoneyRequestCategoryPage.displayName = 'MoneyRequestCategoryPage';
MoneyRequestCategoryPage.propTypes = propTypes;
MoneyRequestCategoryPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    withOnyx({
        report: {
            key: ({route, iou}) => {
                let reportID = lodashGet(route, 'params.reportID', '');
                if (!reportID) {
                    // When the money request creation flow is initialized on Global Create, the reportID is not passed as a navigation parameter.
                    // Get the report id from the participants list on the IOU object stored in Onyx.
                    reportID = lodashGet(iou, 'participants.0.reportID', '');
                }
                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
)(MoneyRequestCategoryPage);
