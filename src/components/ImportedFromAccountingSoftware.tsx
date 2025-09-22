import React from 'react';
import {View} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';
import TextBlock from './TextBlock';
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

    /** The custom tag name */
    customTagName?: string;

    /** Whether we are displaying the tags */
    isDisplayingTags?: boolean;
};

function ImportedFromAccountingSoftware({
    policyID,
    currentConnectionName,
    translatedText,
    connectedIntegration,
    customTagName,
    isDisplayingTags = false,
}: ImportedFromAccountingSoftwareProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const icon = getIntegrationIcon(connectedIntegration);

    console.log('ImportedFromAccountingSoftware: Calling translate with key:', 'workspace.tags.employeesSeeTagsAs', 'params:', {customTagName: customTagName ?? ''});

    if (!customTagName && isDisplayingTags) {
        return undefined;
    }

    return (
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexWrap]}>
            <TextBlock
                textStyles={[styles.textNormal, styles.colorMuted]}
                text={`${translatedText} `}
            />
            <TextLinkBlock
                style={[styles.textNormal, styles.link]}
                href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                text={`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
                prefixIcon={
                    icon ? (
                        <Icon
                            src={icon}
                            height={variables.iconSizeMedium}
                            width={variables.iconSizeMedium}
                            additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALLER, ''), styles.appBG]}
                        />
                    ) : undefined
                }
            />
            <Text style={[styles.textNormal, styles.colorMuted]}>. </Text>
            {isDisplayingTags && (
                <View style={[styles.renderHTML]}>
                    <RenderHTML html={translate('workspace.tags.employeesSeeTagsAs', {customTagName: customTagName ?? ''})} />
                </View>
            )}
        </View>
    );
}

ImportedFromAccountingSoftware.displayName = 'ImportedFromAccountingSoftware';

export default ImportedFromAccountingSoftware;
