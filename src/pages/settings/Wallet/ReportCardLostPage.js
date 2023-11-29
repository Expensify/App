import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleOptionSelector from '@components/SingleOptionSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useThemeStyles from '@styles/useThemeStyles';
import * as CardActions from '@userActions/Card';
import * as FormActions from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import assignedCardPropTypes from './assignedCardPropTypes';

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
    const styles = useThemeStyles();
    usePrivatePersonalDetails();

    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const physicalCard = CardUtils.findPhysicalCard(domainCards);

    const {translate} = useLocalize();

    const [reason, setReason] = useState();
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const prevIsLoading = usePrevious(formData.isLoading);

    const formattedAddress = PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails);

    useEffect(() => {
        if (!_.isEmpty(physicalCard.errors) || !(prevIsLoading && !formData.isLoading)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARDS.getRoute(domain));
    }, [domain, formData.isLoading, prevIsLoading, physicalCard.errors]);

    useEffect(() => {
        if (formData.isLoading && _.isEmpty(physicalCard.errors)) {
            return;
        }

        FormActions.setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, physicalCard.errors);
    }, [formData.isLoading, physicalCard.errors]);

    if (_.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    const handleSubmitFirstStep = () => {
        if (!reason) {
            setShouldShowReasonError(true);
            return;
        }

        setIsReasonConfirmed(true);
        setShouldShowAddressError(false);
        setShouldShowReasonError(false);
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
        setShouldShowReasonError(false);
    };

    const handleBackButtonPress = () => {
        if (isReasonConfirmed) {
            setIsReasonConfirmed(false);
            return;
        }

        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={ReportCardLostPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.flex1, styles.justifyContentBetween, styles.pt3]}>
                {isReasonConfirmed ? (
                    <>
                        <View>
                            <Text style={[styles.textHeadline, styles.mb3, styles.mh5]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text>
                            <MenuItemWithTopDescription
                                inputID="address"
                                title={formattedAddress}
                                description={translate('reportCardLostOrDamaged.address')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS)}
                                numberOfLinesTitle={2}
                            />
                            <Text style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.currentCardInfo')}</Text>
                        </View>
                        <FormAlertWithSubmitButton
                            isAlertVisible={shouldShowAddressError}
                            onSubmit={handleSubmitSecondStep}
                            message={translate('reportCardLostOrDamaged.addressError')}
                            isLoading={formData.isLoading}
                            buttonText={translate('reportCardLostOrDamaged.deactivateCardButton')}
                        />
                    </>
                ) : (
                    <>
                        <View style={styles.mh5}>
                            <Text style={[styles.textHeadline, styles.mr5]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text>
                            <SingleOptionSelector
                                options={OPTIONS}
                                selectedOptionKey={reason && reason.key}
                                onSelectOption={handleOptionSelect}
                            />
                        </View>
                        <FormAlertWithSubmitButton
                            isAlertVisible={shouldShowReasonError}
                            onSubmit={handleSubmitFirstStep}
                            message={translate('reportCardLostOrDamaged.reasonError')}
                            buttonText={translate('reportCardLostOrDamaged.nextButtonLabel')}
                        />
                    </>
                )}
            </View>
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
