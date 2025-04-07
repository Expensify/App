import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import HelpDiagnosticData from './HelpComponents/HelpDiagnosticData';
import type {ContentComponent} from './HelpContent/helpContentMap';
import helpContentMap from './HelpContent/helpContentMap';

function getHelpContent(styles: ThemeStyles, route: string, isProduction: boolean): ReactNode {
    const routeParts = route.substring(1).split('/');
    const helpContentComponents: ContentComponent[] = [];
    let activeHelpContent = helpContentMap;
    let isExactMatch = true;

    for (const part of routeParts) {
        if (activeHelpContent?.children?.[part]) {
            activeHelpContent = activeHelpContent.children[part];
            helpContentComponents.push(activeHelpContent.content);
        } else {
            if (helpContentComponents.length === 0) {
                // eslint-disable-next-line react/no-unescaped-entities
                helpContentComponents.push(() => <Text style={styles.textHeadlineH1}>We couldn't find any help content for this route.</Text>);
            }
            isExactMatch = false;
            break;
        }
    }

    const content = helpContentComponents.reverse().map((HelpContentNode, index) => {
        return (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`help-content-${index}`}>
                <HelpContentNode styles={styles} />
                {index < helpContentComponents.length - 1 && <View style={[styles.sectionDividerLine, styles.mv5]} />}
            </React.Fragment>
        );
    });

    if (isProduction) {
        return content;
    }

    return (
        <HelpDiagnosticData
            key={`help-diagnostic-data-${route}`}
            styles={styles}
            route={route}
            isExactMatch={isExactMatch}
        >
            {content}
        </HelpDiagnosticData>
    );
}

export default getHelpContent;
