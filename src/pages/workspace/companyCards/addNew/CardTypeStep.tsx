import React, {useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';

function CardTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.CARD_TYPE>>();

    const submit = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({
            step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
            data: {
                cardType: typeSelected,
            },
            isEditing: false,
        });
    };

    const handleBackButtonPress = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_TYPE});
    };

    const data = useMemo(() => {
        const options = [];
        options.push(
            {
                value: CONST.COMPANY_CARDS.CARD_TYPE.AMEX,
                text: translate('workspace.companyCards.addNewCard.cardProviders.amex'),
                keyForList: CONST.COMPANY_CARDS.CARD_TYPE.AMEX,
                isSelected: typeSelected === CONST.COMPANY_CARDS.CARD_TYPE.AMEX,
                leftElement: (
                    <Icon
                        src={Illustrations.AmexCompanyCards}
                        height={variables.iconSizeExtraLarge}
                        width={variables.iconSizeExtraLarge}
                        additionalStyles={styles.mr3}
                    />
                ),
            },
            {
                value: CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD,
                text: translate('workspace.companyCards.addNewCard.cardProviders.mastercard'),
                keyForList: CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD,
                isSelected: typeSelected === CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD,
                leftElement: (
                    <Icon
                        src={Illustrations.MasterCardCompanyCards}
                        height={variables.iconSizeExtraLarge}
                        width={variables.iconSizeExtraLarge}
                        additionalStyles={styles.mr3}
                    />
                ),
            },
            {
                value: CONST.COMPANY_CARDS.CARD_TYPE.VISA,
                text: translate('workspace.companyCards.addNewCard.cardProviders.visa'),
                keyForList: CONST.COMPANY_CARDS.CARD_TYPE.VISA,
                isSelected: typeSelected === CONST.COMPANY_CARDS.CARD_TYPE.VISA,
                leftElement: (
                    <Icon
                        src={Illustrations.VisaCompanyCards}
                        height={variables.iconSizeExtraLarge}
                        width={variables.iconSizeExtraLarge}
                        additionalStyles={styles.mr3}
                    />
                ),
            },
        );

        return options;
    }, [styles.mr3, translate, typeSelected]);

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
                onSelectRow={({value}) => setTypeSelected(value)}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={typeSelected}
                shouldUpdateFocusedIndex
            />
            <Button
                success
                large
                pressOnEnter
                text={translate('common.next')}
                onPress={submit}
                style={styles.m5}
            />
        </ScreenWrapper>
    );
}

CardTypeStep.displayName = 'CardTypeStep';

export default CardTypeStep;
