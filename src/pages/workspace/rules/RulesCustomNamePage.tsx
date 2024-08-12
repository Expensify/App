import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type RulesReceiptRequiredAmountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CUSTOM_NAME>;

function RulesCustomNamePage({route}: RulesReceiptRequiredAmountPageProps) {
    const {translate} = useLocalize();

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID="test"
            >
                <HeaderWithBackButton
                    title="test"
                    onBackButtonPress={() => Navigation.goBack()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesCustomNamePage;
