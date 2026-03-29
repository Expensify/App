import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import {useCompanyCardBankIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPersonalBankCardDetailsImage} from '@libs/CardUtils';
import variables from '@styles/variables';
import {setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SelectBankStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardBankIcons = useCompanyCardBankIcons();
    const {isOffline} = useNetwork();

    const [addNewPersonalCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const [bankSelected, setBankSelected] = useState<ValueOf<typeof CONST.PERSONAL_CARDS.BANKS> | null | undefined>(addNewPersonalCard?.data.selectedBank);
    const [hasError, setHasError] = useState(false);
    const isOtherBankSelected = bankSelected === CONST.PERSONAL_CARDS.BANKS.OTHER;

    const submit = () => {
        if (!bankSelected) {
            setHasError(true);
        } else {
            setAddNewPersonalCardStepAndData({
                step: bankSelected === CONST.PERSONAL_CARDS.BANKS.OTHER ? CONST.PERSONAL_CARDS.STEP.PLAID_CONNECTION : CONST.PERSONAL_CARDS.STEP.BANK_CONNECTION,
                data: {
                    selectedBank: bankSelected,
                    cardTitle: !isOtherBankSelected ? bankSelected : undefined,
                },
                isEditing: false,
            });
        }
    };

    const handleBackButtonPress = () => {
        setAddNewPersonalCardStepAndData({step: CONST.PERSONAL_CARDS.STEP.SELECT_COUNTRY, data: {selectedBank: null}});
    };

    const data = Object.values(CONST.PERSONAL_CARDS.BANKS).map((bank) => ({
        value: bank,
        text: bank === CONST.PERSONAL_CARDS.BANKS.OTHER ? translate('workspace.companyCards.addNewCard.other') : bank,
        keyForList: bank,
        isSelected: bankSelected === bank,
        leftElement: (
            <Icon
                src={getPersonalBankCardDetailsImage(bank, illustrations, companyCardBankIcons)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    return (
        <ScreenWrapper
            testID="SelectBankStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('personalCard.addPersonalCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whoIsYourBankAccount')}</Text>
            <SelectionList
                data={data}
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setBankSelected(value);
                    setHasError(false);
                }}
                initiallyFocusedItemKey={addNewPersonalCard?.data.selectedBank ?? undefined}
                confirmButtonOptions={{
                    showButton: true,
                    text: translate('common.next'),
                    onConfirm: submit,
                    isDisabled: isOffline,
                    style: !hasError && styles.mt5,
                }}
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
            >
                {hasError && (
                    <View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBank')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

export default SelectBankStep;
