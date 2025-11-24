import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankCardDetailsImage, getCorrectStepForPlaidSelectedBank, getCorrectStepForSelectedBank} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {clearAddNewCardFlow, setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function SelectBankStep() {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>>();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();

    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [bankSelected, setBankSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | null>();
    const [hasError, setHasError] = useState(false);
    const isOtherBankSelected = bankSelected === CONST.COMPANY_CARDS.BANKS.OTHER;

    const submit = useCallback(() => {
        if (!bankSelected) {
            setHasError(true);
        } else {
            if (addNewCard?.data.selectedBank !== bankSelected && !isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
                clearAddNewCardFlow();
            }
            setAddNewCompanyCardStepAndData({
                step: isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) ? getCorrectStepForPlaidSelectedBank(bankSelected) : getCorrectStepForSelectedBank(bankSelected),
                data: {
                    selectedBank: bankSelected,
                    cardTitle: !isOtherBankSelected ? bankSelected : undefined,
                    feedType: bankSelected === CONST.COMPANY_CARDS.BANKS.STRIPE ? CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE : undefined,
                },
                isEditing: false,
            });
        }
    }, [addNewCard?.data.selectedBank, bankSelected, isBetaEnabled, isOtherBankSelected]);

    useEffect(() => {
        setBankSelected(addNewCard?.data.selectedBank);
    }, [addNewCard?.data.selectedBank]);

    const handleBackButtonPress = () => {
        if (route?.params?.backTo) {
            Navigation.navigate(route.params.backTo);
            return;
        }
        if (isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE, data: {selectedBank: null}});
        } else {
            Navigation.goBack();
        }
    };

    const data = Object.values(CONST.COMPANY_CARDS.BANKS).map((bank) => ({
        value: bank,
        text: bank === CONST.COMPANY_CARDS.BANKS.OTHER ? translate('workspace.companyCards.addNewCard.other') : bank,
        keyForList: bank,
        isSelected: bankSelected === bank,
        leftElement: (
            <Icon
                src={getBankCardDetailsImage(bank, illustrations)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.next'),
            onConfirm: submit,
            isDisabled: isOffline,
            style: !hasError && styles.mt5,
        }),
        [hasError, isOffline, styles.mt5, submit, translate],
    );

    return (
        <ScreenWrapper
            testID={SelectBankStep.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
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
                initiallyFocusedItemKey={addNewCard?.data.selectedBank ?? undefined}
                confirmButtonOptions={confirmButtonOptions}
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

SelectBankStep.displayName = 'SelectBankStep';

export default SelectBankStep;
