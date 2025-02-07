import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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
                {/* <OfflineWithFeedback
              pendingAction={item.pendingAction}
              key={translate(item.descriptionTranslationKey)}
          > */}
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={policy?.rules?.customRules ?? ''}
                    description={translate('workspace.rules.customRules.subtitle')}
                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM.getRoute(policyID))}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    numberOfLinesTitle={2}
                />
                {/* </OfflineWithFeedback> */}
            </View>
        </Section>
    );
}

export default CustomRulesSection;
