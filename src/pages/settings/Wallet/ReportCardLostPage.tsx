import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleOptionSelector from '@components/SingleOptionSelector';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {setErrors} from '@libs/actions/FormActions';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {clearCardListErrors, requestReplacementExpensifyCard} from '@userActions/Card';
import type {ReplacementReason} from '@userActions/Card';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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

type ReportCardLostPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED>;

function ReportCardLostPage({
    route: {
        params: {cardID = ''},
    },
}: ReportCardLostPageProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, {canBeMissing: true});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});

    const [reason, setReason] = useState<Option>();
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const physicalCard = cardList?.[cardID];
    const validateError = getLatestErrorMessageField(physicalCard);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const prevIsLoading = usePrevious(formData?.isLoading);

    const {paddingBottom} = useSafeAreaPaddings();

    const formattedAddress = getFormattedAddress(privatePersonalDetails ?? {});
    const primaryLogin = account?.primaryLogin ?? '';

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        if (!isEmptyObject(physicalCard?.errors) || !(prevIsLoading && !formData?.isLoading)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    }, [formData?.isLoading, prevIsLoading, physicalCard?.errors, cardID]);

    useEffect(() => {
        resetValidateActionCodeSent();
    }, []);

    useEffect(() => {
        if (formData?.isLoading && isEmptyObject(physicalCard?.errors)) {
            return;
        }

        setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, physicalCard?.errors ?? {});
    }, [formData?.isLoading, physicalCard?.errors]);

    const handleValidateCodeEntered = useCallback(
        (validateCode: string) => {
            if (!physicalCard) {
                return;
            }
            requestReplacementExpensifyCard(physicalCard.cardID, reason?.key as ReplacementReason, validateCode);
        },
        [physicalCard, reason?.key],
    );

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
        setIsValidateCodeActionModalVisible(true);
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
            <View style={[styles.flex1, styles.justifyContentBetween, styles.pt3, !paddingBottom ? styles.pb5 : null]}>
                {isReasonConfirmed ? (
                    <>
                        <View>
                            <Text style={[styles.textHeadline, styles.mb3, styles.mh5]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text>
                            <MenuItemWithTopDescription
                                title={formattedAddress}
                                description={translate('reportCardLostOrDamaged.address')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_ADDRESS)}
                                numberOfLinesTitle={2}
                            />
                            {isDamaged ? (
                                <Text style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.cardDamagedInfo')}</Text>
                            ) : (
                                <Text style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.cardLostOrStolenInfo')}</Text>
                            )}
                        </View>
                        <View style={[styles.mh5]}>
                            <FormAlertWithSubmitButton
                                isAlertVisible={shouldShowAddressError}
                                onSubmit={handleSubmitSecondStep}
                                message={translate('reportCardLostOrDamaged.addressError')}
                                isLoading={formData?.isLoading}
                                buttonText={isDamaged ? translate('reportCardLostOrDamaged.shipNewCardButton') : translate('reportCardLostOrDamaged.deactivateCardButton')}
                            />
                        </View>
                        <ValidateCodeActionModal
                            handleSubmitForm={handleValidateCodeEntered}
                            sendValidateCode={requestValidateCodeAction}
                            validateCodeActionErrorField="replaceLostCard"
                            validateError={validateError}
                            clearError={() => clearCardListErrors(physicalCard.cardID)}
                            onClose={() => setIsValidateCodeActionModalVisible(false)}
                            isVisible={isValidateCodeActionModalVisible}
                            title={translate('cardPage.validateCardTitle')}
                            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
                        />
                    </>
                ) : (
                    <>
                        <View style={[styles.mh5]}>
                            <Text style={[styles.textHeadline, styles.mr5]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text>
                            <SingleOptionSelector
                                options={OPTIONS}
                                selectedOptionKey={reason?.key}
                                onSelectOption={handleOptionSelect}
                            />
                        </View>
                        <View style={[styles.mh5]}>
                            <FormAlertWithSubmitButton
                                isAlertVisible={shouldShowReasonError}
                                onSubmit={handleSubmitFirstStep}
                                message={translate('reportCardLostOrDamaged.reasonError')}
                                buttonText={translate('reportCardLostOrDamaged.nextButtonLabel')}
                            />
                        </View>
                    </>
                )}
            </View>
        </ScreenWrapper>
    );
}

ReportCardLostPage.displayName = 'ReportCardLostPage';

export default ReportCardLostPage;
