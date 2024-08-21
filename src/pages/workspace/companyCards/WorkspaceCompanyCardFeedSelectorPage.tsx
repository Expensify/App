import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import {CardFeeds} from '@src/types/onyx';

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
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    // TODO: use data form onyx instead of mocked one whe API is implemented
    // const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const cardFeeds = mockedData;

    const feeds = Object.entries(cardFeeds?.companyCardNicknames ?? {}).map(([key, value]) => ({
        value: key,
        text: value,
        keyForList: key,
        isSelected: false,
    }));

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
                    // TODO: pass the specific route to go back to
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={() => {}}
                    sections={[{data: feeds}]}
                    shouldUpdateFocusedIndex
                    isAlternateTextMultilineSupported
                    // initiallyFocusedOptionKey={typeSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardFeedSelectorPage.displayName = 'WorkspaceCompanyCardFeedSelectorPage';

export default WorkspaceCompanyCardFeedSelectorPage;
