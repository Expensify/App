import React from 'react';
import { View } from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import LogoComponent from '@assets/images/expensify-wordmark.svg';
import useTheme from '@styles/themes/useTheme';
import variables from '@styles/variables';
import Text from './Text';
import Header from './Header';

type BreadcrumbRoot = {
    type: 'expensify';
}

type Breadcrumb = {
    text: string;
    type?: 'strong' | 'normal';
}

type BreadcrumbsProps = {
    breadcrumbs: Array<BreadcrumbRoot | Breadcrumb>;
};

function Breadcrumbs({breadcrumbs}: BreadcrumbsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignSelfStart, styles.gap2]}>
            {breadcrumbs.map((breadcrumb, index) => (
                <>
                    {breadcrumb.type === 'expensify' ? (
                        <View style={{ width: variables.lhnLogoWidth }}>
                            <Header
                                title={
                                    <LogoComponent
                                        fill={theme.text}
                                        width={variables.lhnLogoWidth}
                                        height={variables.lhnLogoHeight}
                                    />
                                }
                                shouldShowEnvironmentBadge
                            />
                        </View>
                    ) : (
                        <>
                            {index !== 0 && (
                                <Text style={styles.breadcrumb}>/</Text>
                            )}
                            <Text style={styles.breadcrumb}>
                                {breadcrumb.text}
                            </Text>
                        </>
                    )}
                </>
            ))}
        </View>
    );
}

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
