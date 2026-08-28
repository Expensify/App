import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/ButtonComposed';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type CopyableTextFieldProps = {
    /** Text to display and to copy */
    value?: string;

    /** Should an activity indicator be shown instead of the text and button */
    isLoading?: boolean;

    /** Custom styles for the outer most View */
    style?: StyleProp<ViewStyle>;

    /** Custom styles for the displayed text */
    textStyle?: StyleProp<TextStyle>;

    /** Whether the text field should be expandable */
    shouldDisplayShowMoreButton?: boolean;
};

function CopyableTextField({value, isLoading = false, style, textStyle, shouldDisplayShowMoreButton = false}: CopyableTextFieldProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const [expanded, setExpanded] = useState(false);
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);

    return (
        <View style={[styles.qbdSetupLinkBox, styles.border, styles.gap4, styles.justifyContentCenter, styles.alignItemsCenter, style]}>
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
                        <CopyTextToClipboard
                            urlToCopy={value ?? ''}
                            styles={styles.copyableTextFieldButton}
                            iconStyles={styles.mr0}
                            shouldHaveActiveBackground
                            shouldUseButtonBackground
                            inline={false}
                        />
                    </View>
                    {shouldDisplayShowMoreButton && (
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            onPress={() => setExpanded((current) => !current)}
                        >
                            <Button.Text>{translate(expanded ? 'common.showLess' : 'common.showMore')}</Button.Text>
                            <Button.Icon src={expanded ? icons.UpArrow : icons.DownArrow} />
                        </Button>
                    )}
                </>
            )}
        </View>
    );
}

export default CopyableTextField;
