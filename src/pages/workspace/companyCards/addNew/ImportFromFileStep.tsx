import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function ImportFromFileStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>>();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const shouldUseAdvancedFields = addNewCard?.data?.useAdvancedFields ?? false;
    const companyCardLayoutName = addNewCard?.data?.companyCardLayoutName ?? '';
    const {policyID} = route.params;

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
    };

    const toggleAdvancedFields = (value: boolean) => {
        setAddNewCompanyCardStepAndData({data: {useAdvancedFields: value}});
    };

    return (
        <ScreenWrapper
            testID="ImportFromFileStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
                addBottomSafeAreaPadding
            >
                <View style={[styles.renderHTML, styles.ph5, styles.mv3, styles.textSupporting]}>
                    <RenderHTML html={translate('workspace.companyCards.addNewCard.createFileFeedHelpText')} />
                </View>
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.addNewCard.companyCardLayoutName')}
                    title={companyCardLayoutName}
                    shouldShowRightIcon
                    interactive
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_LAYOUT_NAME.getRoute(policyID))}
                />
                <View style={[styles.mt5, styles.mh5]}>
                    <View style={[styles.flexRow, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.companyCards.addNewCard.useAdvancedFields')}</Text>
                        <Switch
                            isOn={shouldUseAdvancedFields}
                            accessibilityLabel={translate('workspace.companyCards.addNewCard.useAdvancedFields')}
                            onToggle={toggleAdvancedFields}
                        />
                    </View>
                </View>
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success
                        large
                        style={[styles.w100]}
                        onPress={() => {}}
                        text={translate('common.next')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ImportFromFileStep;
