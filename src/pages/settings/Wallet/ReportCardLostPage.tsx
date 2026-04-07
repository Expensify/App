import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ReplacementReason} from '@libs/actions/Card';
import {setErrors} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const OPTIONS_KEYS = {
    DAMAGED: 'damaged',
    STOLEN: 'stolen',
} satisfies Record<string, ReplacementReason>;

type Option = {
    key: ReplacementReason;
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

    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);
    const cardList = useNonPersonalCardList();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    const [reason, setReason] = useState<Option>();
    const [isReasonConfirmed, setIsReasonConfirmed] = useState(false);
    const [shouldShowAddressError, setShouldShowAddressError] = useState(false);
    const [shouldShowReasonError, setShouldShowReasonError] = useState(false);

    const physicalCard = cardList?.[cardID];

    const {paddingBottom} = useSafeAreaPaddings();

    const formattedAddress = getFormattedAddress(privatePersonalDetails ?? {});

    useEffect(() => {
        if (formData?.isLoading && isEmptyObject(physicalCard?.errors)) {
            return;
        }

        setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, physicalCard?.errors ?? {});
    }, [formData?.isLoading, physicalCard?.errors]);

    if (isEmptyObject(physicalCard) && !formData?.isLoading) {
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
        Navigation.navigate(ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE.getRoute(cardID, reason?.key ?? OPTIONS_KEYS.DAMAGED));
    };

    const handleBackButtonPress = () => {
        if (isReasonConfirmed) {
            setIsReasonConfirmed(false);
            return;
        }

        Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    };

    const isDamaged = reason?.key === OPTIONS_KEYS.DAMAGED;

    const reasonOptions = OPTIONS.map((option) => ({
        text: translate(option.label),
        keyForList: option.key,
        isSelected: reason?.key === option.key,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="ReportCardLostPage"
        >
            <HeaderWithBackButton
                title={translate('reportCardLostOrDamaged.screenTitle')}
                onBackButtonPress={handleBackButtonPress}
                shouldDisplayHelpButton
            />
            {isReasonConfirmed ? (
                <View style={[styles.flex1, styles.justifyContentBetween, styles.pt3, !paddingBottom ? styles.pb5 : null]}>
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
                    <View style={styles.mh5}>
                        <FormAlertWithSubmitButton
                            isAlertVisible={shouldShowAddressError}
                            onSubmit={handleSubmitSecondStep}
                            message={translate('reportCardLostOrDamaged.addressError')}
                            isLoading={formData?.isLoading}
                            buttonText={isDamaged ? translate('reportCardLostOrDamaged.shipNewCardButton') : translate('reportCardLostOrDamaged.deactivateCardButton')}
                        />
                    </View>
                </View>
            ) : (
                <SelectionList
                    data={reasonOptions}
                    ListItem={SingleSelectListItem}
                    initiallyFocusedItemKey={reason?.key}
                    onSelectRow={(item) => {
                        const selectedOption = OPTIONS.find((o) => o.key === item.keyForList);
                        if (selectedOption) {
                            setReason(selectedOption);
                            setShouldShowReasonError(false);
                        }
                    }}
                    customListHeaderContent={<Text style={[styles.textHeadline, styles.ph5, styles.pv3]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text>}
                    footerContent={
                        <FormAlertWithSubmitButton
                            isAlertVisible={shouldShowReasonError}
                            onSubmit={handleSubmitFirstStep}
                            message={translate('reportCardLostOrDamaged.reasonError')}
                            buttonText={translate('reportCardLostOrDamaged.nextButtonLabel')}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

export default ReportCardLostPage;
