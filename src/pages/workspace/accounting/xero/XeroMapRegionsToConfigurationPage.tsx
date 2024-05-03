import React, { useMemo } from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import { getTrackingCategory } from '@libs/actions/connections/ConnectToXero';
import { TranslationPaths } from '@src/languages/types';


function XeroMapRegionsToConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';

    const optionsList = useMemo(() => { 
        const costCenterCategoryValue = getTrackingCategory(policy,  CONST.XERO_CONFIG.TRACK_CATEGORY_FIELDS.REGION)?.value ?? "";

        return Object.values(CONST.XERO_CONFIG.TRACK_CATEGORY_OPTIONS).map((option) => {
            return {
                value: option,
                text: translate(`workspace.xero.trackingCategoriesOptions.${option.toLowerCase()}` as TranslationPaths),
                keyForList: option,
                isSelected: option.toLowerCase() === costCenterCategoryValue.toLowerCase()
            }
        });
    }, [policyID, translate]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
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
                        onSelectRow={() => {}}
                    />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroMapRegionsToConfigurationPage.displayName = 'XeroMapRegionsToConfigurationPage';
export default withPolicyConnections(XeroMapRegionsToConfigurationPage);
