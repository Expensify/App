import React from 'react';
import {View} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import EmployeesSeeTagsAsText from './EmployeesSeeTagsAsText/index';
import Icon from './Icon';
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

    /** Whether we are displaying  tags */
    shouldShow?: boolean;
};

function ImportedFromAccountingSoftware({policyID, currentConnectionName, translatedText, connectedIntegration, customTagName, shouldShow = false}: ImportedFromAccountingSoftwareProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare']);
    const icon = getIntegrationIcon(connectedIntegration, expensifyIcons);

    if (!customTagName && shouldShow) {
        return null;
    }

    return (
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexWrap, styles.breakWord]}>
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
            {shouldShow && !!customTagName && <EmployeesSeeTagsAsText customTagName={customTagName} />}
        </View>
    );
}

export default ImportedFromAccountingSoftware;
