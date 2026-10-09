/**
 * Describe button for a rule editor's footer. It opens the modal where an admin describes the rule in plain English.
 */
import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import React, {useState} from 'react';

import DescribeRuleModal from './DescribeRuleModal';

type DescribeRuleButtonProps = {
    policyID: string;

    /** The rule type of the editor the button is in, so Concierge fills in that form */
    ruleType: GeneratedRuleType;

    /** Sentry label for the button */
    sentryLabel: string;

    /** Called with the generated form values once Concierge has built the rule */
    onRuleGenerated: (values: GeneratedRuleValues) => void;
};

function DescribeRuleButton({policyID, ruleType, sentryLabel, onRuleGenerated}: DescribeRuleButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <>
            <Button
                size={CONST.BUTTON_SIZE.LARGE}
                style={styles.flex1}
                onPress={() => setIsModalVisible(true)}
                sentryLabel={sentryLabel}
            >
                <Button.Text>{translate('workspace.rules.newRule.describe')}</Button.Text>
            </Button>
            <DescribeRuleModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                policyID={policyID}
                ruleType={ruleType}
                onRuleGenerated={onRuleGenerated}
            />
        </>
    );
}

DescribeRuleButton.displayName = 'DescribeRuleButton';

export default DescribeRuleButton;
