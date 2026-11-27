import Badge from '@components/Badge';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLastSearchedDatetime} from '@libs/OAuthConnectionUtils';
import type {GmailConnection} from '@libs/OAuthConnectionUtils';

import {clearOAuthConnectionErrors} from '@userActions/OAuthConnections';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import GmailAvatar from './GmailAvatar';

type GmailConnectionRowProps = {
    /** The connected Gmail account to show */
    connection: GmailConnection;

    /** Called when the user picks "Remove connection" from the row menu */
    onRemove: (connection: GmailConnection) => void;
};

function GmailConnectionRow({connection, onRemove}: GmailConnectionRowProps) {
    const styles = useThemeStyles();
    const {translate, datetimeToRelative} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const lastSearchedDatetime = getLastSearchedDatetime(connection.lastSearchedAt);
    let statusMessage = translate('connectionsPage.gmail.notSyncedYet');
    if (connection.error) {
        statusMessage = translate('connectionsPage.gmail.notSynced');
    } else if (lastSearchedDatetime) {
        statusMessage = datetimeToRelative(lastSearchedDatetime);
    }

    return (
        <OfflineWithFeedback
            pendingAction={connection.pendingAction}
            errors={connection.errors}
            onClose={() => clearOAuthConnectionErrors(connection.connectionID)}
        >
            {/* The row has no press action, so it stays out of the accessibility tree and the menu button stays reachable */}
            <MenuItem.Root shouldBeAccessible={false}>
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <GmailAvatar />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{connection.id}</MenuItem.Title>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt1]}>
                            <Badge
                                text={translate(connection.error ? 'connectionsPage.gmail.inactive' : 'connectionsPage.gmail.active')}
                                success={!connection.error}
                                error={!!connection.error}
                                isCondensed
                                badgeStyles={styles.ml0}
                            />
                            <Text style={[styles.textLabelSupporting, styles.textLineHeightNormal, styles.flex1, styles.ml2]}>{statusMessage}</Text>
                        </View>
                    </MenuItem.Content>
                    <MenuItem.Trailing>
                        <ThreeDotsMenu
                            shouldSelfPosition
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_CONNECTIONS.GMAIL_MENU}
                            menuItems={[
                                {
                                    icon: icons.Trashcan,
                                    text: translate('connectionsPage.gmail.removeConnection'),
                                    sentryLabel: CONST.SENTRY_LABEL.SETTINGS_CONNECTIONS.GMAIL_MENU_REMOVE,
                                    onSelected: () => onRemove(connection),
                                },
                            ]}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                        />
                    </MenuItem.Trailing>
                </MenuItem.Row>
            </MenuItem.Root>
            {!!connection.error && (
                <FormHelpMessage
                    isError
                    message={translate(`connectionsPage.gmail.error.${connection.error}`)}
                    style={styles.mb3}
                />
            )}
        </OfflineWithFeedback>
    );
}

export default GmailConnectionRow;
