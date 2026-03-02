import {StyleSheet} from 'react-native';
import fontFamily from './fontFamily';
import themeColors from './themes/default';
import variables from './variables';
        fontFamily: fontFamily.GTA,
    },
};

// Export as StyleSheet to ensure proper styling
export default StyleSheet.create({
    ...styles,
    taskDescriptionContainer: { maxHeight: undefined },
});