import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    importMultiLevelTags,
    setImportedSpreadsheetIsFirstLineHeader,
    setImportedSpreadsheetIsGLAdjacent,
    setImportedSpreadsheetIsImportingIndependentMultiLevelTags,
} from '@libs/actions/Policy/Tag';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ImportMultiLevelTagsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS>;

function ImportMultiLevelTagsSettingsPage({route}: ImportMultiLevelTagsSettingsPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const backTo = route.params.backTo;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isImportingTags, setIsImportingTags] = useState(false);
    const {setIsClosing} = useCloseImportPage();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    useEffect(() => {
        setImportedSpreadsheetIsFirstLineHeader(true);
        setImportedSpreadsheetIsImportingIndependentMultiLevelTags(true);
        setImportedSpreadsheetIsGLAdjacent(false);
    }, []);

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingTags(false);
        Navigation.goBack(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    };

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                testID={ImportSpreadsheet.displayName}
                shouldEnableMaxHeight={canUseTouchScreen()}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.importTags')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <FullPageOfflineBlockingView>
                    <Text style={[styles.textSupporting, styles.textNormal, styles.ph5]}>{translate('workspace.tags.configureMultiLevelTags')}</Text>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.firstRowTitle')}</Text>
                        <Switch
                            isOn={spreadsheet?.containsHeader ?? true}
                            accessibilityLabel={translate('workspace.tags.importMultiLevelTags.firstRowTitle')}
                            onToggle={(value) => {
                                setImportedSpreadsheetIsFirstLineHeader(value);
                            }}
                        />
                    </View>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.independentTags')}</Text>
                        <Switch
                            isOn={spreadsheet?.isImportingIndependentMultiLevelTags ?? true}
                            accessibilityLabel={translate('workspace.tags.importMultiLevelTags.independentTags')}
                            onToggle={(value) => {
                                setImportedSpreadsheetIsImportingIndependentMultiLevelTags(value);
                            }}
                        />
                    </View>

                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.importMultiLevelTags.glAdjacentColumn')}</Text>
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
                            text={spreadsheet?.isImportingIndependentMultiLevelTags ? translate('common.next') : translate('common.import')}
                            onPress={() => {
                                if (spreadsheet?.isImportingIndependentMultiLevelTags) {
                                    Navigation.navigate(ROUTES.WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL.getRoute(policyID));
                                } else {
                                    setIsImportingTags(true);
                                    importMultiLevelTags(policyID, spreadsheet);
                                }
                            }}
                            isLoading={isImportingTags}
                            success
                            large
                        />
                    </FixedFooter>
                    <ConfirmModal
                        isVisible={spreadsheet?.shouldFinalModalBeOpened ?? false}
                        title={spreadsheet?.importFinalModal?.title ?? ''}
                        prompt={spreadsheet?.importFinalModal?.prompt ?? ''}
                        onConfirm={closeImportPageAndModal}
                        onCancel={closeImportPageAndModal}
                        confirmText={translate('common.buttonConfirm')}
                        shouldShowCancelButton={false}
                        shouldHandleNavigationBack
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ImportMultiLevelTagsSettingsPage.displayName = 'ImportMultiLevelTagsSettingsPage';

export default ImportMultiLevelTagsSettingsPage;
