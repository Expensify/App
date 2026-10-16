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

    /** Color of the dot, the text and the button. The default is green, because the row offers an action and does not report an error. */
    tone?: typeof CONST.BUTTON_VARIANT.SUCCESS | typeof CONST.BUTTON_VARIANT.DANGER;

    style?: StyleProp<ViewStyle>;
};

/**
 * Offers to export again the reports whose export failed before the accounting connection worked again.
 */
function FailedExportsRetryRow({policyID, count, integrationName, tone = CONST.BUTTON_VARIANT.SUCCESS, style}: FailedExportsRetryRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const isDanger = tone === CONST.BUTTON_VARIANT.DANGER;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={isDanger ? theme.danger : theme.success}
                    additionalStyles={[styles.mr2]}
                />
                <Text style={[styles.mutedNormalTextLabel, styles.label, isDanger ? styles.textLabelError : styles.textSuccess, styles.flexShrink1]}>
                    {translate('workspace.accounting.failedExportsToRetry.message', {count, integrationName})}
                </Text>
            </View>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                variant={tone}
                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RETRY_FAILED_EXPORTS.getRoute(policyID))}
            >
                <Button.Text>{translate('common.review')}</Button.Text>
            </Button>
        </View>
    );
}

export default FailedExportsRetryRow;
