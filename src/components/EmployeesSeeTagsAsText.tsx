import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type EmployeesSeeTagsAsTextProps = {
    customTagName: string;
};

function EmployeesSeeTagsAsText({customTagName}: EmployeesSeeTagsAsTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const template = translate('workspace.tags.employeesSeeTagsAs', {customTagName});
    const parts = template.split(customTagName);

    const prefix = parts.length === 2 ? (parts.at(0) ?? '') : template;
    const suffix = parts.length === 2 ? (parts.at(1) ?? '') : '';

    const prefixWords = prefix.match(/(\S+\s*)/g) ?? [];
    const suffixWords = suffix.match(/(\S+\s*)/g) ?? [];

    return (
        <>
            {prefixWords.map((word, index) => (
                <Text
                    // eslint-disable-next-line react/no-array-index-key
                    key={`prefix-${index}`}
                    style={[styles.textNormal, styles.colorMuted]}
                >
                    {word}
                </Text>
            ))}
            <Text style={[styles.textBold, styles.colorMuted]}>{customTagName}</Text>
            {suffixWords.map((word, index) => (
                <Text
                    // eslint-disable-next-line react/no-array-index-key
                    key={`suffix-${index}`}
                    style={[styles.textNormal, styles.colorMuted]}
                >
                    {word}
                </Text>
            ))}
        </>
    );
}

export default EmployeesSeeTagsAsText;

