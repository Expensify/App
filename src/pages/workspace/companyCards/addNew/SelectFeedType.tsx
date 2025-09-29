import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {isPlaidSupportedCountry} from '@libs/CardUtils';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SelectFeedType() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>>();
    const [hasError, setHasError] = useState(false);
    const {isBetaEnabled} = usePermissions();
    const doesCountrySupportPlaid = isPlaidSupportedCountry(addNewCard?.data?.selectedCountry);
    const isUSCountry = addNewCard?.data?.selectedCountry === CONST.COUNTRY.US;

    const submit = () => {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        const isDirectSelected = typeSelected === CONST.COMPANY_CARDS.FEED_TYPE.DIRECT;

        if (!isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) || !isDirectSelected) {
            setAddNewCompanyCardStepAndData({
                step: isDirectSelected ? CONST.COMPANY_CARDS.STEP.BANK_CONNECTION : CONST.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {selectedFeedType: typeSelected},
            });
            return;
        }
        const step = isUSCountry ? CONST.COMPANY_CARDS.STEP.SELECT_BANK : CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION;
        setAddNewCompanyCardStepAndData({
            step,
            data: {selectedFeedType: typeSelected},
        });
    };

    useEffect(() => {
        if (addNewCard?.data.selectedFeedType) {
            setTypeSelected(addNewCard?.data.selectedFeedType);
            return;
        }
        if (doesCountrySupportPlaid) {
            setTypeSelected(CONST.COMPANY_CARDS.FEED_TYPE.DIRECT);
        }
    }, [addNewCard?.data.selectedFeedType, doesCountrySupportPlaid]);

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) ? CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY : CONST.COMPANY_CARDS.STEP.SELECT_BANK});
    };

    const data = [
        {
            value: CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            text: translate('workspace.companyCards.commercialFeed'),
            alternateText: translate(
                isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) ? 'workspace.companyCards.addNewCard.commercialFeedPlaidDetails' : 'workspace.companyCards.addNewCard.commercialFeedDetails',
            ),
            keyForList: CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            isSelected: typeSelected === CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
        },
        {
            value: CONST.COMPANY_CARDS.FEED_TYPE.DIRECT,
            text: translate('workspace.companyCards.directFeed'),
            alternateText: translate('workspace.companyCards.addNewCard.directFeedDetails'),
            keyForList: CONST.COMPANY_CARDS.FEED_TYPE.DIRECT,
            isSelected: typeSelected === CONST.COMPANY_CARDS.FEED_TYPE.DIRECT,
        },
    ];

    const getFinalData = () => {
        if (!isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
            return data;
        }
        if (doesCountrySupportPlaid) {
            return data.reverse();
        }

        return data.slice(0, 1);
    };

    const finalData = getFinalData();

    return (
        <ScreenWrapper
            testID={SelectFeedType.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.howDoYouWantToConnect')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mb6]}>
                {`${translate('workspace.companyCards.addNewCard.learnMoreAboutOptions.text')}`}
                <TextLink href={CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}>{`${translate('workspace.companyCards.addNewCard.learnMoreAboutOptions.linkText')}`}</TextLink>
            </Text>

            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setTypeSelected(value);
                    setHasError(false);
                }}
                sections={[{data: finalData}]}
                shouldSingleExecuteRowSelect
                isAlternateTextMultilineSupported
                alternateTextNumberOfLines={3}
                initiallyFocusedOptionKey={typeSelected}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={submit}
                addBottomSafeAreaPadding
            >
                {hasError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectFeedType')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

SelectFeedType.displayName = 'SelectFeedType';

export default SelectFeedType;
