import {AttachmentContext} from '@components/AttachmentContext';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/inbox/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/inbox/report/withReportAndPrivateNotesOrNotFound';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useMemo} from 'react';

type PrivateNotesListPageProps = WithReportAndPrivateNotesOrNotFoundProps & {
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
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.PRIVATE_NOTES_LIST.path);
    const privateNoteAccountIDs = Object.keys(report.privateNotes ?? {}).map(Number);
    const [privateNoteAuthors] = usePersonalDetailsByIDs(privateNoteAccountIDs);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const getAttachmentValue = useCallback((item: NoteListItem) => ({reportID: item.reportID, accountID: Number(item.accountID), type: CONST.ATTACHMENT_TYPE.NOTE}), []);

    /**
     * Gets the menu item for each workspace
     */
    function getMenuItem(item: NoteListItem) {
        return (
            <AttachmentContext.Provider
                key={item.title}
                value={getAttachmentValue(item)}
            >
                <MenuItem.Root onPress={item.disabled ? undefined : callFunctionIfActionIsAllowed(item.action)}>
                    <MenuItem.Row>
                        <MenuItemField.Content name={item.title}>{!!item.note && <MenuItem.FieldValueHTML>{item.note}</MenuItem.FieldValueHTML>}</MenuItemField.Content>
                        {(!!item.brickRoadIndicator || !item.disabled) && (
                            <MenuItem.Trailing>
                                {!!item.brickRoadIndicator && <MenuItem.BrickRoadIndicator status={item.brickRoadIndicator} />}
                                {!item.disabled && <MenuItem.Chevron />}
                            </MenuItem.Trailing>
                        )}
                    </MenuItem.Row>
                </MenuItem.Root>
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
                title: Number(sessionAccountID) === accountID ? translate('privateNotes.myNote') : (privateNoteAuthors?.[privateNoteAccountID]?.login ?? ''),
                action: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PRIVATE_NOTES_EDIT.getRoute(accountID))),
                brickRoadIndicator: privateNoteBrickRoadIndicator(accountID),
                note: privateNote?.note ?? '',
                disabled: Number(sessionAccountID) !== accountID,
            };
        });
    }, [report, privateNoteAuthors, sessionAccountID, translate]);

    return (
        <ScreenWrapper testID="PrivateNotesListPage">
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(backPath)}
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
