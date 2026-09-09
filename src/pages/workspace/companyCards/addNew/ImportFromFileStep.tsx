import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import localFileDownload from '@libs/localFileDownload';

import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {openLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';

import WrappingText from './WrappingText';

// cspell:disable
// Example CSV shared with customers so they can see how to structure a company card import file.
// Sourced from the Expensify Classic "Manage Company Cards" help article.
const CSV_TEMPLATE_FILE_NAME = 'Expensify_company_card_import_template.csv';
const CSV_TEMPLATE_CONTENT = [
    'Card Number,Posted Date,Merchant,Posted Amount,Posted Currency,Sales Date,Original Amount,Original Currency,Comment,Category,Tag,Unique ID',
    '902212XXXXXX1234,2019-01-26,ACE Hardware,13.41,EUR,2019-01-23,12,USD,Impromptu supply run,Other,Client Project 4,982000000000000',
    '902212XXXXXX1234,2019-01-24,McDonalds,4.48,EUR,2019-01-23,5,USD,Lunch at worksite,Meals,Client Project 4,375000000000000',
    '902212XXXXXX8999,2019-01-27,United Airlines,"1,200.00",USD,2019-01-24,"1,200.00",USD,Flight to client site,Travel,Client Project 8,135000000000000',
    '902212XXXXXX8999,2019-01-28,United Airlines,"-1,200.00",USD,2019-01-25,"-1,200.00",USD,Flight refund,Travel,Client Project 8,735000000000000',
    '902212XXXXXX8999,2019-01-28,Sheraton NYC,357,USD,2019-01-24,357,USD,Overnight stay due to flight cancellation,Lodging,Client Project 8,529000000000000',
    '902212XXXXXX8999,2019-01-29,Shell Oil,54,USD,2019-01-25,100,USD,Gas,Fuel,Client Project 8,765400000000000',
].join('\n');
// cspell:enable

function ImportFromFileStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_COMPANY_CARDS_ADD_NEW>>();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const companyCardLayoutName = addNewCard?.data?.companyCardLayoutName ?? '';
    const [hasError, setHasError] = useState(false);
    const {policyID} = route.params;

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    const downloadTemplate = () => {
        localFileDownload(CSV_TEMPLATE_FILE_NAME, CSV_TEMPLATE_CONTENT, translate);
    };

    const navigateToImport = () => {
        if (!companyCardLayoutName.trim()) {
            setHasError(true);
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_IMPORT_SPREADSHEET.getRoute(policyID));
    };

    const shouldShowLayoutNameError = hasError && !companyCardLayoutName.trim();

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
                <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap, styles.alignItemsCenter]}>
                    <WrappingText text={translate('workspace.companyCards.addNewCard.createFileFeedHelpText.instructionStart')} />
                    <PressableWithoutFeedback
                        testID="ImportFromFileStep-TemplateLink"
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('workspace.companyCards.addNewCard.createFileFeedHelpText.templateLink')}
                        sentryLabel="ImportFromFileStep-TemplateLink"
                        onPress={downloadTemplate}
                        style={styles.dInlineFlex}
                    >
                        <Text style={[styles.textSupporting, styles.link]}>{translate('workspace.companyCards.addNewCard.createFileFeedHelpText.templateLink')}</Text>
                    </PressableWithoutFeedback>
                    <WrappingText text={translate('workspace.companyCards.addNewCard.createFileFeedHelpText.instructionMiddle')} />
                    <PressableWithoutFeedback
                        testID="ImportFromFileStep-HelpGuideLink"
                        role={CONST.ROLE.LINK}
                        // Pass href so the link renders as a real anchor on web (native link behavior: hover URL, open in a new tab, etc.),
                        // while onPress preventDefault()s the anchor's default navigation and routes through openLink on every platform.
                        href={CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}
                        accessibilityLabel={translate('workspace.companyCards.addNewCard.createFileFeedHelpText.helpGuideLink')}
                        sentryLabel="ImportFromFileStep-HelpGuideLink"
                        onPress={(event) => {
                            event?.preventDefault();
                            openLink(CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL, environmentURL);
                        }}
                        style={styles.dInlineFlex}
                    >
                        <Text style={[styles.textSupporting, styles.link]}>{translate('workspace.companyCards.addNewCard.createFileFeedHelpText.helpGuideLink')}</Text>
                    </PressableWithoutFeedback>
                    <WrappingText text={translate('workspace.companyCards.addNewCard.createFileFeedHelpText.instructionEnd')} />
                </View>
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.addNewCard.companyCardLayoutName')}
                    title={companyCardLayoutName}
                    shouldShowRightIcon
                    interactive
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_LAYOUT_NAME.getRoute(policyID))}
                    brickRoadIndicator={shouldShowLayoutNameError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldShowLayoutNameError ? translate('workspace.companyCards.addNewCard.cardLayoutNameRequired') : undefined}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd, styles.gap3]}>
                    <Button
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.w100]}
                        onPress={downloadTemplate}
                    >
                        <Button.Icon src={icons.Download} />
                        <Button.Text>{translate('workspace.companyCards.addNewCard.downloadTemplate')}</Button.Text>
                    </Button>
                    <Button
                        isDisabled={isOffline}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        style={[styles.w100]}
                        onPress={navigateToImport}
                    >
                        <Button.Text>{translate('common.next')}</Button.Text>
                    </Button>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ImportFromFileStep;
export {CSV_TEMPLATE_FILE_NAME, CSV_TEMPLATE_CONTENT};
