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
import {useCompanyCardBankIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankCardDetailsImage, getCorrectStepForPlaidSelectedBank} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function SelectBankStep() {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>>();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardBankIcons = useCompanyCardBankIcons();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [bankSelected, setBankSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | null>();
    const [hasError, setHasError] = useState(false);
    const isOtherBankSelected = bankSelected === CONST.COMPANY_CARDS.BANKS.OTHER;
    const isFileImportSelected = bankSelected === CONST.COMPANY_CARDS.BANKS.FILE_IMPORT;

    const submit = useCallback(() => {
        if (!bankSelected) {
            setHasError(true);
        } else {
            if (isFileImportSelected) {
                setAddNewCompanyCardStepAndData({
                    step: CONST.COMPANY_CARDS.STEP.IMPORT_FROM_FILE,
                    data: {
                        selectedBank: bankSelected,
                    },
                    isEditing: false,
                });
                return;
            }
            setAddNewCompanyCardStepAndData({
                step: getCorrectStepForPlaidSelectedBank(bankSelected),
                data: {
                    selectedBank: bankSelected,
                    cardTitle: !isOtherBankSelected && !isFileImportSelected ? bankSelected : undefined,
                    feedType: bankSelected === CONST.COMPANY_CARDS.BANKS.STRIPE ? CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE : undefined,
                },
                isEditing: false,
            });
        }
    }, [bankSelected, isFileImportSelected, isOtherBankSelected]);

    useEffect(() => {
        const selectedBank = addNewCard?.data.selectedBank;
        setBankSelected(selectedBank);
    }, [addNewCard?.data.selectedBank]);

    const handleBackButtonPress = () => {
        if (route?.params?.backTo) {
            Navigation.navigate(route.params.backTo);
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE, data: {selectedBank: null}});
    };

    const getBankDisplayText = (bank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>) => {
        if (bank === CONST.COMPANY_CARDS.BANKS.OTHER) {
            return translate('workspace.companyCards.addNewCard.other');
        }
        if (bank === CONST.COMPANY_CARDS.BANKS.FILE_IMPORT) {
            return translate('workspace.companyCards.addNewCard.fileImport');
        }
        return bank;
    };

    const availableBanks = isBetaEnabled(CONST.BETAS.CSV_CARD_IMPORT)
        ? Object.values(CONST.COMPANY_CARDS.BANKS)
        : Object.values(CONST.COMPANY_CARDS.BANKS).filter((bank) => bank !== CONST.COMPANY_CARDS.BANKS.FILE_IMPORT);

    const data = availableBanks.map((bank) => {
        const iconSize = bank === CONST.COMPANY_CARDS.BANKS.FILE_IMPORT ? variables.iconSizeMedium : variables.iconSizeExtraLarge;

        return {
            value: bank,
            text: getBankDisplayText(bank),
            keyForList: bank,
            isSelected: bankSelected === bank,
            leftElement: (
                <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter, {width: variables.iconSizeExtraLarge, height: variables.iconSizeExtraLarge}]}>
                    <Icon
                        src={getBankCardDetailsImage(bank, illustrations, companyCardBankIcons)}
                        height={iconSize}
                        width={iconSize}
                    />
                </View>
            ),
        };
    });

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
            testID="SelectBankStep"
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

export default SelectBankStep;
