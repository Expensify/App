import Onyx from "react-native-onyx";
import ONYXKEYS from "../ONYXKEYS";
import darkGreen from "../styles/themes/darkGreen";
import light from "../styles/themes/default";

let preferredTheme = false;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_THEME,
    callback: (val) => {
        preferredTheme = val;
    },
});

function themed(unthemedStyles) {
    console.log('unthemedStyles: ', unthemedStyles);
    // console.log('preferredTheme: ', preferredTheme);
    // // Iterate through unthemedStyles to find instances of 'themeColors.something', and replace them with the actual value of that thing, in the current theme color. This is the hacky version :)
    // const themedStyles = unthemedStyles.map(element => {
    //     let theme = preferredTheme ? darkGreen : light;
    //     console.log(theme);
    //     console.log(typeof theme);
    //     for (const key in element) {
    //         if(typeof element[key] === 'string') {
    //             if (element[key].match(/#[A-F0-9]{6}/)) {
    //                 const desiredStyleKey = key;
    //                 console.log(key);
    //                 console.log(typeof key);
    //                 console.log(element[key]);
    //                 console.log('-----');
    //                 console.log(theme[key]);

    //             }
    //         }
    //     }
    //     return element;
    // });

    // console.log('themedStyles: ', themedStyles);
    // return themedStyles;

    return unthemedStyles;
}

export {
    themed,
}