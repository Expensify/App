import TextLink from '@components/TextLink';

import useThemeStyles from '@hooks/useThemeStyles';

import {Linking} from 'react-native';

type HeaderTitleSubtitleLinkProps = {
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
