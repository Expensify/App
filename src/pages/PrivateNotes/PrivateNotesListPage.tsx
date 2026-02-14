import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import {AttachmentContext} from '@components/AttachmentContext';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PrivateNotesNavigatorParamList} from '@libs/Navigation/types';
import {goBackToDetailsPage} from '@libs/ReportUtils';
import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/inbox/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/inbox/report/withReportAndPrivateNotesOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

type PrivateNotesListPageProps = WithReportAndPrivateNotesOrNotFoundProps & {
    /** The report currently being looked at */
    report: Report;
};

type NoteListItem = {
    title: string;
    action: () => void;
    brickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    note: string;
    disabled: boolean;
    reportID: string;
    accountID: string;
};

function PrivateNotesListPage({report, accountID: sessionAccountID}: PrivateNotesListPageProps) {
    const route = useRoute<PlatformStackRouteProp<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.LIST>>();
    const backTo = route.params.backTo;
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const getAttachmentValue = useCallback((item: NoteListItem) => ({reportID: item.reportID, accountID: Number(item.accountID), type: CONST.ATTACHMENT_TYPE.NOTE}), []);

    /**
     * Gets the menu item for each workspace
     */
    function getMenuItem(item: NoteListItem) {
        return (
            <AttachmentContext.Provider value={getAttachmentValue(item)}>
                <MenuItemWithTopDescription
                    key={item.title}
                    description={item.title}
                    title={item.note}
                    onPress={item.action}
                    shouldShowRightIcon={!item.disabled}
                    numberOfLinesTitle={0}
                    shouldRenderAsHTML
                    brickRoadIndicator={item.brickRoadIndicator}
                    disabled={item.disabled}
                    shouldGreyOutWhenDisabled={false}
                />
            </AttachmentContext.Provider>
        );
    }

    /**
     * Returns a list of private notes on the given chat report
     */
    const privateNotes = useMemo(() => {
        const privateNoteBrickRoadIndicator = (accountID: number) => (report.privateNotes?.[accountID].errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined);
        return Object.keys(report.privateNotes ?? {}).map((privateNoteAccountID: string) => {
            const accountID = Number(privateNoteAccountID);
            const privateNote = report.privateNotes?.[accountID];
            return {
                reportID: report.reportID,
                accountID: privateNoteAccountID,
                title: Number(sessionAccountID) === accountID ? translate('privateNotes.myNote') : (personalDetailsList?.[privateNoteAccountID]?.login ?? ''),
                action: () => Navigation.navigate(ROUTES.PRIVATE_NOTES_EDIT.getRoute(report.reportID, accountID, backTo)),
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
                note: privateNote?.note ?? '',
                disabled: Number(sessionAccountID) !== accountID,
            };
        });
    }, [report, personalDetailsList, sessionAccountID, translate, backTo]);

    return (
        <ScreenWrapper testID="PrivateNotesListPage">
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onBackButtonPress={() => goBackToDetailsPage(report, route.params.backTo, true)}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                bounces={false}
            >
                <Text style={[styles.mb5, styles.ph5]}>{translate('privateNotes.personalNoteMessage')}</Text>
                {privateNotes.map((item) => getMenuItem(item))}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default withReportAndPrivateNotesOrNotFound('privateNotes.title')(PrivateNotesListPage);
