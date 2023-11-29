import React from 'react';
import {View} from 'react-native';
import LogoComponent from '@assets/images/expensify-wordmark.svg';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Header from './Header';
import Text from './Text';

type BreadcrumbRootWorkspace = {
    type: typeof CONST.BREADCRUMB_TYPE.ROOT;
};

type Breadcrumb = {
    text: string;
    type?: typeof CONST.BREADCRUMB_TYPE.STRONG | typeof CONST.BREADCRUMB_TYPE.NORMAL;
};

type BreadcrumbsProps = {
    breadcrumbs: Array<BreadcrumbRootWorkspace | Breadcrumb>;
};

function Breadcrumbs({breadcrumbs}: BreadcrumbsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap1]}>
            {breadcrumbs.map((breadcrumb, index) => {
                const key = `${breadcrumb.type === CONST.BREADCRUMB_TYPE.ROOT ? CONST.BREADCRUMB_TYPE.ROOT : breadcrumb.text}${index}`;
                const style = [styles.breadcrumb, breadcrumb.type === CONST.BREADCRUMB_TYPE.STRONG && styles.breadcrumbStrong];
                const separatorStyle = [style, styles.breadcrumbSeparator];

                return (
                    <>
                        {breadcrumb.type === CONST.BREADCRUMB_TYPE.ROOT ? (
                            <View key={key}>
                                <Header
                                    title={
                                        <LogoComponent
                                            fill={theme.text}
                                            width={variables.lhnLogoWidth}
                                            height={variables.lhnLogoHeight}
                                            style={styles.breadcrumbLogo}
                                        />
                                    }
                                    shouldShowEnvironmentBadge
                                />
                            </View>
                        ) : (
                            <>
                                {index !== 0 && (
                                    <Text
                                        key={`${key}-separator`}
                                        style={separatorStyle}
                                    >
                                        /
                                    </Text>
                                )}
                                <Text
                                    key={key}
                                    style={style}
                                >
                                    {breadcrumb.text}
                                </Text>
                            </>
                        )}
                    </>
                );
            })}
        </View>
    );
}

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
