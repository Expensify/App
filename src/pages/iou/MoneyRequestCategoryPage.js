import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';

const propTypes = {
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** TODO: Comment */
            iouType: PropTypes.string,

            /** TODO: Comment */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

function MoneyRequestCategoryPage({route}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        const iouType = lodashGet(route, 'params.iouType', '');
        const reportID = lodashGet(route, 'params.reportID', '');

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
        </ScreenWrapper>
    );
}

MoneyRequestCategoryPage.displayName = 'MoneyRequestCategoryPage';
MoneyRequestCategoryPage.propTypes = propTypes;

export default MoneyRequestCategoryPage;
