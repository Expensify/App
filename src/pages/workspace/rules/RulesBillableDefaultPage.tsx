import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyBillableMode} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RulesBillableDefaultPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT>;

function RulesBillableDefaultPage({
    route: {
        params: {policyID},
    },
}: RulesBillableDefaultPageProps) {
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();

    const billableModes = [
        {
            value: true,
            text: translate(`workspace.rules.individualExpenseRules.billable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.billableDescription`),
            keyForList: CONST.POLICY_BILLABLE_MODES.BILLABLE,
            isSelected: policy?.defaultBillable,
        },
        {
            value: false,
            text: translate(`workspace.rules.individualExpenseRules.nonBillable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.nonBillableDescription`),
            keyForList: CONST.POLICY_BILLABLE_MODES.NON_BILLABLE,
            isSelected: !policy?.defaultBillable,
        },
    ];

    const initiallyFocusedOptionKey = policy?.defaultBillable ? CONST.POLICY_BILLABLE_MODES.BILLABLE : CONST.POLICY_BILLABLE_MODES.NON_BILLABLE;

    const tagsPageLink = useMemo(() => {
        if (policy?.areTagsEnabled) {
            return `${environmentURL}/${ROUTES.WORKSPACE_TAGS.getRoute(policyID)}`;
        }

        return `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`;
    }, [environmentURL, policy?.areTagsEnabled, policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesBillableDefaultPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.billableDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flexRow, styles.renderHTML, styles.mt3, styles.mh5, styles.mb5]}>
                    <RenderHTML html={translate('workspace.rules.individualExpenseRules.billableDefaultDescription', tagsPageLink)} />
                </View>
                <SelectionList
                    data={billableModes}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        setPolicyBillableMode(policyID, item.value);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={initiallyFocusedOptionKey}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesBillableDefaultPage;
