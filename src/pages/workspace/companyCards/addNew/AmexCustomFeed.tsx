import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function AmexCustomFeed() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const [typeSelected, setTypeSelected] = useState<ValueOf<typeof CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED>>();
    const [hasError, setHasError] = useState(false);

    const submit = useCallback(() => {
        if (!typeSelected) {
            setHasError(true);
            return;
        }
        setAddNewCompanyCardStepAndData({
            step: typeSelected === CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE ? CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS : CONST.COMPANY_CARDS.STEP.BANK_CONNECTION,
            data: {
                feedType: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
                selectedAmexCustomFeed: typeSelected,
            },
        });
    }, [typeSelected]);

    useEffect(() => {
        setTypeSelected(addNewCard?.data.selectedAmexCustomFeed);
    }, [addNewCard?.data.selectedAmexCustomFeed]);

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
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
        {
            value: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            text: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            alternateText: translate('workspace.companyCards.addNewCard.amexPersonal'),
            keyForList: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
            isSelected: typeSelected === CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.PERSONAL,
        },
    ];

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.next'),
            onConfirm: submit,
        }),
        [submit, translate],
    );

    return (
        <ScreenWrapper
            testID={AmexCustomFeed.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.howDoYouWantToConnect')}</Text>
            <View style={[styles.renderHTML, styles.flexRow, styles.ph5, styles.mb6]}>
                <RenderHTML html={translate('workspace.companyCards.addNewCard.learnMoreAboutOptions')} />
            </View>

            <SelectionList
                data={data}
                ListItem={RadioListItem}
                onSelectRow={({value}) => {
                    setTypeSelected(value);
                    setHasError(false);
                }}
                confirmButtonOptions={confirmButtonOptions}
                shouldSingleExecuteRowSelect
                alternateNumberOfSupportedLines={3}
                initiallyFocusedItemKey={addNewCard?.data.selectedAmexCustomFeed ?? undefined}
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
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
