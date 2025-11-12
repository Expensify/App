import React, {useState} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import {DownArrow, UpArrow} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type CopyableTextFieldProps = {
    /** Text to display and to copy */
    value?: string;

    /** Should an activity indicator be shown instead of the text and button */
    isLoading?: boolean;

    /** Custom styles for the displayed text */
    textStyle?: StyleProp<TextStyle>;

    /** Whether the text field should be expendable */
    shouldDisplayShowMoreButton?: boolean;
};

function CopyableTextField({value, isLoading = false, textStyle, shouldDisplayShowMoreButton = false}: CopyableTextFieldProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const [expanded, setExpanded] = useState(false);

    return (
        <View style={[styles.qbdSetupLinkBox, styles.border, styles.gap4, styles.justifyContentCenter, styles.alignItemsCenter]}>
            {isLoading ? (
                <ActivityIndicator color={theme.text} />
            ) : (
                <>
                    <View style={[styles.w100, styles.flexRow, styles.gap2, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text
                            style={[styles.copyableTextField, textStyle]}
                            numberOfLines={!shouldDisplayShowMoreButton || expanded ? undefined : 4}
                        >
                            {value ?? ''}
                        </Text>
                        <View style={[styles.reportActionContextMenuMiniButton, styles.overflowHidden, styles.buttonHoveredBG]}>
                            <CopyTextToClipboard urlToCopy={value ?? ''} />
                        </View>
                    </View>
                    {shouldDisplayShowMoreButton && (
                        <Button
                            small
                            text={translate(expanded ? 'common.showLess' : 'common.showMore')}
                            onPress={() => setExpanded((current) => !current)}
                            shouldShowRightIcon
                            iconRight={expanded ? UpArrow : DownArrow}
                        />
                    )}
                </>
            )}
        </View>
    );
}

CopyableTextField.displayName = 'CopyableTextField';
export default CopyableTextField;
