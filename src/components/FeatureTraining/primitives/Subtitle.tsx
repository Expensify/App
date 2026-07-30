import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';

type SubtitleProps = {
    children?: ReactNode;
};

function Subtitle({children}: SubtitleProps) {
    const styles = useThemeStyles();

    if (children == null || children === '') {
        return null;
    }

    return <Text style={[styles.textLabel, styles.textBold, styles.textSuccess]}>{children}</Text>;
}

Subtitle.displayName = 'FeatureTraining.Subtitle';

export default Subtitle;
export type {SubtitleProps};
