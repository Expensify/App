import React, {ReactNode} from 'react';
import useThemeStyles from '@styles/useThemeStyles';
import Section from './Section';

type WalletSectionProps = {
    /** Contents to display inside the section */
    children?: ReactNode;

    /** The icon to display along with the title */
    icon?: (props: unknown) => React.ReactNode;

    /** The text to display in the subtitle of the section */
    subtitle?: string;

    /** The text to display in the title of the section */
    title: string;
};

function WalletSection({children, icon, subtitle, title}: WalletSectionProps) {
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

WalletSection.displayName = 'WalletSection';

export default WalletSection;
