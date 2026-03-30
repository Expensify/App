import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setExpensifyCardRule} from '@libs/actions/Card';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type SpendRulePageBaseProps = {
    policyID: string;
    titleKey: TranslationPaths;
    testID: string;
};

function SpendRulePageBase({policyID, titleKey, testID}: SpendRulePageBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const domainAccountID = useDefaultFundID(policyID);

    const handleSaveRule = useCallback(() => {
        setExpensifyCardRule({
            domainAccountID,
            cardRuleID: String(rand64()),
            cardRuleValue: '',
        });
        Navigation.goBack();
    }, [domainAccountID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.mh5]}>
                        <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate('workspace.rules.spendRules.cardsSectionTitle')}</Text>
                        <MenuItem
                            title={translate('workspace.rules.spendRules.chooseCards')}
                            onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID))}
                            shouldShowRightIcon
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SECTION_ITEM}
                        />
                    </View>
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('workspace.rules.merchantRules.saveRule')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={false}
                    onSubmit={handleSaveRule}
                    enabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SAVE}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRulePageBase.displayName = 'SpendRulePageBase';

export default SpendRulePageBase;
