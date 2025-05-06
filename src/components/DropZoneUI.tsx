import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
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
};

function DropZoneUI({onDrop, icon, dropTitle, dropStyles}: DropZoneUIProps) {
    const styles = useThemeStyles();

    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter, dropStyles]}>
                <View style={styles.mb3}>
                    <Icon
                        src={icon}
                        width={100}
                        height={100}
                    />
                </View>
                <Text style={[styles.textHeadline]}>{dropTitle}</Text>
            </View>
        </DragAndDropConsumer>
    );
}

DropZoneUI.displayName = 'DropZoneUI';

export default DropZoneUI;
