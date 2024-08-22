import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CardFeeds} from '@src/types/onyx';

type CardFeedListItem = ListItem & {
    /** Card feed value */
    value: string;
};

const mockedData: CardFeeds = {
    companyCards: {
        cdfbmo: {
            pending: false,
            asrEnabled: true,
            forceReimbursable: 'force_no',
            liabilityType: 'corporate',
            preferredPolicy: '',
            reportTitleFormat: '{report:card}{report:bank}{report:submit:from}{report:total}{report:enddate:MMMM}',
            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
        },
    },
    companyCardNicknames: {
        cdfbmo: 'BMO MasterCard',
    },
};

type WorkspaceCompanyCardFeedSelectorPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceCompanyCardFeedSelectorPage({route}: WorkspaceCompanyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    // const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // TODO: use data form onyx instead of mocked one whe API is implemented
    // const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);

    const cardFeeds = mockedData;
    const defaultFeed = Object.keys(cardFeeds?.companyCards ?? {})[0];
    const selectedFeed = lastSelectedFeed ?? defaultFeed;

    const feeds: CardFeedListItem[] = Object.entries(cardFeeds?.companyCardNicknames ?? {}).map(([key, value]) => ({
        value: key,
        text: value,
        keyForList: key,
        isSelected: key === selectedFeed,
        leftElement: (
            <Icon
                src={CardUtils.getCardFeedIcon(key)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    // TODO: pass the specific route of the Card List page to go back when it's merged https://github.com/Expensify/App/pull/47719
    const goBack = () => Navigation.goBack();

    const selectFeed = (feed: CardFeedListItem) => {
        Card.updateSelectedFeed(feed.value, policyID);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            // TODO: uncomment when ARE_COMPANY_CARDS_ENABLED feature is available https://github.com/Expensify/App/pull/47719
            // featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceCompanyCardFeedSelectorPage.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCardFeed')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={selectFeed}
                    sections={[{data: feeds}]}
                    shouldUpdateFocusedIndex
                    isAlternateTextMultilineSupported
                    initiallyFocusedOptionKey={selectedFeed}
                    listFooterContent={
                        <MenuItem
                            title={translate('workspace.companyCards.addCompanyCards')}
                            icon={Expensicons.Plus}
                            onPress={() => {
                                // TODO: navigate to Add Feed flow when it's implemented
                            }}
                        />
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardFeedSelectorPage.displayName = 'WorkspaceCompanyCardFeedSelectorPage';

export default WorkspaceCompanyCardFeedSelectorPage;
