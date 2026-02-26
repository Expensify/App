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

    return (
        <>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.employeesSeeTagsAs')} </Text>
            <Text style={[styles.textBold, styles.colorMuted]}>{customTagName}</Text>
            <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
        </>
    );
}

export default EmployeesSeeTagsAsText;
