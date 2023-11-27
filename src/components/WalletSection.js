import PropTypes from 'prop-types';
import React from 'react';
import useThemeStyles from '@styles/useThemeStyles';
import Section from './Section';

const propTypes = {
    /** Contents to display inside the section */
    children: PropTypes.node,

    /** The icon to display along with the title */
    icon: PropTypes.func,

    /** The text to display in the subtitle of the section */
    subtitle: PropTypes.string,

    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    children: null,
    icon: null,
    subtitle: null,
};

function WalletSection({children, icon, subtitle, title}) {
    const styles = useThemeStyles();
    return (
        <Section
            icon={icon}
            subtitle={subtitle}
            title={title}
            containerStyles={[styles.p0, styles.pv5]}
            titleStyles={[styles.ph5]}
            subtitleStyles={[styles.ph5]}
        >
            {children}
        </Section>
    );
}

WalletSection.defaultProps = defaultProps;
WalletSection.displayName = 'WalletSection';
WalletSection.propTypes = propTypes;

export default WalletSection;
