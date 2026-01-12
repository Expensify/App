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
    shouldDivideEqualWidth?: boolean;
    shouldShowRightCaret?: boolean;
};

function CustomListHeader({
    canSelectMultiple,
    leftHeaderText = '',
    rightHeaderText = '',
    rightHeaderMinimumWidth = 60,
    shouldDivideEqualWidth = false,
    shouldShowRightCaret = false,
}: CustomListHeaderProps) {
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
            <Text style={[styles.textMicroSupporting, shouldDivideEqualWidth && styles.flex1]}>{leftHeaderText}</Text>
            <View style={[shouldDivideEqualWidth ? styles.flex1 : StyleUtils.getMinimumWidth(rightHeaderMinimumWidth), shouldShowRightCaret && styles.mr6]}>
                <Text style={[styles.textMicroSupporting, !shouldDivideEqualWidth && styles.textAlignCenter]}>{rightHeaderText}</Text>
            </View>
        </View>
    );

    if (canSelectMultiple) {
        return header;
    }
    return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
}

export default CustomListHeader;
