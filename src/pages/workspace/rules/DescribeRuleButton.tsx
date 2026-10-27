/**
 * Describe button for a rule editor's footer. It opens the modal where an admin describes the rule in plain English.
 */
import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearNewRulePrompt} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import type {PolicyCategory} from '@src/types/onyx';
import type {GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import React, {useState} from 'react';

import DescribeRuleModal from './DescribeRuleModal';

type DescribeRuleButtonProps = {
    /** Sentry label for the button */
    sentryLabel: string;
} & (
    | {
          policyID: string;

          /** The rule type of the editor the button is in, so Concierge fills in that form */
          ruleType: GeneratedRuleType;

          /** Called with the generated form values once Concierge has built the rule */
          onRuleGenerated: (values: GeneratedRuleValues) => void;

          /** Whether a new rule can use the category, so a generated category that already has this kind of rule shows an error */
          isCategoryEligible?: (category: PolicyCategory) => boolean;

          onPress?: never;
      }
    | {
          /** Opens a DescribeRuleModal that the editor renders itself. Use it when the footer can remount while the modal is open,
           * for example a footer that moves on rotation, because the button's own modal would close with it. */
          onPress: () => void;
      }
);

function DescribeRuleButton(props: DescribeRuleButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        clearNewRulePrompt();
        if (props.onPress) {
            props.onPress();
            return;
        }
        setIsModalVisible(true);
    };

    return (
        <>
            <Button
                size={CONST.BUTTON_SIZE.LARGE}
                style={styles.flex1}
                onPress={openModal}
                sentryLabel={props.sentryLabel}
            >
                <Button.Text>{translate('workspace.rules.newRule.describe')}</Button.Text>
            </Button>
            {!props.onPress && (
                <DescribeRuleModal
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    policyID={props.policyID}
                    ruleType={props.ruleType}
                    onRuleGenerated={props.onRuleGenerated}
                    isCategoryEligible={props.isCategoryEligible}
                />
            )}
        </>
    );
}

DescribeRuleButton.displayName = 'DescribeRuleButton';

export default DescribeRuleButton;
