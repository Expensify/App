import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CategoryPicker from '../../components/CategoryPicker';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../reportPropTypes';
import * as IOU from '../../libs/actions/IOU';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import {iouPropTypes, iouDefaultProps} from './propTypes';

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

    /* Onyx Props */
    /** The report currently being used */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,
};

const defaultProps = {
    report: {},
    iou: iouDefaultProps,
};

function MoneyRequestCategoryPage({route, report, iou}) {
    const {translate} = useLocalize();

    const reportID = lodashGet(route, 'params.reportID', '');
    const iouType = lodashGet(route, 'params.iouType', '');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        if (category.searchText === iou.category) {
            IOU.resetMoneyRequestCategory();
        } else {
            IOU.setMoneyRequestCategory(category.searchText);
        }

        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MoneyRequestCategoryPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={navigateBack}
            />
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
            <CategoryPicker
                selectedCategory={iou.category}
                policyID={report.policyID}
                onSubmit={updateCategory}
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
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({route, iou}) => {
                const reportID = IOU.getIOUReportID(iou, route);

                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
)(MoneyRequestCategoryPage);
