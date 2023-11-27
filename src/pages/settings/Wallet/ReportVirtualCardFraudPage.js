import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useThemeStyles from '@styles/useThemeStyles';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import assignedCardPropTypes from './assignedCardPropTypes';

const propTypes = {
    /* Onyx Props */
    formData: PropTypes.shape({
        isLoading: PropTypes.bool,
    }),
    cardList: PropTypes.objectOf(assignedCardPropTypes),
    /** The parameters needed to authenticate with a short-lived token are in the URL */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Domain string */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    cardList: {},
    formData: {},
};

function ReportVirtualCardFraudPage({
    route: {
        params: {domain},
    },
    cardList,
    formData,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const virtualCard = _.find(domainCards, (card) => card.isVirtual) || {};
    const virtualCardError = ErrorUtils.getLatestErrorMessage(virtualCard) || '';

    const prevIsLoading = usePrevious(formData.isLoading);

    useEffect(() => {
        if (!prevIsLoading || formData.isLoading) {
            return;
        }
        if (!_.isEmpty(virtualCard.errors)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain));
    }, [domain, formData.isLoading, prevIsLoading, virtualCard.errors]);

    if (_.isEmpty(virtualCard)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={ReportVirtualCardFraudPage.displayName}>
            <HeaderWithBackButton
                title={translate('reportFraudPage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain))}
            />
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <Text style={[styles.baseFontStyle, styles.mh5]}>{translate('reportFraudPage.description')}</Text>
                <FormAlertWithSubmitButton
                    isAlertVisible={Boolean(virtualCardError)}
                    onSubmit={() => Card.reportVirtualExpensifyCardFraud(virtualCard.cardID)}
                    message={virtualCardError}
                    isLoading={formData.isLoading}
                    buttonText={translate('reportFraudPage.deactivateCard')}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportVirtualCardFraudPage.propTypes = propTypes;
ReportVirtualCardFraudPage.defaultProps = defaultProps;
ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';

export default withOnyx({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    formData: {
        key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
    },
})(ReportVirtualCardFraudPage);
