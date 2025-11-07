import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type CopyableTextFieldProps = {
    /** Text to display and to copy */
    value?: string;

    /** Should an activity indicator be shown instead of the text and button */
    isLoading?: boolean;
};

function CopyableTextField({value, isLoading = false}: CopyableTextFieldProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    return (
        <View style={[styles.qbdSetupLinkBox, styles.border, styles.flexRow, styles.gap2, styles.justifyContentCenter, styles.alignItemsCenter]}>
            {isLoading ? (
                <ActivityIndicator color={theme.text} />
            ) : (
                <>
                    <Text style={styles.copyableTextField}>{value ?? ''}</Text>
                    <View style={[styles.reportActionContextMenuMiniButton, styles.overflowHidden, styles.buttonHoveredBG]}>
                        <CopyTextToClipboard urlToCopy={value ?? ''} />
                    </View>
                </>
            )}
        </View>
    );
}

CopyableTextField.displayName = 'CopyableTextField';
export default CopyableTextField;
