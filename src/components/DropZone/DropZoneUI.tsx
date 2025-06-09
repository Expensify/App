import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type DropZoneUIProps = {
    /** Icon to display in the drop zone */
    icon: IconAsset;

    /** Title to display in the drop zone */
    dropTitle?: string;

    /** Custom styles for the drop zone */
    dropStyles?: StyleProp<ViewStyle>;

    /** Custom styles for the drop zone text */
    dropTextStyles?: StyleProp<TextStyle>;

    /** Custom styles for the inner wrapper of the drop zone */
    dropInnerWrapperStyles?: StyleProp<ViewStyle>;

    /** Custom styles for the drop wrapper */
    dropWrapperStyles?: StyleProp<ViewStyle>;
};

function DropZoneUI({icon, dropTitle, dropStyles, dropTextStyles, dropWrapperStyles, dropInnerWrapperStyles}: DropZoneUIProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.dropWrapper, styles.p2, dropWrapperStyles]}>
            <View style={[styles.borderRadiusComponentLarge, styles.p2, styles.flex1, dropStyles]}>
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.borderRadiusComponentNormal, dropInnerWrapperStyles, styles.dropInnerWrapper]}>
                    <View style={styles.mb3}>
                        <Icon
                            src={icon}
                            width={100}
                            height={100}
                        />
                    </View>
                    <Text style={[styles.textDropZone, dropTextStyles]}>{dropTitle}</Text>
                </View>
            </View>
        </View>
    );
}

DropZoneUI.displayName = 'DropZoneUI';

export default DropZoneUI;
