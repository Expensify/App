import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import DragAndDropConsumer from './DragAndDrop/Consumer';
import Icon from './Icon';
import Text from './Text';

type DropZoneUIProps = {
    /** Callback to execute when a file is dropped. */
    onDrop: (event: DragEvent) => void;

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
};

function DropZoneUI({onDrop, icon, dropTitle, dropStyles, dropTextStyles, dropInnerWrapperStyles}: DropZoneUIProps) {
    const styles = useThemeStyles();

    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.w100, styles.h100, styles.dropWrapper, styles.p2]}>
                <View style={[styles.borderRadiusComponentLarge, styles.p2, styles.flex1, dropStyles]}>
                    {/* TODO: display dropInnerWrapper styles only when hovered over - will be done in Stage 4 (two zones) */}
                    <View style={[styles.dropInnerWrapper, styles.justifyContentCenter, styles.alignItemsCenter, styles.borderRadiusComponentNormal, dropInnerWrapperStyles]}>
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
        </DragAndDropConsumer>
    );
}

DropZoneUI.displayName = 'DropZoneUI';

export default DropZoneUI;
