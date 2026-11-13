import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

// Inside the form's scroll view, Android sizes a `flex: 1` slot from the input inside it, so a tall input would make the form taller and push Save behind the keyboard.
// Starting the slot at one input row keeps the input out of the form's height. The slot still grows into any free space, and on a screen too short for that row the form scrolls instead of shrinking the input to nothing.
const getAutoGrowHeightInputContainerStyles = (): ViewStyle => ({
    flexGrow: 1,
    height: variables.componentSizeLarge,
});

export default getAutoGrowHeightInputContainerStyles;
