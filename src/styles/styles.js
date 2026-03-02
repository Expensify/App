import {StyleSheet} from 'react-native';
import fontFamily from './fontFamily';
import themeColors from './themes/default';
import variables from './variables';
        fontFamily: fontFamily.GTA,
    },
};

// Ensure task descriptions are fully visible
export default StyleSheet.create({
    ...styles,
    taskDescriptionContainer: { maxHeight: undefined, flexShrink: 0 },
});