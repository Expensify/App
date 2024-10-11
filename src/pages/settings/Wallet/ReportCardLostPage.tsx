import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleOptionSelector from '@components/SingleOptionSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type {ReplacementReason} from '@userActions/Card';
import * as CardActions from '@userActions/Card';
import * as FormActions from '@userActions/FormActions';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportPhysicalCardForm} from '@src/types/form';
import type {Card, PrivatePersonalDetails} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const OPTIONS_KEYS = {
    DAMAGED: 'damaged',
    STOLEN: 'stolen',
};

type Option = {
    key: string;
    label: TranslationPaths;
};

/** Options for reason selector */
const OPTIONS: Option[] = [
    {
        key: OPTIONS_KEYS.DAMAGED,
        label: 'reportCardLostOrDamaged.cardDamaged',
    },
    {
        key: OPTIONS_KEYS.STOLEN,
        label: 'reportCardLostOrDamaged.cardLostOrStolen',
    },
];

type ReportCardLostPageOnyxProps = {
    /** Onyx form data */
    formData: OnyxEntry<ReportPhysicalCardForm>;

    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;

    /** User's cards list */
    cardList: OnyxEntry<Record<string, Card>>;
};

type ReportCardLostPageProps = ReportCardLostPageOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED>;

function ReportCardLostPage({
    privatePersonalDetails = {
        addresses: [
            {
                street: '',
                street2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            },
        ],
    },
    cardList = {},
    route: {
        params: {cardID = ''},
    },
    formData,
}: ReportCardLostPageProps) {
    const styles = useThemeStyles();

    const physicalCard = cardList?.[cardID];

    const {translate} = useLocalize();

    const [reason, setReason] = useState<Option>();
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const prevIsLoading = usePrevious(formData?.isLoading);

    const {paddingBottom} = useStyledSafeAreaInsets();

    const formattedAddress = PersonalDetailsUtils.getFormattedAddress(privatePersonalDetails ?? {});

    useEffect(() => {
        if (!isEmptyObject(physicalCard?.errors) || !(prevIsLoading && !formData?.isLoading)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID));
    }, [formData?.isLoading, prevIsLoading, physicalCard?.errors, cardID]);

    useEffect(() => {
        if (formData?.isLoading && isEmptyObject(physicalCard?.errors)) {
            return;
        }

        FormActions.setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, physicalCard?.errors ?? {});
    }, [formData?.isLoading, physicalCard?.errors]);

    if (isEmptyObject(physicalCard)) {
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

        CardActions.requestReplacementExpensifyCard(physicalCard.cardID, reason?.key as ReplacementReason);
    };

    const handleOptionSelect = (option: Option) => {
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

    const isDamaged = reason?.key === OPTIONS_KEYS.DAMAGED;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={ReportCardLostPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.flex1, styles.justifyContentBetween, styles.pt3, styles.mh5, !paddingBottom ? styles.pb5 : null]}>
                {isReasonConfirmed ? (
                    <>
                        <View>
                            <Text style={[styles.textHeadline, styles.mb3]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text>
                            <MenuItemWithTopDescription
                                title={formattedAddress}
                                description={translate('reportCardLostOrDamaged.address')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_ADDRESS)}
                                numberOfLinesTitle={2}
                            />
                            {isDamaged ? (
                                <Text style={[styles.mt3]}>{translate('reportCardLostOrDamaged.cardDamagedInfo')}</Text>
                            ) : (
                                <Text style={[styles.mt3]}>{translate('reportCardLostOrDamaged.cardLostOrStolenInfo')}</Text>
                            )}
                        </View>
                        <FormAlertWithSubmitButton
                            isAlertVisible={shouldShowAddressError}
                            onSubmit={handleSubmitSecondStep}
                            message={translate('reportCardLostOrDamaged.addressError')}
                            isLoading={formData?.isLoading}
                            buttonText={isDamaged ? translate('reportCardLostOrDamaged.shipNewCardButton') : translate('reportCardLostOrDamaged.deactivateCardButton')}
                        />
                    </>
                ) : (
                    <>
                        <View>
                            <Text style={[styles.textHeadline, styles.mr5]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text>
                            <SingleOptionSelector
                                options={OPTIONS}
                                selectedOptionKey={reason?.key}
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

ReportCardLostPage.displayName = 'ReportCardLostPage';

export default withOnyx<ReportCardLostPageProps, ReportCardLostPageOnyxProps>({
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
