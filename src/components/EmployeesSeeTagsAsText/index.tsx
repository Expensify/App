import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type EmployeesSeeTagsAsTextProps = {
    customTagName: string;
};

function EmployeesSeeTagsAsText({customTagName}: EmployeesSeeTagsAsTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Use a fixed placeholder that won't appear in translation text
    // This avoids issues when the tag name is a single character (e.g., "t" would match "tags" and "as")
    const PLACEHOLDER = '__TAG_NAME_PLACEHOLDER__';
    const template = translate('workspace.tags.employeesSeeTagsAs', {customTagName: PLACEHOLDER});
    const [prefix, suffix] = template.split(PLACEHOLDER);

    // If the placeholder wasn't found (shouldn't happen), fall back to rendering the whole template
    if (prefix === undefined || suffix === undefined) {
        return <Text style={[styles.textNormal, styles.colorMuted]}>{template}</Text>;
    }

    return (
        <>
            <Text style={[styles.textNormal, styles.colorMuted]}>{prefix}</Text>
            <Text style={[styles.textBold, styles.colorMuted]}>{customTagName}</Text>
            <Text style={[styles.textNormal, styles.colorMuted]}>{suffix}</Text>
        </>
    );
}

export default EmployeesSeeTagsAsText;
