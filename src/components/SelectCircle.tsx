import React from 'react';
import {View} from 'react-native';
import globalStyles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

type SelectCircleProps = {
    /** Should we show the checkmark inside the circle */
    isChecked: boolean;

    /** Additional styles to pass to SelectCircle */
    styles: Array<Record<string, unknown>>;
};

function SelectCircle({isChecked = false, styles = []}: SelectCircleProps) {
    return (
        <View style={[globalStyles.selectCircle, globalStyles.alignSelfCenter, ...styles]}>
            {isChecked && (
                <Icon
                    src={Expensicons.Checkmark}
                    fill={themeColors.iconSuccessFill}
                />
            )}
        </View>
    );
}

export default SelectCircle;
