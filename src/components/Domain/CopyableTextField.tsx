import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type CopyableTextFieldProps = {
    /** Text to display and to copy */
    value?: string;

    /** Whether the text field should limit the number of lines to 4 and display a button to show more */
    isExpandable?: boolean;
};

function CopyableTextField({value, isExpandable = false}: CopyableTextFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={[styles.qbdSetupLinkBox, styles.border, styles.gap4]}>
            <View style={[styles.flexRow, styles.gap2, styles.justifyContentCenter]}>
                <Text
                    style={styles.copyableTextField}
                    numberOfLines={expanded ? undefined : 4}
                >
                    {value}
                </Text>
                <View style={[styles.reportActionContextMenuMiniButton, styles.overflowHidden, styles.buttonHoveredBG]}>
                    <CopyTextToClipboard urlToCopy={value} />
                </View>
            </View>
            {isExpandable && (
                <Button
                    text={translate(expanded ? 'common.showLess' : 'common.showMore')}
                    small
                    shouldShowRightIcon
                    iconRight={expanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                    style={styles.alignSelfCenter}
                    onPress={() => setExpanded((prev) => !prev)}
                />
            )}
        </View>
    );
}

export default CopyableTextField;
