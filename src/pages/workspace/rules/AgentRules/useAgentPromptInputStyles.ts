import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE} from '@pages/settings/Agents/const';

import type {StyleProp, ViewStyle} from 'react-native';

import useShouldUseExpandedRevampFormLayout from './useShouldUseExpandedRevampFormLayout';

function useAgentPromptInputStyles(): StyleProp<ViewStyle> {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardActive} = useKeyboardState();
    const shouldUseExpandedRevampFormLayout = useShouldUseExpandedRevampFormLayout();

    if (isInLandscapeMode && isKeyboardActive) {
        return StyleUtils.getHeight(PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE);
    }
    return [styles.flex1, shouldUseExpandedRevampFormLayout && [styles.mnh0, styles.agentRulePromptInput]];
}

export default useAgentPromptInputStyles;
