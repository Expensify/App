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
import * as PersonalDetailsUtils from '../../../libs/PersonalDetailsUtils';
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
    const physicalCard = CardUtils.findPhysicalCard(domainCards);

    const {translate} = useLocalize();

    const [reason, setReason] = useState(OPTIONS[0]);
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);

    const prevIsLoading = usePrevious(formData.isLoading);

    const formattedAddress = PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails);

    useEffect(() => {
        if (prevIsLoading && !formData.isLoading && _.isEmpty(physicalCard.errors)) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARDS.getRoute(domain));
        }
    }, [domain, formData.isLoading, prevIsLoading, physicalCard.errors]);

    useEffect(() => {
        if (!(formData.isLoading && _.isEmpty(physicalCard.errors))) {
            FormActions.setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, physicalCard.errors);
        }
    }, [formData.isLoading, physicalCard.errors]);

    if (_.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    const handleSubmitFirstStep = () => {
        setIsReasonConfirmed(true);
        setShouldShowAddressError(false);
    };

    const handleSubmitSecondStep = () => {
        if (!formattedAddress) {
            setShouldShowAddressError(true);
            return;
        }

        CardActions.requestReplacementExpensifyCard(physicalCard.cardID, reason);
    };

    const handleOptionSelect = (option) => {
        setReason(option);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ReportCardLostPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <Form
                formID={ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM}
                onSubmit={isReasonConfirmed ? handleSubmitSecondStep : handleSubmitFirstStep}
                submitButtonText={isReasonConfirmed ? translate('reportCardLostOrDamaged.deactivateCardButton') : translate('reportCardLostOrDamaged.nextButtonLabel')}
                style={[styles.flexGrow1, styles.ph5]}
            >
                {isReasonConfirmed ? (
                    <>
                        <Text style={[styles.textHeadline, styles.mb3]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text>
                        <MenuItemWithTopDescription
                            inputID="address"
                            title={formattedAddress}
                            description={translate('reportCardLostOrDamaged.address')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                            numberOfLinesTitle={2}
                            wrapperStyle={styles.ph0}
                        />
                        {shouldShowAddressError && <Text style={styles.formError}>{translate('reportCardLostOrDamaged.addressError')}</Text>}
                        <Text style={styles.mt3}>{translate('reportCardLostOrDamaged.currentCardInfo')}</Text>
                    </>
                ) : (
                    <View>
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
        key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
    },
})(ReportCardLostPage);
