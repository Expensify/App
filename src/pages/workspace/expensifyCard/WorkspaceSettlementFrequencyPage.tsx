import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

function WorkspaceSettlementFrequencyPage({route}: StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;

    const data = useMemo(
        () => [
            {
                value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
                text: translate('workspace.expensifyCard.frequency.daily'),
                keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
            },
            {
                value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                text: translate('workspace.expensifyCard.frequency.daily'),
                keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
            },
        ],
        [translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceSettlementFrequencyPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.expensifyCard.settlementFrequency')} />
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementFrequencyDescription')}</Text>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={() => {}}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={null}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceSettlementFrequencyPage.displayName = 'WorkspaceSettlementFrequencyPage';

export default WorkspaceSettlementFrequencyPage;
