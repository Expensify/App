import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {AttachmentContext} from '@components/AttachmentContext';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PrivateNotesNavigatorParamList} from '@libs/Navigation/types';
import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
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

function PrivateNotesListPage({report, session}: PrivateNotesListPageProps) {
    const route = useRoute<PlatformStackRouteProp<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.LIST>>();
    const backTo = route.params.backTo;
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
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
        return Object.keys(report.privateNotes ?? {}).map((accountID: string) => {
            const privateNote = report.privateNotes?.[Number(accountID)];
            return {
                reportID: report.reportID,
                accountID,
                title: Number(session?.accountID) === Number(accountID) ? translate('privateNotes.myNote') : personalDetailsList?.[accountID]?.login ?? '',
                action: () => Navigation.navigate(ROUTES.PRIVATE_NOTES_EDIT.getRoute(report.reportID, accountID, backTo)),
                brickRoadIndicator: privateNoteBrickRoadIndicator(Number(accountID)),
                note: privateNote?.note ?? '',
                disabled: Number(session?.accountID) !== Number(accountID),
            };
        });
    }, [report, personalDetailsList, session, translate, backTo]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesListPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo))}
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

PrivateNotesListPage.displayName = 'PrivateNotesListPage';

export default withReportAndPrivateNotesOrNotFound('privateNotes.title')(PrivateNotesListPage);
