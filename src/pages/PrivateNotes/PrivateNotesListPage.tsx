import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails, Report} from '@src/types/onyx';

type PrivateNotesListPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetailsList: OnyxCollection<PersonalDetails>;
};

type PrivateNotesListPageProps = WithReportAndPrivateNotesOrNotFoundProps &
    PrivateNotesListPageOnyxProps & {
        /** The report currently being looked at */
        report: Report;
    };

type NoteListItem = {
    title: string;
    action: () => void;
    brickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    note: string;
    disabled: boolean;
};

function PrivateNotesListPage({report, personalDetailsList, session}: PrivateNotesListPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    /**
     * Gets the menu item for each workspace
     */
    function getMenuItem(item: NoteListItem) {
        return (
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
                title: Number(session?.accountID) === Number(accountID) ? translate('privateNotes.myNote') : personalDetailsList?.[accountID]?.login ?? '',
                action: () => Navigation.navigate(ROUTES.PRIVATE_NOTES_EDIT.getRoute(report.reportID, accountID)),
                brickRoadIndicator: privateNoteBrickRoadIndicator(Number(accountID)),
                note: privateNote?.note ?? '',
                disabled: Number(session?.accountID) !== Number(accountID),
            };
        });
    }, [report, personalDetailsList, session, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesListPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <Text style={[styles.mb5, styles.ph5]}>{translate('privateNotes.personalNoteMessage')}</Text>
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                bounces={false}
            >
                {privateNotes.map((item) => getMenuItem(item))}
            </ScrollView>
        </ScreenWrapper>
    );
}

PrivateNotesListPage.displayName = 'PrivateNotesListPage';

export default withReportAndPrivateNotesOrNotFound('privateNotes.title')(
    withOnyx<PrivateNotesListPageProps, PrivateNotesListPageOnyxProps>({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(PrivateNotesListPage),
);
