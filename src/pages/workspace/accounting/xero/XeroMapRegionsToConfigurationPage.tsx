import React, { useMemo } from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import { getTrackingCategory } from '@libs/actions/connections/ConnectToXero';
import { TranslationPaths } from '@src/languages/types';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';


function XeroMapRegionsToConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const category = getTrackingCategory(policy,  CONST.XERO_CONFIG.TRACK_CATEGORY_FIELDS.REGION);

    const optionsList = useMemo(() => { 
        return Object.values(CONST.XERO_CONFIG.TRACK_CATEGORY_OPTIONS).map((option) => {
            return {
                value: option,
                text: translate(`workspace.xero.trackingCategoriesOptions.${option.toLowerCase()}` as TranslationPaths),
                keyForList: option,
                isSelected: option.toLowerCase() === category?.value?.toLowerCase()
            }
        });
    }, [policyID, translate]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID && category?.id ? policyID : ''}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={XeroMapRegionsToConfigurationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.xero.mapXeroRegionsTo')} />
                <View style={[styles.pb2, styles.ph5]}>
                    <Text style={styles.pb5}>{translate('workspace.xero.mapXeroRegionsToDescription')}</Text>
                </View>
                <SelectionList
                        sections={[{data: optionsList}]}
                        ListItem={RadioListItem}
                        onSelectRow={(option) => {
                            Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.MAPPINGS, {
                                ...(policy?.connections?.xero?.config?.mappings ?? {}),
                                ...(category?.id ? {[`${CONST.XERO_CONFIG.TRACK_CATEGORY_PREFIX}${category.id}`]: option.value}: {})
                            })
                            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACK_CATEGORIES.getRoute(policyID));
                        }}
                    />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroMapRegionsToConfigurationPage.displayName = 'XeroMapRegionsToConfigurationPage';
export default withPolicyConnections(XeroMapRegionsToConfigurationPage);
