import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import AutoEmailLink from '@components/AutoEmailLink';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    /** Expensicon for the page */
    icon: PropTypes.func.isRequired,

    /** Color for the icon (should be from theme) */
    iconColor: PropTypes.string,

    /** Title message below the icon */
    title: PropTypes.string.isRequired,

    /** Subtitle message below the title */
    subtitle: PropTypes.string,

    /** Link message below the subtitle */
    linkKey: PropTypes.string,

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink: PropTypes.bool,

    /** The custom icon width */
    iconWidth: PropTypes.number,

    /** The custom icon height */
    iconHeight: PropTypes.number,

    /** Function to call when pressing the navigation link */
    onLinkPress: PropTypes.func,

    /** Whether we should embed the link with subtitle */
    shouldEmbedLinkWithSubtitle: PropTypes.bool,
};

const defaultProps = {
    iconColor: undefined,
    subtitle: '',
    shouldShowLink: false,
    linkKey: 'notFound.goBackHome',
    iconWidth: variables.iconSizeSuperLarge,
    iconHeight: variables.iconSizeSuperLarge,
    onLinkPress: () => Navigation.dismissModal(),
    shouldEmbedLinkWithSubtitle: false,
};

function BlockingView(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    function renderContent() {
        return (
            <>
                <AutoEmailLink
                    style={[styles.textAlignCenter]}
                    text={props.subtitle}
                />
                {props.shouldShowLink ? (
                    <TextLink
                        onPress={props.onLinkPress}
                        style={[styles.link, styles.mt2]}
                    >
                        {translate(props.linkKey)}
                    </TextLink>
                ) : null}
            </>
        );
    }

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
            <Icon
                src={props.icon}
                fill={props.iconColor || theme.offline}
                width={props.iconWidth}
                height={props.iconHeight}
            />
            <Text style={[styles.notFoundTextHeader]}>{props.title}</Text>

            {props.shouldEmbedLinkWithSubtitle ? (
                <Text style={[styles.textAlignCenter]}>{renderContent()}</Text>
            ) : (
                <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{renderContent()}</View>
            )}
        </View>
    );
}

BlockingView.propTypes = propTypes;
BlockingView.defaultProps = defaultProps;
BlockingView.displayName = 'BlockingView';

export default BlockingView;
