import React, {useMemo, useState} from 'react';
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
};

const defaultProps = {
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
};

function ReportCardLostPage({privatePersonalDetails}) {
    usePrivatePersonalDetails();

    const privateDetails = privatePersonalDetails || {};
    const address = privateDetails.address || {};

    const {translate} = useLocalize();

    const [reason, setReason] = useState(OPTIONS[0]);
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);

    /**
     * Applies common formatting to each piece of an address
     *
     * @param {String} piece
     * @returns {String}
     */
    const formatPiece = (piece) => (piece ? `${piece}, ` : '');

    /**
     * Formats an address object into an easily readable string
     *
     * @returns {String}
     */
    const formattedAddress = useMemo(() => {
        const [street1, street2] = (address.street || '').split('\n');
        const formatted = formatPiece(street1) + formatPiece(street2) + formatPiece(address.city) + formatPiece(address.state) + formatPiece(address.zip) + formatPiece(address.country);

        // Remove the last comma of the address
        return formatted.trim().replace(/,$/, '');
    }, [address.city, address.country, address.state, address.street, address.zip]);

    const validate = () => {
        if (!isReasonConfirmed) {
            setShouldShowAddressError(false);
            return {};
        }

        if (!formattedAddress) {
            setShouldShowAddressError(true);
            return {};
        }
    };

    const onSubmit = () => {
        if (!isReasonConfirmed) {
            setIsReasonConfirmed(true);
            return;
        }

        if (!formattedAddress) {
            // TODO: submit
        }
    };

    const handleOptionSelect = (option) => {
        setReason(option);
    };

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <Form
                formID={ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_LOST}
                validate={validate}
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
                        {shouldShowAddressError && <Text style={styles.mh5}>Address missing</Text>}
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
})(ReportCardLostPage);
