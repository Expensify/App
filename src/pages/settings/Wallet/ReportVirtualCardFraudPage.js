import React, {useEffect} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../../ROUTES';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import useLocalize from '../../../hooks/useLocalize';
import * as Card from '../../../libs/actions/Card';
import assignedCardPropTypes from './assignedCardPropTypes';
import * as CardUtils from '../../../libs/CardUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import usePrevious from '../../../hooks/usePrevious';
import FormAlertWithSubmitButton from '../../../components/FormAlertWithSubmitButton';
import * as ErrorUtils from '../../../libs/ErrorUtils';

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
