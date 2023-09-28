import React, {useState, useEffect} from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import styles from '../../../styles/styles';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import SingleOptionSelector from '../../../components/SingleOptionSelector';
import useLocalize from '../../../hooks/useLocalize';
import Text from '../../../components/Text';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import usePrivatePersonalDetails from '../../../hooks/usePrivatePersonalDetails';
import assignedCardPropTypes from './assignedCardPropTypes';
import * as CardUtils from '../../../libs/CardUtils';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import usePrevious from '../../../hooks/usePrevious';
import * as FormActions from '../../../libs/actions/FormActions';
import * as CardActions from '../../../libs/actions/Card';

/** Options for reason selector */
const OPTIONS = [
    {
        key: 'damaged',
        label: 'reportCardLostOrDamaged.cardDamaged',
    },
    {
        key: 'stolen',
        label: 'reportCardLostOrDamaged.cardLostOrStolen',
    },
];

const propTypes = {
    /** Onyx form data */
    formData: PropTypes.shape({
        isLoading: PropTypes.bool,
    }),
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),
    /** User's cards list */
    cardList: PropTypes.objectOf(assignedCardPropTypes),
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Domain string */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    formData: {},
    privatePersonalDetails: {
        address: {
            street: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
    cardList: {},
};

function ReportCardLostPage({
    privatePersonalDetails,
    cardList,
    route: {
        params: {domain},
    },
    formData,
}) {
    usePrivatePersonalDetails();

    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const physicalCard = _.find(domainCards, (card) => !card.isVirtual) || {};

    const {translate} = useLocalize();

    const [reason, setReason] = useState(OPTIONS[0]);
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);

    const prevIsLoading = usePrevious(formData.isLoading);

    const formattedAddress = CardUtils.getFormattedAddress(privatePersonalDetails);

    useEffect(() => {
        if (prevIsLoading && !formData.isLoading && _.isEmpty(physicalCard.errors)) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARDS.getRoute(domain));
        }

        if (formData.isLoading && _.isEmpty(physicalCard.errors)) {
            return;
        }

        FormActions.setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD, physicalCard.errors);
    }, [domain, formData.isLoading, prevIsLoading, physicalCard.errors]);

    const onSubmit = () => {
        if (!isReasonConfirmed) {
            setIsReasonConfirmed(true);

            setShouldShowAddressError(false);

            return;
        }

        if (!formattedAddress) {
            setShouldShowAddressError(true);
            return;
        }

        if (formattedAddress) {
            CardActions.requestReplacementExpensifyCard(physicalCard.cardID, reason);
        }
    };

    const handleOptionSelect = (option) => {
        setReason(option);
    };

    if (_.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <Form
                formID={ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD}
                onSubmit={onSubmit}
                submitButtonText={isReasonConfirmed ? translate('reportCardLostOrDamaged.deactivateCardButton') : translate('reportCardLostOrDamaged.nextButtonLabel')}
                style={styles.flexGrow1}
                buttonStyles={[styles.ph5]}
            >
                {isReasonConfirmed ? (
                    <>
                        <Text style={[styles.textHeadline, styles.mb3, styles.mh5]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text>
                        <MenuItemWithTopDescription
                            inputID="address"
                            title={formattedAddress}
                            description={translate('reportCardLostOrDamaged.address')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                            numberOfLinesTitle={2}
                        />
                        {shouldShowAddressError && <Text style={[styles.mh5, styles.formError]}>{translate('reportCardLostOrDamaged.addressError')}</Text>}
                        <Text style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.currentCardInfo')}</Text>
                    </>
                ) : (
                    <View style={styles.mh5}>
                        <Text style={[styles.textHeadline, styles.pre]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text>
                        <SingleOptionSelector
                            options={OPTIONS}
                            selectedOptionKey={reason.key}
                            onSelectOption={handleOptionSelect}
                        />
                    </View>
                )}
            </Form>
        </ScreenWrapper>
    );
}

ReportCardLostPage.propTypes = propTypes;
ReportCardLostPage.defaultProps = defaultProps;
ReportCardLostPage.displayName = 'ReportCardLostPage';

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    formData: {
        key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD,
    },
})(ReportCardLostPage);
