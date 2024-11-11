import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type WorkspacePlanTypeItem = {
    value: ValueOf<typeof CONST.POLICY.TYPE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.POLICY.TYPE>;
    isSelected: boolean;
};
function WorkspaceProfilePlanTypePage({policy}: WithPolicyProps) {
    const [currentPlan, setCurrentPlan] = useState(policy?.type);
    const policyID = policy?.id ?? '-1';
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const workspacePlanTypes = Object.values(CONST.POLICY.TYPE)
        .filter((type) => type !== CONST.POLICY.TYPE.PERSONAL)
        .map<WorkspacePlanTypeItem>((policyType) => ({
            value: policyType,
            text: translate(`workspace.planTypePage.planTypes.${policyType as Exclude<typeof policyType, 'personal'>}.label`),
            alternateText: translate(`workspace.planTypePage.planTypes.${policyType as Exclude<typeof policyType, 'personal'>}.description`),
            keyForList: policyType,
            isSelected: policyType === currentPlan,
        }))
        .reverse();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                testID={WorkspaceProfilePlanTypePage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton title={translate('workspace.common.planType')} />
                <Text style={[styles.mh5, styles.mv3]}>
                    {translate('workspace.planTypePage.description')} <TextLink href={CONST.PLAN_TYPES_AND_PRICING_HELP_URL}>{translate('workspace.planTypePage.subscriptionLink')}</TextLink>
                    .
                </Text>
                <SelectionList
                    shouldIgnoreFocus
                    sections={[{data: workspacePlanTypes}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => {
                        setCurrentPlan(option.value);
                    }}
                    shouldUpdateFocusedIndex
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={workspacePlanTypes.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
            <FixedFooter>
                <Button
                    success
                    large
                    text={translate('common.save')}
                    style={styles.mt6}
                    onPress={() => {
                        Navigation.goBack();
                    }}
                />
            </FixedFooter>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfilePlanTypePage.displayName = 'WorkspaceProfilePlanTypePage';

export default withPolicy(WorkspaceProfilePlanTypePage);
