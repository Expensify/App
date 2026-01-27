import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {updateSelectedFeed} from '@libs/actions/Card';
import {setAddNewCompanyCardStepAndData} from '@libs/actions/CompanyCards';
import {getBankName, getCardFeedWithDomainID} from '@libs/CardUtils';
import Parser from '@libs/Parser';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedProvider, CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

type CardInstructionsStepProps = {
    policyID?: string;
};

function getCardInstructionHeader(feedProvider: CardFeedProvider) {
    if (feedProvider === CONST.COMPANY_CARD.FEED_BANK_NAME.VISA) {
        return 'workspace.companyCards.addNewCard.enableFeed.visa';
    }
    if (feedProvider === CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD) {
        return 'workspace.companyCards.addNewCard.enableFeed.mastercard';
    }

    return 'workspace.companyCards.addNewCard.enableFeed.heading';
}

function CardInstructionsStep({policyID}: CardInstructionsStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});

    const data = addNewCard?.data;
    const feedProvider = data?.feedType ?? CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
    const bank = data?.selectedBank;
    const isStripeFeedProvider = feedProvider === CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
    const isOtherBankSelected = bank === CONST.COMPANY_CARDS.BANKS.OTHER;
    const translationKey = getCardInstructionHeader(feedProvider);
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const buttonTranslation = isStripeFeedProvider ? translate('common.submit') : translate('common.next');

    const submit = () => {
        if (isStripeFeedProvider && policyID) {
            updateSelectedFeed(getCardFeedWithDomainID(feedProvider, workspaceAccountID) as CompanyCardFeedWithDomainID, policyID);
            Navigation.goBack();
            return;
        }
        if (isOtherBankSelected) {
            setAddNewCompanyCardStepAndData({
                step: CONST.COMPANY_CARDS.STEP.CARD_NAME,
            });
            return;
        }
        setAddNewCompanyCardStepAndData({
            step: CONST.COMPANY_CARDS.STEP.CARD_DETAILS,
        });
    };

    const handleBackButtonPress = () => {
        if (isStripeFeedProvider) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_TYPE});
    };

    return (
        <ScreenWrapper
            testID="CardInstructionsStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.enableFeed.title', getBankName(feedProvider))}</Text>
                <Text style={[styles.ph5, styles.mb3]}>{translate(translationKey)}</Text>
                <View style={[styles.ph5]}>
                    <RenderHTML html={Parser.replace(feedProvider ? translate(`workspace.companyCards.addNewCard.enableFeed.${feedProvider}`) : '')} />
                </View>
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success
                        large
                        style={[styles.w100]}
                        onPress={submit}
                        text={buttonTranslation}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default CardInstructionsStep;
