import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useActiveServer from '@hooks/useActiveServer';
import {useCompanyCardBankIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addNewCompanyCardsFeed} from '@libs/actions/CompanyCards';
import {isPlaidSupportedCountry} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CardFeedProvider, CombinedCardFeeds} from '@src/types/onyx/CardFeeds';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

type CardTypeSelection = CardFeedProvider | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK;

type AvailableCompanyCardTypes = {
    translate: LocaleContextProps['translate'];
    typeSelected?: CardTypeSelection;
    styles: StyleProp<ViewStyle>;
    companyCardBankIcons: ReturnType<typeof useCompanyCardBankIcons>;
    shouldShowMockFeed: boolean;
};

function getAvailableCompanyCardTypes({translate, typeSelected, styles, companyCardBankIcons, shouldShowMockFeed}: AvailableCompanyCardTypes) {
    const defaultCards = [
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            text: translate('workspace.companyCards.addNewCard.cardProviders.cdf'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
            leftElement: (
                <Icon
                    src={companyCardBankIcons.MasterCardCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            text: translate('workspace.companyCards.addNewCard.cardProviders.vcf'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            leftElement: (
                <Icon
                    src={companyCardBankIcons.VisaCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
    ];

    const cards: Array<{
        value: CardTypeSelection;
        text: string;
        keyForList: CardTypeSelection;
        isSelected: boolean;
        leftElement: React.JSX.Element;
    }> = [
        {
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            text: translate('workspace.companyCards.addNewCard.cardProviders.gl1025'),
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            leftElement: (
                <Icon
                    src={companyCardBankIcons.AmexCardCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        },
        ...defaultCards,
    ];

    if (shouldShowMockFeed) {
        cards.push({
            value: CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK,
            text: CONST.COMPANY_CARDS.CARD_TYPE_NAMES.MOCK_COMMERCIAL,
            keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK,
            isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK,
            leftElement: (
                <Icon
                    src={companyCardBankIcons.VisaCompanyCardDetail}
                    height={variables.iconSizeExtraLarge}
                    width={variables.iconSizeExtraLarge}
                    additionalStyles={styles}
                />
            ),
        });
    }

    return cards;
}

type CardTypeStepProps = {
    policyID?: string;
    cardFeeds?: CombinedCardFeeds;
    workspaceAccountID: number;
};

function CardTypeStep({policyID, cardFeeds, workspaceAccountID}: CardTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const companyCardBankIcons = useCompanyCardBankIcons();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const {activeServer} = useActiveServer();
    const [localTypeSelected, setLocalTypeSelected] = useState<CardTypeSelection>();
    const typeSelected = localTypeSelected ?? addNewCard?.data?.feedType;
    const [isError, setIsError] = useState(false);
    // Gate on the API the requests actually reach, since a dev build talks to production by default.
    const shouldShowMockFeed = activeServer !== CONST.SERVER.PRODUCTION || CONFIG.IS_USING_LOCAL_WEB;
    const data = getAvailableCompanyCardTypes({
        translate,
        typeSelected,
        styles: styles.mr3,
        companyCardBankIcons,
        shouldShowMockFeed,
    });
    const {bankName, selectedBank, feedType} = addNewCard?.data ?? {};
    const isOtherBankSelected = selectedBank === CONST.COMPANY_CARDS.BANKS.OTHER;
    const isNewCardTypeSelected = typeSelected !== feedType;
    const doesCountrySupportPlaid = isPlaidSupportedCountry(addNewCard?.data?.selectedCountry);

    const submit = useCallback(() => {
        if (!typeSelected || (typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK && !shouldShowMockFeed)) {
            setIsError(true);
        } else if (typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.VCF_MOCK) {
            addNewCompanyCardsFeed(policyID, workspaceAccountID, typeSelected, {}, cardFeeds, lastSelectedFeed);
            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
        } else {
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
                data: {
                    feedType: typeSelected,
                    bankName: isNewCardTypeSelected && isOtherBankSelected ? '' : bankName,
                },
                isEditing: false,
            });
        }
    }, [bankName, cardFeeds, isNewCardTypeSelected, isOtherBankSelected, lastSelectedFeed, policyID, shouldShowMockFeed, typeSelected, workspaceAccountID]);

    const handleBackButtonPress = () => {
        if (isOtherBankSelected) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (!doesCountrySupportPlaid) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY});
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

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
            testID="CardTypeStep"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />

            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.yourCardProvider')}</Text>
            <SelectionList
                data={data}
                ListItem={SingleSelectListItem}
                onSelectRow={({value}) => {
                    setLocalTypeSelected(value);
                    setIsError(false);
                }}
                confirmButtonOptions={confirmButtonOptions}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={addNewCard?.data?.feedType}
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
            >
                {isError && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <FormHelpMessage
                            isError={isError}
                            message={translate('workspace.companyCards.addNewCard.error.pleaseSelectProvider')}
                        />
                    </View>
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

export default CardTypeStep;
