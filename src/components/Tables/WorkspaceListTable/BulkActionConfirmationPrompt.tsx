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

    /** What the action changes, listed under the message */
    consequences?: string[];

    /** Notes about the selected workspaces the action leaves out */
    notes?: string[];
};

/** The prompt of a bulk action confirmation, listing the consequences the same way as useMembersNeedCategoryModal */
function BulkActionConfirmationPrompt({message, consequences = [], notes = []}: BulkActionConfirmationPromptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={styles.gap4}>
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
            {notes.map((note) => (
                <Text key={note}>{note}</Text>
            ))}
        </View>
    );
}

export default BulkActionConfirmationPrompt;
