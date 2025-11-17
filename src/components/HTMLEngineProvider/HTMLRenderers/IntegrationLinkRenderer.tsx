import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {View} from 'react-native';
import Icon from '@components/Icon';
import TextLink from '@components/TextLink';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

type IntegrationLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

function IntegrationLinkRenderer({tnode}: IntegrationLinkRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const href = tnode.attributes.href;
    const textAttribute = tnode.attributes['data-text'] ?? '';
    const linkText = textAttribute.trim();
    const integrationName = (tnode.attributes['data-integration'] ?? '') as ConnectionName | '';
    const iconSource = integrationName ? getIntegrationIcon(integrationName) : undefined;

    if (!href || !linkText) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {iconSource && (
                <>
                    <Icon
                        src={iconSource}
                        height={variables.iconSizeMedium}
                        width={variables.iconSizeMedium}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALLER, ''), styles.appBG]}
                    />
                    <View style={styles.pl1} />
                </>
            )}
            <TextLink
                style={[styles.textNormal, styles.link]}
                href={href}
            >
                {linkText}
            </TextLink>
        </View>
    );
}

IntegrationLinkRenderer.displayName = 'IntegrationLinkRenderer';

export default IntegrationLinkRenderer;

