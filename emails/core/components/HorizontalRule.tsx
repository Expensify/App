import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';

function HorizontalRule() {
    const {hr: hrStyle} = useThemeStyles();
    return <hr style={hrStyle} />;
}

HorizontalRule.displayName = 'HorizontalRule';

export default HorizontalRule;
