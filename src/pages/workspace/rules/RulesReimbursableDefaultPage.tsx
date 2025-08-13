import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCashExpenseReimbursableMode, setPolicyReimbursableMode} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type RulesReimbursableDefaultPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT>;

function RulesReimbursableDefaultPage({
    route: {
        params: {policyID},
    },
}: RulesReimbursableDefaultPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const reimbursableMode = getCashExpenseReimbursableMode(policyID);

    const ReimbursableModes = Object.values(CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES).map((mode) => ({
        text: translate(`workspace.rules.individualExpenseRules.${mode}`),
        alternateText: translate(`workspace.rules.individualExpenseRules.${mode}Description`),
        value: mode,
        isSelected: reimbursableMode === mode,
        keyForList: mode,
    }));

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={RulesReimbursableDefaultPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.cashExpenseDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.cashExpenseDefaultDescription')}</Text>
                </Text>
                <SelectionList
                    sections={[{data: ReimbursableModes}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        setPolicyReimbursableMode(policyID, item.value);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={reimbursableMode}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesReimbursableDefaultPage.displayName = 'RulesReimbursableDefaultPage';

export default RulesReimbursableDefaultPage;
