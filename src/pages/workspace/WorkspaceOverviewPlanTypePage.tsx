import {format} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import OpenWorkspacePlanPage from '@libs/actions/Policy/Plan';
import Navigation from '@navigation/Navigation';
import CardSectionUtils from '@pages/settings/Subscription/CardSection/utils';
import type {PersonalPolicyTypeExcludedProps} from '@pages/settings/Subscription/SubscriptionPlan/SubscriptionPlanCard';
import CONST from '@src/CONST';
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
function WorkspaceOverviewPlanTypePage({policy}: WithPolicyProps) {
    const [currentPlan, setCurrentPlan] = useState(policy?.type);
    const policyID = policy?.id;
    const {translate, preferredLocale} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const privateSubscription = usePrivateSubscription();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

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
            text: translate(`workspace.planTypePage.planTypes.${policyType as PersonalPolicyTypeExcludedProps}.label`),
            alternateText: translate(`workspace.planTypePage.planTypes.${policyType as PersonalPolicyTypeExcludedProps}.description`),
            keyForList: policyType,
            isSelected: policyType === currentPlan,
        }))
        .reverse();

    const isControl = policy?.type === CONST.POLICY.TYPE.CORPORATE;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const autoRenewalDate = privateSubscription?.endDate
        ? format(privateSubscription.endDate, CONST.DATE.MONTH_DAY_YEAR_ORDINAL_FORMAT)
        : CardSectionUtils.getNextBillingDate(preferredLocale);

    /** If user has the annual Control plan and their first billing cycle is completed, they cannot downgrade the Workspace plan to Collect. */
    const isPlanTypeLocked = isControl && isAnnual && !policy.canDowngrade;

    const lockedIcon = (option: WorkspacePlanTypeItem) =>
        option.value === policy?.type ? (
            <Icon
                src={expensifyIcons.Lock}
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
                testID="WorkspaceOverviewPlanTypePage"
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding
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
                                <TextLink onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(Navigation.getActiveRoute()))}>
                                    {translate('workspace.planTypePage.subscriptions')}
                                </TextLink>
                                .
                            </Text>
                        ) : (
                            <Text style={[styles.mh5, styles.mv3]}>
                                {translate('workspace.planTypePage.description')}{' '}
                                <TextLink href={CONST.PLAN_TYPES_AND_PRICING_HELP_URL}>{translate('workspace.planTypePage.subscriptionLink')}</TextLink>.
                            </Text>
                        )}
                        <SelectionList
                            data={workspacePlanTypes}
                            isDisabled={isPlanTypeLocked}
                            ListItem={RadioListItem}
                            onSelectRow={(option) => {
                                setCurrentPlan(option.value);
                            }}
                            rightHandSideComponent={isPlanTypeLocked ? lockedIcon : null}
                            shouldUpdateFocusedIndex
                            shouldSingleExecuteRowSelect
                            shouldIgnoreFocus
                            initiallyFocusedItemKey={workspacePlanTypes.find((mode) => mode.isSelected)?.keyForList}
                            addBottomSafeAreaPadding
                            footerContent={
                                <Button
                                    success
                                    large
                                    text={isPlanTypeLocked ? translate('common.buttonConfirm') : translate('common.save')}
                                    style={styles.mt6}
                                    onPress={handleUpdatePlan}
                                />
                            }
                        />
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOverviewPlanTypePage);
