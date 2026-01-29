import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import Text from './Text';

type ActionBadgeProps = {
    /** The translation key for the action verb (e.g., "submit", "approve", "pay", "export") */
    verb: string;

    /** Whether the badge should be displayed in error state (red) */
    isError?: boolean;
};

/** Maps action badge verb keys to their translation paths */
const VERB_TRANSLATION_MAP: Record<string, TranslationPaths> = {
    submit: 'common.submit',
    approve: 'search.bulkActions.approve',
    pay: 'iou.pay',
    export: 'common.export',
};

function ActionBadge({verb, isError = false}: ActionBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const badgeColor = isError ? theme.danger : theme.success;
    const translationKey = VERB_TRANSLATION_MAP[verb];
    const translatedVerb = translationKey ? translate(translationKey) : verb;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <View
                style={[
                    styles.actionBadgeDot,
                    {backgroundColor: badgeColor},
                ]}
            />
            <Text style={[styles.actionBadgeText, {color: badgeColor}]}>{translatedVerb}</Text>
        </View>
    );
}

ActionBadge.displayName = 'ActionBadge';

export default ActionBadge;
