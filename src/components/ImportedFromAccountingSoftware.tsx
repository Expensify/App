import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';

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
        <Text style={[styles.alignItemsCenter, styles.dInlineFlex]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{`${translatedText} `}</Text>
            <TextLink
                style={[styles.textNormal, styles.link, styles.flexRow, styles.alignItemsCenter, styles.dInlineFlex, styles.gap1]}
                href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
            >
                {!!icon && (
                    <Icon
                        src={icon}
                        height={variables.iconSizeMedium}
                        width={variables.iconSizeMedium}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALLER, '')]}
                    />
                )}
                {`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
            </TextLink>
            <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
        </Text>
    );
}

ImportedFromAccountingSoftware.displayName = 'ImportedFromAccountingSoftware';

export default ImportedFromAccountingSoftware;
