import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CategoryPicker from '../../components/CategoryPicker';
import ONYXKEYS from '../../ONYXKEYS';
import reportPropTypes from '../reportPropTypes';

const propTypes = {
    /** TODO: Comment */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** TODO: Comment */
            iouType: PropTypes.string,

            /** TODO: Comment */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** TODO: Comment */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function MoneyRequestCategoryPage({route, report}) {
    const {translate} = useLocalize();

    const reportID = lodashGet(route, 'params.reportID', '');

    const navigateBack = () => {
        const iouType = lodashGet(route, 'params.iouType', '');

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

            <CategoryPicker policyID={report.policyID} />
        </ScreenWrapper>
    );
}

MoneyRequestCategoryPage.displayName = 'MoneyRequestCategoryPage';
MoneyRequestCategoryPage.propTypes = propTypes;
MoneyRequestCategoryPage.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(MoneyRequestCategoryPage);
