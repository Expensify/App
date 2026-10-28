import FormHeader from '@components/Form/Layout/FormHeader';
/**
 * Modal where an admin describes a rule in plain English and Concierge fills in the open rule editor's form.
 */
import Modal from '@components/Modal';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {clearNewRulePrompt} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import type {PolicyCategory} from '@src/types/onyx';
import type {GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import React, {useState} from 'react';

import DescribeRuleForm from './DescribeRuleForm';

type DescribeRuleModalProps = {
    isVisible: boolean;

    onClose: () => void;

    policyID: string;

    /** The rule type of the editor that opens the modal */
    ruleType: GeneratedRuleType;

    /** Called with the generated form values and their rule type after Concierge builds the rule */
    onRuleGenerated: (values: GeneratedRuleValues, generatedRuleType: GeneratedRuleType) => void;

    /** Whether a new rule can use the category, so a generated category that already has this kind of rule shows an error */
    isCategoryEligible?: (category: PolicyCategory) => boolean;
};

function DescribeRuleModal({isVisible, onClose, policyID, ruleType, onRuleGenerated, isCategoryEligible}: DescribeRuleModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    // We need to use isSmallScreenWidth here because the Modal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Each opening gets a new form, so a description that is still building when the modal closes cannot fill in the
    // editor after the modal opens again.
    const [formKey, setFormKey] = useState(0);
    const [wasVisible, setWasVisible] = useState(isVisible);
    if (isVisible !== wasVisible) {
        setWasVisible(isVisible);
        if (isVisible) {
            setFormKey((key) => key + 1);
        }
    }

    const dismiss = () => {
        clearNewRulePrompt();
        onClose();
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={dismiss}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            outerStyle={isSmallScreenWidth ? StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop) : undefined}
            avoidKeyboard
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <DescribeRuleForm
                key={formKey}
                policyID={policyID}
                ruleType={ruleType}
                isActive={isVisible}
                shouldFocusInput
                submitButtonText={translate('common.next')}
                inputContainerStyle={isSmallScreenWidth ? styles.describeRulePromptInputNarrow : styles.describeRulePromptInput}
                style={[styles.mt5, styles.mh5]}
                addBottomSafeAreaPadding={isSmallScreenWidth}
                onRuleGenerated={onRuleGenerated}
                isCategoryEligible={isCategoryEligible}
                onFinish={onClose}
            >
                <FormHeader description={translate('workspace.rules.newRule.describeRule')} />
            </DescribeRuleForm>
        </Modal>
    );
}

DescribeRuleModal.displayName = 'DescribeRuleModal';

export default DescribeRuleModal;
