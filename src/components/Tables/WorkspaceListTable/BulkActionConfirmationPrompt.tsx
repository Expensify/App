import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type BulkActionConfirmationPromptProps = {
    /** The question the user is confirming */
    message: string;

    /** Points listed under the message as bullets */
    consequences?: string[];
};

/** The prompt of a bulk action confirmation, listing the consequences the same way as useMembersNeedCategoryModal */
function BulkActionConfirmationPrompt({message, consequences = []}: BulkActionConfirmationPromptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View>
            <Text>{message}</Text>
            {consequences.length > 0 && (
                <View style={styles.mt3}>
                    {consequences.map((consequence) => (
                        <View
                            key={consequence}
                            style={[styles.flexRow, styles.alignItemsStart]}
                        >
                            <View style={[StyleUtils.getHeight(variables.fontSizeNormalHeight), styles.justifyContentCenter, styles.ph2]}>
                                <Icon
                                    src={icons.DotIndicator}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                    fill={theme.text}
                                />
                            </View>
                            <Text style={styles.flex1}>{consequence}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export default BulkActionConfirmationPrompt;
