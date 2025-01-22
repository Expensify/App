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
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedProvider} from '@src/types/onyx/CardFeeds';

type AvailableCompanyCardTypes = {
    translate: LocaleContextProps['translate'];
    typeSelected?: CardFeedProvider;
    styles: StyleProp<ViewStyle>;
};

function getAvailableCompanyCardTypes({translate, typeSelected, styles}: AvailableCompanyCardTypes) {
    return [
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
}

function CardTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [typeSelected, setTypeSelected] = useState<CardFeedProvider>();
    const [isError, setIsError] = useState(false);
    const data = getAvailableCompanyCardTypes({translate, typeSelected, styles: styles.mr3});
    const {bankName, selectedBank, feedType} = addNewCard?.data ?? {};
    const isOtherBankSelected = selectedBank === CONST.COMPANY_CARDS.BANKS.OTHER;
    const isNewCardTypeSelected = typeSelected !== feedType;

    const submit = () => {
        if (!typeSelected) {
            setIsError(true);
        } else {
            CompanyCards.setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
                data: {
                    feedType: typeSelected,
                    bankName: isNewCardTypeSelected && isOtherBankSelected ? '' : bankName,
                },
                isEditing: false,
            });
        }
    };

    useEffect(() => {
        setTypeSelected(addNewCard?.data.feedType);
    }, [addNewCard?.data.feedType]);

    const handleBackButtonPress = () => {
        if (isOtherBankSelected) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    return (
        <ScreenWrapper
            testID={CardTypeStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
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
