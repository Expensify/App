import Onyx from "react-native-onyx";
import ONYXKEYS from "../ONYXKEYS";


let preferredTheme = 'light';
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_THEME,
    callback: (val) => {
        if(!val) {
            return;
        }

        preferredTheme = val;
    },
});

function themed(theme = 'light', unthemedStyles) {
    // Iterate through unthemedStyles to find instances of 'themeColors.something', and replace them with the actual value of that thing, in the current theme color.
    unthemedStyles.forEach(element => {
        
    });
}