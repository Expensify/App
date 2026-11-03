import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {importMultiLevelTags} from '@libs/actions/Policy/Tag';
import {generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useState} from 'react';

type ImportedMultiLevelTagsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORTED_MULTI_LEVEL>;

function ImportedMultiLevelTagsPage({route}: ImportedMultiLevelTagsPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingTags, setIsImportingTags] = useState(false);
    const policyID = route.params.policyID;
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();
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

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ImportedMultiLevelTagsPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.tags.importTags')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importTags}
                isButtonLoading={isImportingTags}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}
                shouldShowColumnHeader={false}
                shouldShowDropdownMenu={false}
                customHeaderText={translate('workspace.tags.importMultiLevelTagsSupportingText')}
            />
        </ScreenWrapper>
    );
}

export default ImportedMultiLevelTagsPage;
