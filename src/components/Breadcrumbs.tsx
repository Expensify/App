import React, {Fragment} from 'react';
import {View} from 'react-native';
import LogoComponent from '@assets/images/expensify-wordmark.svg';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Header from './Header';
import Text from './Text';

type BreadcrumbHeader = {
    type: typeof CONST.BREADCRUMB_TYPE.HEADER;
};

type BreadcrumbStrong = {
    text: string;
    type: typeof CONST.BREADCRUMB_TYPE.STRONG;
};

type Breadcrumb = {
    text: string;
    type?: typeof CONST.BREADCRUMB_TYPE.NORMAL;
};

type BreadcrumbsProps = {
    breadcrumbs: [BreadcrumbHeader | BreadcrumbStrong, Breadcrumb];
};

function Breadcrumbs({breadcrumbs}: BreadcrumbsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap1]}>
            {breadcrumbs.map((breadcrumb, index) => {
                const key = `${JSON.stringify(breadcrumb)}${index}`;
                const style = [styles.breadcrumb, breadcrumb.type === CONST.BREADCRUMB_TYPE.STRONG && styles.breadcrumbStrong];
                const separatorStyle = [style, styles.breadcrumbSeparator];

                return (
                    <Fragment key={key}>
                        {breadcrumb.type === CONST.BREADCRUMB_TYPE.HEADER ? (
                            <View style={styles.breadcrumbLogo}>
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
                            <Text>
                                {index !== 0 && <Text style={separatorStyle}>/</Text>}
                                <Text style={style}>{breadcrumb.text}</Text>
                            </Text>
                        )}
                    </Fragment>
                );
            })}
        </View>
    );
}

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
