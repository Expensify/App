import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import RateModal from './RateModal';

type PolicyDistanceRateEditPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type PolicyDistanceRateEditPageProps = PolicyDistanceRateEditPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_EDIT>;

function PolicyDistanceRateEditPage({policy, route}: PolicyDistanceRateEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const [isRateModalVisible, setIsRateModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const rate = customUnit.rates[rateID];
    const currency = rate.currency ?? CONST.CURRENCY.USD;

    const showRateModal = () => {
        setIsRateModalVisible(true);
    };

    const hideRateModal = () => {
        setIsRateModalVisible(false);
    };

    const updateRate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => {
        Policy.updatePolicyDistanceRateValue(policyID, customUnit, [{...rate, rate: Number(values.rate)}]);
    };

    const toggleRate = () => {
        Policy.setPolicyDistanceRatesEnabled(policyID, customUnit, [{...rate, enabled: !rate.enabled}]);
    };

    const deleteRate = () => {
        Policy.deletePolicyDistanceRates(policyID, [rateID], customUnit);
        setIsDeleteModalVisible(false);
    };

    const rateValueToDisplay = CurrencyUtils.convertAmountToDisplayString(rate.rate, currency);
    const unitToDisplay = translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`);

    const threeDotsMenuItems = [
        {
            icon: Expensicons.Trashcan,
            text: translate('workspace.distanceRates.deleteDistanceRate'),
            onSelected: () => {
                setIsDeleteModalVisible(true);
            },
        },
    ];

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper
                    testID={PolicyDistanceRateEditPage.displayName}
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        title={`${rateValueToDisplay} / ${translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`)}`}
                        shouldShowThreeDotsButton
                        threeDotsMenuItems={threeDotsMenuItems}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                    />
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.p5]}>
                        <Text>{translate('workspace.distanceRates.enableRate')}</Text>
                        <Switch
                            isOn={rate.enabled ?? false}
                            onToggle={toggleRate}
                            accessibilityLabel={translate('workspace.distanceRates.enableRate')}
                        />
                    </View>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={`${rateValueToDisplay} / ${unitToDisplay}`}
                        description={translate('workspace.distanceRates.rate')}
                        descriptionTextStyle={styles.textNormal}
                        onPress={showRateModal}
                    />
                    <RateModal
                        isVisible={isRateModalVisible}
                        currentRate={(rate.rate ?? '').toString()}
                        onClose={hideRateModal}
                        onRateSubmit={updateRate}
                        label={translate('workspace.distanceRates.rate')}
                        currency={currency}
                    />
                    <ConfirmModal
                        title={translate('workspace.distanceRates.deleteDistanceRate')}
                        isVisible={isDeleteModalVisible}
                        onConfirm={deleteRate}
                        onCancel={() => setIsDeleteModalVisible(false)}
                        prompt={translate('workspace.distanceRates.areYouSureDelete')}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

PolicyDistanceRateEditPage.displayName = 'PolicyDistanceRateEditPage';

export default withOnyx<PolicyDistanceRateEditPageProps, PolicyDistanceRateEditPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(PolicyDistanceRateEditPage);
