import React, {useMemo} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
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

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const maxExpenseAmountNoReceiptText = useMemo(() => {
        if (policy?.maxExpenseAmountNoReceipt === CONST.DEFAULT_MAX_EXPENSE_AMOUNT_NO_RECEIPT || !policy?.maxExpenseAmountNoReceipt) {
            return '';
        }

        return `${(policy.maxExpenseAmountNoReceipt / 100).toFixed(2)} ${policyCurrency}`;
    }, [policy?.maxExpenseAmountNoReceipt, policyCurrency]);

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
        >
            <View style={[styles.mt3]}>
                <MenuItemWithTopDescription
                    key={translate('workspace.rules.individualExpenseRules.receiptRequiredAmount')}
                    shouldShowRightIcon
                    title={maxExpenseAmountNoReceiptText}
                    description={translate('workspace.rules.individualExpenseRules.receiptRequiredAmount')}
                    onPress={() => {
                        Navigation.navigate(ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID));
                    }}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    numberOfLinesTitle={2}
                />
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSection;
