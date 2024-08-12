import React from 'react';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type IndividualExpenseRulesSectionProps = {
    policyID: string;
};

function IndividualExpenseRulesSection({policyID}: IndividualExpenseRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const handleOnPressCategoriesLink = () => {
        if (policy?.areCategoriesEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    const handleOnPressTagsLink = () => {
        if (policy?.areTagsEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.individualExpenseRules.title')}
            renderSubtitle={() => (
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.subtitle')}</Text>{' '}
                    <TextLink
                        style={styles.link}
                        onPress={handleOnPressCategoriesLink}
                    >
                        {translate('workspace.common.categories').toLowerCase()}
                    </TextLink>{' '}
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.and')}</Text>{' '}
                    <TextLink
                        style={styles.link}
                        onPress={handleOnPressTagsLink}
                    >
                        {translate('workspace.common.tags').toLowerCase()}
                    </TextLink>
                    .
                </Text>
            )}
            subtitle={translate('workspace.rules.individualExpenseRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
        />
    );
}

export default IndividualExpenseRulesSection;
