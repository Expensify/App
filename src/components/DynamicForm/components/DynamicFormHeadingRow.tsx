import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormHeading} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type DynamicFormHeadingRowProps = {
    heading: DynamicFormHeading;

    /** The heading opens the page, so it needs no space above it */
    isFirst: boolean;
};

/** A title between the fields of a schema-driven form, with an optional description under it */
function DynamicFormHeadingRow({heading, isFirst}: DynamicFormHeadingRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const title = getLocalizedText(translate, heading.titleKey, heading.title);
    const description = getLocalizedText(translate, heading.descriptionKey, heading.description);

    return (
        <View style={[styles.mb2, !isFirst && styles.mt3]}>
            {!!title && (
                <Text
                    style={styles.textStrong}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {title}
                </Text>
            )}
            {!!description && <Text style={[styles.textSupporting, !!title && styles.mt1]}>{description}</Text>}
        </View>
    );
}

export default DynamicFormHeadingRow;
