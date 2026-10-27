import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

type HeaderTitleSubtitleProps = {
    /** The subtitle text to display */
    children: string;
};

function HeaderTitleSubtitle({children}: HeaderTitleSubtitleProps) {
    const styles = useThemeStyles();

    return (
        <Text
            style={[styles.mutedTextLabel, styles.pre]}
            numberOfLines={1}
        >
            {children}
        </Text>
    );
}

export default HeaderTitleSubtitle;
