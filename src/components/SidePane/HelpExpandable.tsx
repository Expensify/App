import React, {useState} from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpExpandableProps = {
    children: React.ReactNode;
    styles: ThemeStyles;
    title?: string;
    moreText?: string;
};

function HelpExpandable({children, styles, title, moreText = '(more)'}: HelpExpandableProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <Text style={styles.textNormal}>
                {title}{' '}
                {!isExpanded && (
                    <Text
                        style={styles.link}
                        onPress={() => setIsExpanded(true)}
                    >
                        {moreText}
                    </Text>
                )}
            </Text>
            {isExpanded && children}
        </>
    );
}

HelpExpandable.displayName = 'ExpandableHelp';

export default HelpExpandable;
