import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpDiagnosticDataProps = {
    /** The styles to apply to the diagnostic data */
    styles: ThemeStyles;

    /** The route that was attempted to be accessed */
    route: string;

    /** Whether the route is an exact match */
    isExactMatch?: boolean;

    /** Help content to display */
    children?: ReactNode;
};

function HelpDiagnosticData({styles, route, children, isExactMatch}: HelpDiagnosticDataProps) {
    const diagnosticTitle = isExactMatch ? 'Help content found for route:' : 'Missing help content for route:';

    return (
        <>
            {!!children && (
                <>
                    {children}
                    <View style={[styles.sectionDividerLine, styles.mv5]} />
                </>
            )}
            <Text style={[styles.textLabelSupportingNormal, styles.mb4]}>Diagnostic data (visible only on staging)</Text>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>{diagnosticTitle}</Text>
            <Text style={styles.textNormal}>{route}</Text>
        </>
    );
}

export default HelpDiagnosticData;
