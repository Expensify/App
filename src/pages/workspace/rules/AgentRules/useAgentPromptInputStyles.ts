import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE} from '@pages/settings/Agents/const';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

function useAgentPromptInputStyles(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardActive} = useKeyboardState();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const shouldUseExpandedRevampFormLayout = isRulesRevampEnabled && !isInLandscapeMode;

    if (isInLandscapeMode && isKeyboardActive) {
        return StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE);
    }
    return [styles.flex1, shouldUseExpandedRevampFormLayout && [styles.mnh0, styles.agentRulePromptInput]];
}

export default useAgentPromptInputStyles;
