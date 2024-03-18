import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import ContextMenuItem from './ContextMenuItem';
import * as Expensicons from './Icon/Expensicons';

type CommunicationsLinkProps = ChildrenProps & {
    /** Styles to be assigned to Container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Value to be copied or passed via tap. */
    value: string;
};

function CommunicationsLink({value, containerStyles, children}: CommunicationsLinkProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.pRelative, containerStyles]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.communicationsLinkHeight]}>
                <View style={styles.flexShrink1}>{children}</View>
                <ContextMenuItem
                    icon={Expensicons.Copy}
                    text={translate('reportActionContextMenu.copyToClipboard')}
                    successIcon={Expensicons.Checkmark}
                    successText={translate('reportActionContextMenu.copied')}
                    isMini
                    onPress={() => Clipboard.setString(value)}
                />
            </View>
        </View>
    );
}

CommunicationsLink.displayName = 'CommunicationsLink';

export default CommunicationsLink;
