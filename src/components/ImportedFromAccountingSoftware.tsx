import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';
import TextBlock from './TextBlock';
import TextLink from './TextLink';
import TextLinkBlock from './TextLinkBlock';

type ImportedFromAccountingSoftwareProps = {
    /** The policy ID to link to */
    policyID: string;

    /** The name of the current connection */
    currentConnectionName: string;

    /** The connected integration */
    connectedIntegration: ConnectionName | undefined;

    /** The translated text for the "imported from" message */
    translatedText: string;

    /** The environment URL for the link */
    environmentURL: string;
};

function ImportedFromAccountingSoftware({policyID, currentConnectionName, translatedText, environmentURL, connectedIntegration}: ImportedFromAccountingSoftwareProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icon = getIntegrationIcon(connectedIntegration);

    return (
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexWrap]}>
            <TextBlock
                textStyles={[styles.textNormal, styles.colorMuted]}
                text={`${translatedText} `}
            />
            <PressableWithoutFeedback
                onPress={() => Link.openLink(`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`, environmentURL)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.close')}
            >
                {!!icon && (
                    <Icon
                        src={icon}
                        height={variables.iconSizeMedium}
                        width={variables.iconSizeMedium}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALLER, ''), styles.appBG]}
                    />
                )}
            </PressableWithoutFeedback>
            <TextLink
                style={[styles.textNormal, styles.link]}
                onPress={() => Link.openLink(`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`, environmentURL)}
            >
                {' '}
            </TextLink>
            <TextLinkBlock
                style={[styles.textNormal, styles.link]}
                href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                text={` ${currentConnectionName} ${translate('workspace.accounting.settings')}`}
            />
            <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
        </View>
    );
}

ImportedFromAccountingSoftware.displayName = 'ImportedFromAccountingSoftware';

export default ImportedFromAccountingSoftware;
