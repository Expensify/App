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


export {
    themed,
}