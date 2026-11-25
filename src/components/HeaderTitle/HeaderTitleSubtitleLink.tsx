import TextLink from '@components/TextLink';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

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
            sentryLabel={CONST.SENTRY_LABEL.HEADER_TITLE.SUBTITLE_LINK}
            style={styles.label}
        >
            {children}
        </TextLink>
    );
}

export default HeaderTitleSubtitleLink;
