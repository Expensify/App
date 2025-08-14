import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

type CustomListHeaderProps = {
    canSelectMultiple: boolean | undefined;
    leftHeaderText?: string | undefined;
    rightHeaderText?: string | undefined;
    rightHeaderMinimumWidth?: number;
};

function CustomListHeader({canSelectMultiple, leftHeaderText = '', rightHeaderText = '', rightHeaderMinimumWidth = 60}: CustomListHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const header = (
        <View
            style={[
                styles.flex1,
                styles.flexRow,
                styles.justifyContentBetween,
                // Required padding accounting for the checkbox in multi-select mode
                canSelectMultiple && styles.pl3,
            ]}
        >
            <Text style={styles.textMicroSupporting}>{leftHeaderText}</Text>
            <View style={[StyleUtils.getMinimumWidth(rightHeaderMinimumWidth)]}>
                <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>{rightHeaderText}</Text>
            </View>
        </View>
    );

    if (canSelectMultiple) {
        return header;
    }
    return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
}

export default CustomListHeader;
