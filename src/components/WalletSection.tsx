import React from 'react';
import {SvgProps} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import Section from './Section';

type WalletSectionProps = ChildrenProps & {
    /** The icon to display along with the title */
    icon: React.FC<SvgProps>;

    /** The text to display in the subtitle of the section */
    subtitle: string;

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
