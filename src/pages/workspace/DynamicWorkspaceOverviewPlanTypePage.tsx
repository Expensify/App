import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import OpenWorkspacePlanPage from '@libs/actions/Policy/Plan';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import Navigation from '@navigation/Navigation';

import CardSectionUtils from '@pages/settings/Subscription/CardSection/utils';
import type {PersonalPolicyTypeExcludedProps} from '@pages/settings/Subscription/SubscriptionPlan/SubscriptionPlanCard';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';

import {format, parseISO} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import type {WithPolicyProps} from './withPolicy';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';

type WorkspacePlanTypeItem = {
    value: ValueOf<typeof CONST.POLICY.TYPE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.POLICY.TYPE>;
    isSelected: boolean;
    actionElement?: ReactNode;
};
/** What saving the selected plan does, so the save handler and its Sentry label stay in sync */
const PLAN_UPDATE_OUTCOME = {
    UPGRADE: 'upgrade',
    DOWNGRADE: 'downgrade',
    DOWNGRADE_BLOCKED: 'downgradeBlocked',
    NO_CHANGE: 'noChange',
} as const;

const PLAN_TYPE_SAVE_SENTRY_LABELS = {
    [PLAN_UPDATE_OUTCOME.UPGRADE]: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE_UPGRADE,
    [PLAN_UPDATE_OUTCOME.DOWNGRADE]: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE_DOWNGRADE,
    [PLAN_UPDATE_OUTCOME.DOWNGRADE_BLOCKED]: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE_DOWNGRADE_BLOCKED,
    [PLAN_UPDATE_OUTCOME.NO_CHANGE]: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE_NO_CHANGE,
};

function DynamicWorkspaceOverviewPlanTypePage({policy}: WithPolicyProps) {
    const [currentPlan, setCurrentPlan] = useState(policy?.type);
    const policyID = policy?.id;
    const {translate, dateFnsLocale} = useLocalize();
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

    const isControl = policy?.type === CONST.POLICY.TYPE.CORPORATE;
    const isAnnual = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;

    const isPlanTypeLocked = isControl && isAnnual && !policy.canDowngrade;

    const isCurrentPolicySubmit = isSubmitPolicy(policy);
    const workspacePlanTypes = Object.values(CONST.POLICY.TYPE)
        .filter((type): type is PersonalPolicyTypeExcludedProps => {
            if (type === CONST.POLICY.TYPE.PERSONAL) {
                return false;
            }
            // Per the design: the Submit row only appears when the current workspace is already
            // Submit. This hides Submit from Collect/Control workspaces (no downgrade path) while
            // still surfacing Collect/Control as upgrade options for Submit workspaces.
            if (type === CONST.POLICY.TYPE.SUBMIT && !isCurrentPolicySubmit) {
                return false;
            }
            return true;
        })
        .map<WorkspacePlanTypeItem>((policyType) => ({
            value: policyType,
            text: translate(`workspace.planTypePage.planTypes.${policyType}.label`),
            alternateText: translate(`workspace.planTypePage.planTypes.${policyType}.description`),
            keyForList: policyType,
            isSelected: policyType === currentPlan,
            actionElement:
                isPlanTypeLocked && policyType === policy?.type ? (
                    <Icon
                        src={expensifyIcons.Lock}
                        fill={theme.success}
                    />
                ) : undefined,
        }))
        .reverse();

    // `endDate` is a yyyy-MM-dd calendar date. `parseISO` reads it as local midnight, where passing the string straight to
    // `format` reads it as UTC midnight and shows the previous day in timezones behind UTC.
    const autoRenewalDate = privateSubscription?.endDate
        ? format(parseISO(privateSubscription.endDate), CONST.DATE.MONTH_DAY_YEAR_ORDINAL_FORMAT, {locale: dateFnsLocale})
        : CardSectionUtils.getNextBillingDate(dateFnsLocale);

    const getPlanUpdateOutcome = (): ValueOf<typeof PLAN_UPDATE_OUTCOME> => {
        // Submit policies don't expose SUBMIT in the option list, but the editor can
        // still pick Team/Corporate. Route any selection from a Submit policy to the
        // upgrade screen — the polished Submit-specific upgrade UX ships in #87263.
        if (policyID && policy?.type === CONST.POLICY.TYPE.SUBMIT && (currentPlan === CONST.POLICY.TYPE.TEAM || currentPlan === CONST.POLICY.TYPE.CORPORATE)) {
            return PLAN_UPDATE_OUTCOME.UPGRADE;
        }

        if (policyID && policy?.type === CONST.POLICY.TYPE.TEAM && currentPlan === CONST.POLICY.TYPE.CORPORATE) {
            return PLAN_UPDATE_OUTCOME.UPGRADE;
        }

        if (policyID && policy?.type === CONST.POLICY.TYPE.CORPORATE && currentPlan === CONST.POLICY.TYPE.TEAM) {
            return isSubscriptionTypeOfInvoicing(privateSubscription?.type) ? PLAN_UPDATE_OUTCOME.DOWNGRADE_BLOCKED : PLAN_UPDATE_OUTCOME.DOWNGRADE;
        }

        return PLAN_UPDATE_OUTCOME.NO_CHANGE;
    };
    const planUpdateOutcome = getPlanUpdateOutcome();

    const handleUpdatePlan = () => {
        if (planUpdateOutcome === PLAN_UPDATE_OUTCOME.UPGRADE && policyID) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, undefined, undefined, undefined, currentPlan));
            return;
        }

        if (planUpdateOutcome === PLAN_UPDATE_OUTCOME.DOWNGRADE_BLOCKED) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
            return;
        }

        if (planUpdateOutcome === PLAN_UPDATE_OUTCOME.DOWNGRADE) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_DOWNGRADE.path));
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
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
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
                            ListItem={SingleSelectListItem}
                            onSelectRow={(option) => {
                                setCurrentPlan(option.value);
                            }}
                            shouldUpdateFocusedIndex
                            shouldSingleExecuteRowSelect
                            shouldIgnoreFocus
                            initiallyFocusedItemKey={workspacePlanTypes.find((mode) => mode.isSelected)?.keyForList}
                            alternateNumberOfSupportedLines={2}
                            addBottomSafeAreaPadding
                            footerContent={
                                <Button
                                    sentryLabel={PLAN_TYPE_SAVE_SENTRY_LABELS[planUpdateOutcome]}
                                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                                    size={CONST.BUTTON_SIZE.LARGE}
                                    style={styles.mt6}
                                    onPress={handleUpdatePlan}
                                >
                                    <Button.Text>{isPlanTypeLocked ? translate('common.buttonConfirm') : translate('common.save')}</Button.Text>
                                </Button>
                            }
                        />
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(DynamicWorkspaceOverviewPlanTypePage);
