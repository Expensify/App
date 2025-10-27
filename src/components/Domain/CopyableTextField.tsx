import React, {useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function CopyableTextField({value, isExpandable = false, isLoading = false}: {value?: string; isExpandable?: boolean; isLoading?: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    return (
        <View style={[styles.qbdSetupLinkBox, styles.mt2, styles.border, styles.gap4]}>
            <View style={[styles.flexRow, styles.gap2, styles.justifyContentCenter]}>
                {isLoading ? (
                    <ActivityIndicator color={theme.text} />
                ) : (
                    <>
                        <Text
                            style={[styles.optionRowDisabled, {wordBreak: 'break-all'}, styles.flex1]}
                            numberOfLines={expanded ? undefined : 4}
                        >
                            {value}
                        </Text>
                        <View style={[styles.reportActionContextMenuMiniButton, styles.overflowHidden, styles.buttonHoveredBG]}>
                            <CopyTextToClipboard urlToCopy={value} />
                        </View>
                    </>
                )}
            </View>
            {isExpandable && (
                <Button
                    text={translate(expanded ? 'common.showLess' : 'common.showMore')}
                    small
                    shouldShowRightIcon
                    iconRight={expanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                    style={[styles.alignSelfCenter]}
                    onPress={() => setExpanded((prev) => !prev)}
                />
            )}
        </View>
    );
}

export default CopyableTextField;
