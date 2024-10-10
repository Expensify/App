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

function SelectFeedType() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>>();
    const [isError, setIsError] = useState(false);

    const submit = () => {
        if (!typeSelected) {
            setIsError(true);
        } else {
            // TODO: https://github.com/Expensify/App/issues/50448 - update the navigation when new screen exists
        }
    };

    useEffect(() => {
        setTypeSelected(addNewCard?.data.selectedFeedType);
    }, [addNewCard?.data.selectedFeedType]);

    const handleBackButtonPress = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
    };

    const data = [
        {
            value: CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
            text: translate('workspace.companyCards.customFeed'),
            alternateText: translate('workspace.companyCards.addNewCard.customFeedDetails'),
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
                    setIsError(false);
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
                {isError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={isError}
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
