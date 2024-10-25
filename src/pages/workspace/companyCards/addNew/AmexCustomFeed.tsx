import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function AmexCustomFeed() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED>>();
    const [hasError, setHasError] = useState(false);

    const submit = () => {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({
            step: typeSelected === CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE ? CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS : CONST.COMPANY_CARDS.STEP.BANK_CONNECTION,
            data: {
                feedType: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
                selectedAmexCustomFeed: typeSelected,
            },
        });
    };

    useEffect(() => {
        setTypeSelected(addNewCard?.data.selectedAmexCustomFeed);
    }, [addNewCard?.data.selectedAmexCustomFeed]);

    const handleBackButtonPress = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
    };

    const data = [
        {
            value: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            text: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            alternateText: translate('workspace.companyCards.addNewCard.amexCorporate'),
            keyForList: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
            isSelected: typeSelected === CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
        },
        {
            value: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            text: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            alternateText: translate('workspace.companyCards.addNewCard.amexBusiness'),
            keyForList: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
            isSelected: typeSelected === CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.BUSINESS,
        },
    ];

    return (
        <ScreenWrapper
            testID={AmexCustomFeed.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.howDoYouWantToConnect')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mb6]}>
                {`${translate('workspace.companyCards.addNewCard.learnMoreAboutConnections.text')}`}
                <TextLink href={CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}>{`${translate('workspace.companyCards.addNewCard.learnMoreAboutConnections.linkText')}`}</TextLink>
            </Text>

            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setTypeSelected(value);
                    setHasError(false);
                }}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                isAlternateTextMultilineSupported
                alternateTextNumberOfLines={3}
                initiallyFocusedOptionKey={addNewCard?.data.selectedAmexCustomFeed}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={submit}
            >
                {hasError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={hasError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectBankAccount')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

AmexCustomFeed.displayName = 'AmexCustomFeed';

export default AmexCustomFeed;
