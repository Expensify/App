import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import Text from './Text';

type SubmitViolationsListProps = {
    /** The violation messages to render, one per row */
    violations: string[];
};

const dotColumnStyle = {width: variables.iconSizeExtraSmall, marginTop: (variables.lineHeightNormal - variables.iconSizeExtraSmall) / 2};

/**
 * Renders each violation next to a dot icon instead of a plain unicode bullet character. The dot column has
 * a fixed width and is vertically centered against the label, and the label sits in a flex1 column so
 * wrapped text aligns under the first line, like a real <ul>.
 */
function SubmitViolationsList({violations}: SubmitViolationsListProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={styles.gap3}>
            {violations.map((violation) => (
                <View
                    key={violation}
                    style={[styles.flexRow, styles.ph4]}
                >
                    <View style={[styles.alignItemsCenter, dotColumnStyle]}>
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.danger}
                            height={variables.iconSizeExtraSmall}
                            width={variables.iconSizeExtraSmall}
                        />
                    </View>
                    <Text style={[styles.flex1, styles.ml2, styles.textLabel, StyleUtils.getColorStyle(theme.textError)]}>{violation}</Text>
                </View>
            ))}
        </View>
    );
}

export default SubmitViolationsList;
