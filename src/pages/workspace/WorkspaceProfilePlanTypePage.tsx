import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CardSectionUtils from '@pages/settings/Subscription/CardSection/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const theme = useTheme();
    const styles = useThemeStyles();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

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

    const isControl = policy?.type === CONST.POLICY.TYPE.CORPORATE;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    const isPlanTypeLocked = isControl && isAnnual;

    const lockedIcon = (option: WorkspacePlanTypeItem) =>
        option.value === policy?.type ? (
            <Icon
                src={Expensicons.Lock}
                fill={theme.success}
            />
        ) : null;

    const handleUpdatePlan = () => {
        if (policy?.type === currentPlan) {
            Navigation.goBack();
            return;
        }

        if (policy?.type === CONST.POLICY.TYPE.TEAM && currentPlan === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID));
        }
    };

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
                {isPlanTypeLocked ? (
                    <Text style={[styles.mh5, styles.mv3]}>
                        {translate('workspace.planTypePage.lockedPlanDescription', {
                            subscriptionUsersCount: privateSubscription?.userCount ?? 1,
                            annualSubscriptionEndDate: CardSectionUtils.getNextBillingDate(),
                        })}{' '}
                        <TextLink onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}>{translate('workspace.common.subscription')}</TextLink>.
                    </Text>
                ) : (
                    <Text style={[styles.mh5, styles.mv3]}>
                        {translate('workspace.planTypePage.description')}{' '}
                        <TextLink href={CONST.PLAN_TYPES_AND_PRICING_HELP_URL}>{translate('workspace.planTypePage.subscriptionLink')}</TextLink>.
                    </Text>
                )}
                <SelectionList
                    shouldIgnoreFocus
                    sections={[{data: workspacePlanTypes, isDisabled: isPlanTypeLocked}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => {
                        setCurrentPlan(option.value);
                    }}
                    rightHandSideComponent={isPlanTypeLocked ? lockedIcon : null}
                    shouldUpdateFocusedIndex
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={workspacePlanTypes.find((mode) => mode.isSelected)?.keyForList}
                />
                <FixedFooter>
                    <Button
                        success
                        large
                        text={isPlanTypeLocked ? translate('common.buttonConfirm') : translate('common.save')}
                        style={styles.mt6}
                        onPress={handleUpdatePlan}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfilePlanTypePage.displayName = 'WorkspaceProfilePlanTypePage';

export default withPolicy(WorkspaceProfilePlanTypePage);
