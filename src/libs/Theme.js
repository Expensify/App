import Onyx from "react-native-onyx";
import ONYXKEYS from "../ONYXKEYS";
import darkGreen from "../styles/themes/darkGreen";
import * as light from "../styles/themes/default";
import styles from '../styles/styles';

function themed(unthemedStyles, preferredTheme) {
    console.log('styles before themed function is called');
    console.log(styles.button.backgroundColor);
    console.log('preferredTheme: ', preferredTheme);
    // Iterate through unthemedStyles to find instances of 'themeColors.something', and replace them with the actual value of that thing, in the current theme color. This is the hacky version :)
    // const themedStyles = unthemedStyles.map(element => {
    //     let theme = preferredTheme ? darkGreen : light;
    //     for (const key in element) {
    //         if (typeof element[key] === 'string') {
    //             if (element[key].substring(0, 11) === 'themeColors') {
    //                 const desiredStyleKey = element[key].substring(12);
    //                 const newStyle = theme[desiredStyleKey];
    //                 element[key] = newStyle;
    //             }
    //         }
    //     }
    //     return element;
    // });
    const themedStyles = [];
    unthemedStyles.forEach(styleObject => {
        const themedStyleObject = {}
        for (const key in styleObject) {
            const value = styleObject[key];
            if (typeof value === 'string') {
                if (value.substring(0, 11) === 'themeColors') {
                    const desiredStylePath = value.substring(12);
                    const newStyle = preferredTheme ? darkGreen[desiredStylePath] : light[desiredStylePath];
                    themedStyleObject[key] = newStyle;
                    continue;
                }
            }
            themedStyleObject[key] = value;
        }
        themedStyles.push(themedStyleObject);
    });

    console.log('after themed function.');
    console.log(styles.button.backgroundColor);
  
    return themedStyles;
}

export {
    themed,
}