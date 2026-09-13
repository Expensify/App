import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import {useCompanyCardBankIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {isUsingStagingApi} from '@libs/ApiUtils';
import {isPlaidSupportedCountry} from '@libs/CardUtils';

import variables from '@styles/variables';

import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewCardFeedData, CardFeedProvider} from '@src/types/onyx/CardFeeds';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';

type AvailableCompanyCardTypes = {
    translate: LocaleContextProps['translate'];
    typeSelected?: CardFeedProvider;
    styles: StyleProp<ViewStyle>;
    companyCardBankIcons: ReturnType<typeof useCompanyCardBankIcons>;
};

function getAvailableCompanyCardTypes({translate, typeSelected, styles, companyCardBankIcons}: AvailableCompanyCardTypes) {
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

    return [
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
}

function CardTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const companyCardBankIcons = useCompanyCardBankIcons();
    const illustrations = useThemeIllustrations();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [shouldUseStagingServer = isUsingStagingApi()] = useOnyx(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    const [localTypeSelected, setLocalTypeSelected] = useState<AddNewCardFeedData['feedType']>();
    const isMockFeedSetup = addNewCard?.data?.feedType === CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED;
    const typeSelected = localTypeSelected ?? (isMockFeedSetup ? addNewCard?.data?.mockFeedType : addNewCard?.data?.feedType);
    const [isError, setIsError] = useState(false);
    const baseData = getAvailableCompanyCardTypes({
        translate,
        typeSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED ? undefined : typeSelected,
        styles: styles.mr3,
        companyCardBankIcons,
    });
    const isMockCommercialFeedVisible = CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.PRODUCTION || shouldUseStagingServer;
    const data =
        !isMockFeedSetup && isMockCommercialFeedVisible
            ? [
                  ...baseData,
                  {
                      value: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED,
                      text: 'Mock Commercial Feed (Testing)',
                      keyForList: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED,
                      isSelected: typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED,
                      leftElement: (
                          <Icon
                              src={illustrations.GenericCompanyCard}
                              height={variables.iconSizeExtraLarge}
                              width={variables.iconSizeExtraLarge}
                              additionalStyles={styles.mr3}
                          />
                      ),
                  },
              ]
            : baseData;
    const {bankName, selectedBank, feedType} = addNewCard?.data ?? {};
    const isOtherBankSelected = selectedBank === CONST.COMPANY_CARDS.BANKS.OTHER;
    const isNewCardTypeSelected = typeSelected !== feedType;
    const doesCountrySupportPlaid = isPlaidSupportedCountry(addNewCard?.data?.selectedCountry);

    const submit = useCallback(() => {
        if (!typeSelected) {
            setIsError(true);
        } else if (typeSelected === CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED) {
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {
                    feedType: typeSelected,
                    feedDetails: null,
                    mockFeedType: undefined,
                },
                isEditing: false,
            });
        } else if (isMockFeedSetup) {
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
                data: {
                    feedType: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_COMMERCIAL_FEED,
                    feedDetails: null,
                    mockFeedType: typeSelected,
                },
                isEditing: false,
            });
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
    }, [bankName, isMockFeedSetup, isNewCardTypeSelected, isOtherBankSelected, typeSelected]);

    const handleBackButtonPress = () => {
        if (isMockFeedSetup) {
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {feedType: null, mockFeedType: undefined},
            });
            return;
        }
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
                    setLocalTypeSelected(value as AddNewCardFeedData['feedType']);
                    setIsError(false);
                }}
                confirmButtonOptions={confirmButtonOptions}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={typeSelected}
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
