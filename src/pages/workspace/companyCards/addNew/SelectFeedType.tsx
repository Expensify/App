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
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SelectFeedType() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>>();
    const [hasError, setHasError] = useState(false);

    const submit = () => {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        setAddNewCompanyCardStepAndData({
            step: typeSelected === CONST.COMPANY_CARDS.FEED_TYPE.DIRECT ? CONST.COMPANY_CARDS.STEP.BANK_CONNECTION : CONST.COMPANY_CARDS.STEP.CARD_TYPE,
            data: {selectedFeedType: typeSelected},
        });
    };

    useEffect(() => {
        setTypeSelected(addNewCard?.data.selectedFeedType);
    }, [addNewCard?.data.selectedFeedType]);

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
    };

    const data = [
        {
            value: CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            text: translate('workspace.companyCards.commercialFeed'),
            alternateText: translate('workspace.companyCards.addNewCard.commercialFeedDetails'),
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

    return (
        <ScreenWrapper
            testID={SelectFeedType.displayName}
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
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                isAlternateTextMultilineSupported
                alternateTextNumberOfLines={3}
                initiallyFocusedOptionKey={addNewCard?.data.selectedFeedType}
                shouldUpdateFocusedIndex
                showConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirm={submit}
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
