import React, {useState} from 'react';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';

function ImportFromFileStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [shouldUseAdvancedFields, setShouldUseAdvancedFields] = useState(false);

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
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
                    shouldShowRightIcon
                    interactive={false}
                />
                <View style={[styles.mt5, styles.mh5]}>
                    <View style={[styles.flexRow, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.companyCards.addNewCard.useAdvancedFields')}</Text>
                        <Switch
                            isOn={shouldUseAdvancedFields}
                            accessibilityLabel={translate('workspace.companyCards.addNewCard.useAdvancedFields')}
                            onToggle={setShouldUseAdvancedFields}
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
