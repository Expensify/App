import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed} from '@src/types/onyx';

type AvailableCompanyCardTypes = {
    isAmexAvailable?: boolean;
    translate: LocaleContextProps['translate'];
    typeSelected?: CompanyCardFeed;
    styles: StyleProp<ViewStyle>;
};

function getAvailableCompanyCardTypes({isAmexAvailable, translate, typeSelected, styles}: AvailableCompanyCardTypes) {
    const defaultTypes = [
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            text: translate('workspace.companyCards.addNewCard.cardProviders.cdf'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            leftElement: (
                <Icon
                    src={Illustrations.MasterCardCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            text: translate('workspace.companyCards.addNewCard.cardProviders.vcf'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            leftElement: (
                <Icon
                    src={Illustrations.VisaCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
    ];

    if (!isAmexAvailable) {
        return defaultTypes;
    }

    return [
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            text: translate('workspace.companyCards.addNewCard.cardProviders.gl1025'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            leftElement: (
                <Icon
                    src={Illustrations.AmexCardCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
        ...defaultTypes,
    ];
}

function CardTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [typeSelected, setTypeSelected] = useState<CompanyCardFeed>();
    const {canUseDirectFeeds} = usePermissions();
    const [isError, setIsError] = useState(false);
    const data = getAvailableCompanyCardTypes({isAmexAvailable: !canUseDirectFeeds, translate, typeSelected, styles: styles.mr3});

    const submit = () => {
        if (!typeSelected) {
            setIsError(true);
        } else {
            CompanyCards.setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
                data: {
                    feedType: typeSelected,
                },
                isEditing: false,
            });
        }
    };

    useEffect(() => {
        setTypeSelected(addNewCard?.data.feedType);
    }, [addNewCard?.data.feedType]);

    const handleBackButtonPress = () => {
        if (canUseDirectFeeds) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
        } else {
            Navigation.goBack();
        }
    };

    return (
        <ScreenWrapper
            testID={CardTypeStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.yourCardProvider')}</Text>
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setTypeSelected(value);
                    setIsError(false);
                }}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={addNewCard?.data.feedType}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={submit}
            >
                {isError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={isError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectProvider')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

CardTypeStep.displayName = 'CardTypeStep';

export default CardTypeStep;
