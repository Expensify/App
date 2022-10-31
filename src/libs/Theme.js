import _ from 'underscore';
import darkGreen from '../styles/themes/darkGreen';
import * as light from '../styles/themes/default';

function themed(unthemedStyles, preferredTheme) {
    const themedStyles = [];

    // Check out each individual style object.
    unthemedStyles.forEach((styleObject) => {
        // We make a new object here, bc mutating styleObject would change the content of styles.js.
        // i.e. styleObject is a chunk of the styles const in styles.js.
        const themedStyleObject = {};

        // Iterate through the object to find anything that want's to be replaced with a themed color.
        // these will be strings of the form 'themeColors.buttonDefaultBG'.
        const keys = _.keys(styleObject);
        keys.forEach((key) => {
            const value = styleObject[key];
            if (typeof value === 'string') {
                if (value.substring(0, 11) === 'themeColors') {
                    // desiredStylePath is the key in the theme object which holds our desired color.
                    const desiredStylePath = value.substring(12);

                    // We are supplied the preferredTheme from the HOC provider.
                    // Note: preferred theme is a bool right now, but for the real deal we would use a string (the theme name)
                    // This is also where we would ask the OS what theme it wants using React.Appearance
                    // This is also where we would add a default theme.
                    const newStyle = preferredTheme ? darkGreen[desiredStylePath] : light[desiredStylePath];
                    themedStyleObject[key] = newStyle;
                    return;
                }
            }

            // If we're here, it's because this style does not need replacing, so we just pass it through.
            themedStyleObject[key] = value;
        });
        themedStyles.push(themedStyleObject);
    });

    return themedStyles;
}

export default themed;
