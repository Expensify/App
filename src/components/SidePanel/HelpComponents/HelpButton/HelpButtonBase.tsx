// import React from 'react';
// import Icon from '@components/Icon';
// import * as Expensicons from '@components/Icon/Expensicons';
// import {PressableWithoutFeedback} from '@components/Pressable';
// import Tooltip from '@components/Tooltip';
// import useLocalize from '@hooks/useLocalize';
// import useSidePanel from '@hooks/useSidePanel';
// import useTheme from '@hooks/useTheme';
// import useThemeStyles from '@hooks/useThemeStyles';
import type HelpButtonProps from './types';

// The Help panel is currently disabled. To open it manually, run:
// Onyx.set('nvp_sidePanel', { open: true }) in the console.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HelpButton({style}: HelpButtonProps) {
    return null;
}

// function HelpButton({style}: HelpButtonProps) {
//     const styles = useThemeStyles();
//     const theme = useTheme();
//     const {translate} = useLocalize();
//     const {openSidePanel} = useSidePanel();

//     if (shouldHideHelpButton) {
//         return null;
//     }

//     return (
//         <Tooltip text={translate('common.help')}>
//             <PressableWithoutFeedback
//                 accessibilityLabel={translate('common.help')}
//                 style={[styles.flexRow, styles.touchableButtonImage, style]}
//                 onPress={openSidePanel}
//             >
//                 <Icon
//                     src={Expensicons.QuestionMark}
//                     fill={theme.icon}
//                 />
//             </PressableWithoutFeedback>
//         </Tooltip>
//     );
// }

HelpButton.displayName = 'HelpButtonBase';

export default HelpButton;
