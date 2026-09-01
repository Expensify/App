import TextLink from '@components/TextLink';

import useThemeStyles from '@hooks/useThemeStyles';

import {Linking} from 'react-native';

type HeaderTitleSubtitleLinkProps = {
    /** The URL to open on press, also used as the displayed link text */
    children: string;
};

function HeaderTitleSubtitleLink({children}: HeaderTitleSubtitleLinkProps) {
    const styles = useThemeStyles();

    return (
        <TextLink
            onPress={() => {
                Linking.openURL(children);
            }}
            numberOfLines={1}
            style={styles.label}
        >
            {children}
        </TextLink>
    );
}

export default HeaderTitleSubtitleLink;
