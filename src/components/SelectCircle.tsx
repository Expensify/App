import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import globalStyles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

type SelectCircleProps = {
    /** Should we show the checkmark inside the circle */
    isChecked: boolean;

    /** Additional styles to pass to SelectCircle */
    styles: StyleProp<ViewStyle>;
};

function SelectCircle({isChecked = false, styles = []}: SelectCircleProps) {
    return (
        <View style={[globalStyles.selectCircle, globalStyles.alignSelfCenter, styles]}>
            {isChecked && (
                <Icon
                    src={Expensicons.Checkmark}
                    fill={themeColors.iconSuccessFill}
                />
            )}
        </View>
    );
}

SelectCircle.displayName = 'SelectCircle';

export default SelectCircle;
