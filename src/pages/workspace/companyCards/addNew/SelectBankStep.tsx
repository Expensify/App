import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SelectBankStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [bankSelected, setBankSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.BANKS>>();
    const [isError, setIsError] = useState(false);

    const submit = () => {
        if (!bankSelected) {
            setIsError(true);
        } else {
            // TODO: https://github.com/Expensify/App/issues/50447 - update the navigation when new screen exists
            CompanyCards.setAddNewCompanyCardStepAndData({
                step: bankSelected === CONST.COMPANY_CARDS.BANKS.OTHER ? CONST.COMPANY_CARDS.STEP.CARD_TYPE : CONST.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {
                    selectedBank: bankSelected,
                },
                isEditing: false,
            });
        }
    };

    useEffect(() => {
        setBankSelected(addNewCard?.data.selectedBank);
    }, [addNewCard?.data.selectedBank]);

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    const data = Object.values(CONST.COMPANY_CARDS.BANKS).map((bank) => ({
        value: bank,
        text: bank === CONST.COMPANY_CARDS.BANKS.OTHER ? translate('workspace.companyCards.addNewCard.other') : bank,
        keyForList: bank,
        isSelected: bankSelected === bank,
        leftElement: (
            <Icon
                src={CardUtils.getBankCardDetailsImage(bank)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    return (
        <ScreenWrapper
            testID={SelectBankStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whoIsYourBankAccount')}</Text>
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setBankSelected(value);
                    setIsError(false);
                }}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={addNewCard?.data.selectedBank}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={submit}
            >
                {isError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={isError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBankAccount')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

SelectBankStep.displayName = 'SelectBankStep';

export default SelectBankStep;
