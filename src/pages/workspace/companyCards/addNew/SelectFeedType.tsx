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

    const submit = useCallback(() => {
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
    }, [isBetaEnabled, isUSCountry, typeSelected]);

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
            <View style={[styles.renderHTML, styles.flexRow, styles.ph5, styles.mb6]}>
                <RenderHTML html={translate('workspace.companyCards.addNewCard.learnMoreAboutOptions')} />
            </View>

            <SelectionList
                key={typeSelected ? 'feed-type-loaded' : 'feed-type-loading'}
                ListItem={RadioListItem}
                data={finalData}
                onSelectRow={({value}) => {
                    setTypeSelected(value);
                    setHasError(false);
                }}
                shouldSingleExecuteRowSelect
                confirmButtonOptions={confirmButtonOptions}
                alternateNumberOfSupportedLines={3}
                initiallyFocusedItemKey={typeSelected}
                shouldUpdateFocusedIndex
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
