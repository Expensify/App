import React from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {updateTravelInvoiceSettlementFrequency} from '@libs/actions/TravelInvoicing';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTravelSettlementFrequency} from '@libs/TravelInvoicingUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceTravelSettlementFrequencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_FREQUENCY>;

type FrequencyItem = ListItem & {
    value: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
};

function WorkspaceTravelSettlementFrequencyPage({route}: WorkspaceTravelSettlementFrequencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}` as const, {canBeMissing: true});

    const currentFrequency = getTravelSettlementFrequency(cardSettings);
    const frequencies = [CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY];

    function getSettlementFrequencyLabel(frequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>) {
        if (frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY) {
            return translate('workspace.common.frequency.monthly');
        }
        if (frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY) {
            return translate('workspace.common.frequency.immediate');
        }
    }

    const data = frequencies?.map((frequency) => ({
        text: getSettlementFrequencyLabel(frequency),
        value: frequency,
        keyForList: frequency,
        isSelected: frequency === currentFrequency,
    }));

    const selectFrequency = (item: FrequencyItem) => {
        updateTravelInvoiceSettlementFrequency(policyID, workspaceAccountID, item.value, cardSettings?.monthlySettlementDate ? new Date(cardSettings.monthlySettlementDate) : undefined);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceTravelSettlementFrequencyPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementFrequencyLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList<FrequencyItem>
                data={data}
                onSelectRow={selectFrequency}
                ListItem={RadioListItem}
                initiallyFocusedItemKey={currentFrequency}
                customListHeaderContent={
                    <Text style={[styles.mh5, styles.mv3]}>
                        {translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementFrequencyDescription')}
                    </Text>
                }
            />
        </ScreenWrapper>
    );
}

WorkspaceTravelSettlementFrequencyPage.displayName = 'WorkspaceTravelSettlementFrequencyPage';

export default WorkspaceTravelSettlementFrequencyPage;
