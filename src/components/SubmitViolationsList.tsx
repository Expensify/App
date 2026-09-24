import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type SubmitViolationsListProps = {
    /** The violation messages to render, one per row */
    violations: string[];
};

/**
 * Renders each violation next to a dot icon instead of a plain unicode bullet character (see PR #101662
 * design review). The dot column has a fixed width and is vertically centered against the label, and the
 * label sits in a flex1 column so wrapped text aligns under the first line, like a real <ul>.
 */
function SubmitViolationsList({violations}: SubmitViolationsListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={styles.gap3}>
            {violations.map((violation) => (
                <View
                    key={violation}
                    style={[styles.flexRow, styles.pl4, styles.pr4]}
                >
                    <View style={[styles.alignItemsCenter, {width: variables.iconSizeExtraSmall, marginTop: (variables.lineHeightNormal - variables.iconSizeExtraSmall) / 2}]}>
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.danger}
                            height={variables.iconSizeExtraSmall}
                            width={variables.iconSizeExtraSmall}
                        />
                    </View>
                    <Text style={[styles.flex1, styles.ml2, styles.textLabel, styles.textDanger]}>{violation}</Text>
                </View>
            ))}
        </View>
    );
}

export default SubmitViolationsList;
