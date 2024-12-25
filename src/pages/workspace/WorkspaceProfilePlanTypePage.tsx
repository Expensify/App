import {format} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
import OpenWorkspacePlanPage from '@libs/actions/Policy/Plan';
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
    const policyID = policy?.id;
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    useEffect(() => {
        if (!policyID) {
            return;
        }
        OpenWorkspacePlanPage(policyID);
    }, [policyID]);

    useEffect(() => {
        setCurrentPlan(policy?.type);
    }, [policy?.type]);

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
    const autoRenewalDate = privateSubscription?.endDate ? format(privateSubscription.endDate, CONST.DATE.MONTH_DAY_YEAR_ORDINAL_FORMAT) : CardSectionUtils.getNextBillingDate();

    /** If user has the annual Control plan and their first billing cycle is completed, they cannot downgrade the Workspace plan to Collect. */
    const isPlanTypeLocked = isControl && isAnnual && !policy.canDowngrade;

    const lockedIcon = (option: WorkspacePlanTypeItem) =>
        option.value === policy?.type ? (
            <Icon
                src={Expensicons.Lock}
                fill={theme.success}
            />
        ) : null;

    const handleUpdatePlan = () => {
        if (policyID && policy?.type === CONST.POLICY.TYPE.TEAM && currentPlan === CONST.POLICY.TYPE.CORPORATE) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID));
            return;
        }

        if (policyID && policy?.type === CONST.POLICY.TYPE.CORPORATE && currentPlan === CONST.POLICY.TYPE.TEAM) {
            Navigation.navigate(ROUTES.WORKSPACE_DOWNGRADE.getRoute(policyID));
            return;
        }

        if (policy?.type === currentPlan) {
            Navigation.goBack();
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
                {policy?.isLoading ? (
                    <View style={styles.flex1}>
                        <FullScreenLoadingIndicator />
                    </View>
                ) : (
                    <>
                        {isPlanTypeLocked ? (
                            <Text style={[styles.mh5, styles.mv3]}>
                                {translate('workspace.planTypePage.lockedPlanDescription', {
                                    count: privateSubscription?.userCount ?? 1,
                                    annualSubscriptionEndDate: autoRenewalDate,
                                })}{' '}
                                <TextLink onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}>{translate('workspace.planTypePage.subscriptions')}</TextLink>.
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
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfilePlanTypePage.displayName = 'WorkspaceProfilePlanTypePage';

export default withPolicy(WorkspaceProfilePlanTypePage);
