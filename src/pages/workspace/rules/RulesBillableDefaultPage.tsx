import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RulesBillableDefaultPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT>;

function RulesBillableDefaultPage({
    route: {
        params: {policyID},
    },
}: RulesBillableDefaultPageProps) {
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const billableModes = [
        {
            value: true,
            text: translate('workspace.rules.individualExpenseRules.billable'),
            alternateText: translate('workspace.rules.individualExpenseRules.billableDescription'),
            keyForList: CONST.POLICY_BILLABLE_MODES.BILLABLE,
            isSelected: policy?.defaultBillable,
        },
        {
            value: false,
            text: translate('workspace.rules.individualExpenseRules.nonBillable'),
            alternateText: translate('workspace.rules.individualExpenseRules.nonBillableDescription'),
            keyForList: CONST.POLICY_BILLABLE_MODES.NON_BILLABLE,
            isSelected: !policy?.defaultBillable,
        },
    ];

    const initiallyFocusedOptionKey = policy?.defaultBillable ? CONST.POLICY_BILLABLE_MODES.BILLABLE : CONST.POLICY_BILLABLE_MODES.NON_BILLABLE;

    const handleOnPressTagsLink = () => {
        if (policy?.areTagsEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesBillableDefaultPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.billableDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.billableDefaultDescription')}</Text>{' '}
                    <TextLink
                        style={styles.link}
                        onPress={handleOnPressTagsLink}
                    >
                        {translate('workspace.common.tags').toLowerCase()}
                    </TextLink>
                    .
                </Text>
                <SelectionList
                    sections={[{data: billableModes}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        Policy.setPolicyBillableMode(policyID, item.value);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesBillableDefaultPage.displayName = 'RulesBillableDefaultPage';

export default RulesBillableDefaultPage;
