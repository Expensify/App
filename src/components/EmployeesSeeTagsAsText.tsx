import React, {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type EmployeesSeeTagsAsTextProps = {
    customTagName: string;
};

function EmployeesSeeTagsAsText({customTagName}: EmployeesSeeTagsAsTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {prefixWords, suffixWords} = useMemo(() => {
        const template = translate('workspace.tags.employeesSeeTagsAs', {customTagName});
        const parts = template.split(customTagName);

        if (parts.length !== 2) {
            // Fallback: if the placeholder isn't present (or appears multiple times), just render a best-effort string.
            const fallback = translate('workspace.tags.employeesSeeTagsAs', {customTagName});
            return {prefixWords: fallback.match(/(\S+\s*)/g) ?? [], suffixWords: []};
        }

        const prefix = parts.at(0) ?? '';
        const suffix = parts.at(1) ?? '';
        return {prefixWords: prefix.match(/(\S+\s*)/g) ?? [], suffixWords: suffix.match(/(\S+\s*)/g) ?? []};
    }, [customTagName, translate]);

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
