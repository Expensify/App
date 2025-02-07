import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type CustomRulesSectionProps = {
    policyID: string;
};

function CustomRulesSection({policyID}: CustomRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.customRules.title')}
            subtitle={translate('workspace.rules.customRules.description')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            <View style={[styles.mt3]}>
                <OfflineWithFeedback
                    pendingAction={policy?.pendingFields?.customRules}
                    errors={policy?.errors?.customRules}
                >
                    <MenuItemWithTopDescription
                        title={policy?.customRules ?? ''}
                        description={translate('workspace.rules.customRules.subtitle')}
                        shouldShowRightIcon
                        interactive
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM.getRoute(policyID))}
                        shouldRenderAsHTML
                    />
                </OfflineWithFeedback>
            </View>
        </Section>
    );
}

export default CustomRulesSection;
