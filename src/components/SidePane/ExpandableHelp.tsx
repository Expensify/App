import React, {useState} from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type ExpandableHelpProps = {
    children: React.ReactNode;
    styles: ThemeStyles;
    moreText?: string;
};

function ExpandableHelp({children, styles, moreText = '(more)'}: ExpandableHelpProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isExpanded) {
        return children;
    }

    return (
        <Text
            style={styles.link}
            onPress={() => setIsExpanded(true)}
        >
            {' '}
            {moreText}
        </Text>
    );
}

ExpandableHelp.displayName = 'ExpandableHelp';

export default ExpandableHelp;
