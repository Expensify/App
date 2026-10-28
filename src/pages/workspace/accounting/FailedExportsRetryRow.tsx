import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FailedExportsRetryRowProps = {
    policyID: string;

    /** Number of reports that the admin can export again */
    count: number;

    /** Name of the connected integration, for example "QuickBooks Online" */
    integrationName: string;

    style?: StyleProp<ViewStyle>;
};

/**
 * Offers to export again the reports whose export failed before the accounting connection worked again.
 */
function FailedExportsRetryRow({policyID, count, integrationName, style}: FailedExportsRetryRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.danger}
                    additionalStyles={[styles.mr2]}
                />
                <Text style={[styles.mutedNormalTextLabel, styles.label, styles.textLabelError, styles.flexShrink1]}>
                    {translate('workspace.accounting.failedExportsToRetry.message', {count, integrationName})}
                </Text>
            </View>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                variant={CONST.BUTTON_VARIANT.DANGER}
                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RETRY_FAILED_EXPORTS.getRoute(policyID))}
            >
                <Button.Text>{translate('common.review')}</Button.Text>
            </Button>
        </View>
    );
}

export default FailedExportsRetryRow;
