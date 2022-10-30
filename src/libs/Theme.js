import Onyx from "react-native-onyx";
import ONYXKEYS from "../ONYXKEYS";
import darkGreen from "../styles/themes/darkGreen";
import * as light from "../styles/themes/default";

let preferredTheme = false;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_THEME,
    callback: (val) => {
        console.log(val);
        preferredTheme = val;
    },
});

function themed(unthemedStyles) {
    // Iterate through unthemedStyles to find instances of 'themeColors.something', and replace them with the actual value of that thing, in the current theme color. This is the hacky version :)
    const themedStyles = unthemedStyles.map(element => {
        let theme = preferredTheme ? darkGreen : light;
        for (const key in element) {
            if(typeof element[key] === 'string') {
                if (element[key].substring(0, 11) === 'themeColors') {
                const desiredStyleKey = element[key].substring(12);
                const newStyle = theme[desiredStyleKey];
                element[key] = newStyle;
            }
            }
        }
        return element;
    });
  
    return themedStyles;
}

export {
    themed,
}