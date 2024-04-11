import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

type CustomSelectorTypes = ValueOf<typeof CONST.QBO_SELECTOR_OPTIONS>;

type SelectorType = {
    value: CustomSelectorTypes;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

function QuickbooksAccountSelectPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [selectedAccount, setSelectedAccount] = useState<CustomSelectorTypes>(CONST.QBO_SELECTOR_OPTIONS.CROISSANT_CO_PAYROLL_ACCOUNT);

    const policyID = policy?.id ?? '';

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            Object.entries(CONST.QBO_SELECTOR_OPTIONS).map(([key, value]) => ({
                value,
                text: translate(`workspace.qbo.advancedConfig.croissantCo.${value}`),
                keyForList: key,
                isSelected: selectedAccount === value,
            })),
        [selectedAccount, translate],
    );

    const showQBOOnlineSelectorOptions = useCallback(
        () =>
            qboOnlineSelectorOptions.map((item) => (
                <OfflineWithFeedback key={item.keyForList.toString()}>
                    <RadioListItem
                        item={item}
                        onSelectRow={() => setSelectedAccount(item.value)}
                        showTooltip={false}
                        isFocused={item.isSelected}
                    />
                </OfflineWithFeedback>
            )),
        [qboOnlineSelectorOptions, setSelectedAccount],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                >
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        shouldEnableMaxHeight
                        testID={QuickbooksAccountSelectPage.displayName}
                    >
                        <HeaderWithBackButton title={translate('workspace.qbo.advancedConfig.qboAccount')} />

                        <View style={[styles.pb2, styles.ph5]}>
                            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.accountSelectDescription')}</Text>
                        </View>
                        <ScrollView>{showQBOOnlineSelectorOptions()}</ScrollView>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksAccountSelectPage.displayName = 'QuickbooksAccountSelectPage';

export default withPolicy(QuickbooksAccountSelectPage);
