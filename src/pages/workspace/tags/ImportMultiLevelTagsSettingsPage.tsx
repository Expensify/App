import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    importMultiLevelTags,
    setImportedSpreadsheetIsFirstLineHeader,
    setImportedSpreadsheetIsGLAdjacent,
    setImportedSpreadsheetIsImportingIndependentMultiLevelTags,
} from '@libs/actions/Policy/Tag';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type ImportMultiLevelTagsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS>;

function ImportMultiLevelTagsSettingsPage({route}: ImportMultiLevelTagsSettingsPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const backTo = route.params.backTo;
    const workspaceTagsImportPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAGS_IMPORT.path, ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isImportingTags, setIsImportingTags] = useState(false);
    const {setIsClosing} = useCloseImportPage();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    useEffect(() => {
        setImportedSpreadsheetIsFirstLineHeader(true);
        setImportedSpreadsheetIsImportingIndependentMultiLevelTags(true);
        setImportedSpreadsheetIsGLAdjacent(false);
    }, []);

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingTags(false);
        Navigation.goBack(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    };

    const importTags = async () => {
        setIsImportingTags(true);
        const importFinalModal = await importMultiLevelTags(policyID, spreadsheet);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal);
        if (!didShowImportFinalModal) {
            setIsImportingTags(false);
            return;
        }
        closeImportPageAndModal();
    };

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                testID="ImportSpreadsheet"
                shouldEnableMaxHeight={canUseTouchScreen()}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.importTags')}
                    onBackButtonPress={() => Navigation.goBack(backTo ?? workspaceTagsImportPath)}
                />
                <FullPageOfflineBlockingView>
                    <Text style={[styles.textSupporting, styles.textNormal, styles.ph5]}>{translate('workspace.tags.configureMultiLevelTags')}</Text>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text
                            style={[styles.textNormal, styles.flex1]}
                            accessible={false}
                            aria-hidden
                        >
                            {translate('workspace.tags.importMultiLevelTags.firstRowTitle')}
                        </Text>
                        <Switch
                            isOn={spreadsheet?.containsHeader ?? true}
                            accessibilityLabel={translate('workspace.tags.importMultiLevelTags.firstRowTitle')}
                            onToggle={(value) => {
                                setImportedSpreadsheetIsFirstLineHeader(value);
                            }}
                        />
                    </View>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text
                            style={[styles.textNormal, styles.flex1, styles.mr2]}
                            accessible={false}
                            aria-hidden
                        >
                            {translate('workspace.tags.importMultiLevelTags.independentTags')}
                        </Text>
                        <Switch
                            isOn={spreadsheet?.isImportingIndependentMultiLevelTags ?? true}
                            accessibilityLabel={translate('workspace.tags.importMultiLevelTags.independentTags')}
                            onToggle={(value) => {
                                setImportedSpreadsheetIsImportingIndependentMultiLevelTags(value);
                            }}
                        />
                    </View>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text
                            style={[styles.textNormal, styles.flex1, styles.mr2]}
                            accessible={false}
                            aria-hidden
                        >
                            {translate('workspace.tags.importMultiLevelTags.glAdjacentColumn')}
                        </Text>
                        <Switch
                            isOn={spreadsheet?.isGLAdjacent ?? false}
                            accessibilityLabel={translate('workspace.tags.importMultiLevelTags.glAdjacentColumn')}
                            onToggle={(value) => {
                                setImportedSpreadsheetIsGLAdjacent(value);
                            }}
                        />
                    </View>

                    <FixedFooter
                        style={[styles.mtAuto]}
                        addBottomSafeAreaPadding
                    >
                        <Button
                            onPress={
                                spreadsheet?.isImportingIndependentMultiLevelTags ? () => Navigation.navigate(ROUTES.WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL.getRoute(policyID)) : importTags
                            }
                            isLoading={isImportingTags}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                        >
                            <Button.Text>{spreadsheet?.isImportingIndependentMultiLevelTags ? translate('common.next') : translate('common.import')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ImportMultiLevelTagsSettingsPage;
