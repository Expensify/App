/**
 * A single integration tile on the Connections page. Connected integrations show their status and a Configure or Fix
 * button, and the rest show a "+" that starts the connection flow.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

type ConnectionCardProps = {
    listing: ConnectionListing;

    /** How many cards share a row */
    columnCount: number;
};

function ConnectionCard({listing, columnCount}: ConnectionCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Plus']);
    const {title, icon, status, onConnect, onConfigure, registerConnectButton, isLoading} = listing;

    const connectIcon = (
        <View style={[styles.justifyContentCenter, styles.ml3]}>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <Icon
                    src={icons.Plus}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            )}
        </View>
    );

    const statusButton = !!status && (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            variant={status.isBroken ? CONST.BUTTON_VARIANT.DANGER : undefined}
            onPress={onConfigure}
            style={[styles.alignSelfCenter, styles.ml3]}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.CONFIGURE_BUTTON}
        >
            <Button.Text>{translate(status.isBroken ? 'workspace.connections.fix' : 'workspace.connections.configure')}</Button.Text>
        </Button>
    );

    return (
        <View
            style={[
                styles.workspaceSectionMoreFeaturesItem,
                styles.p0,
                styles.mt0,
                styles.overflowHidden,
                StyleUtils.getMinimumWidth(0),
                columnCount === 1 && styles.flexBasis100,
                columnCount === 3 && styles.connectionCardThreeColumns,
            ]}
        >
            <MenuItem
                ref={registerConnectButton}
                title={title}
                titleStyle={styles.textStrong}
                icon={icon}
                iconType={CONST.ICON_TYPE_AVATAR}
                fallbackIcon={icons.Building}
                descriptionAddon={
                    status ? (
                        <Badge
                            text={translate(status.isBroken ? 'workspace.connections.broken' : 'workspace.connections.active')}
                            success={!status.isBroken}
                            error={status.isBroken}
                            isCondensed
                            badgeStyles={styles.ml0}
                        />
                    ) : undefined
                }
                description={status?.message}
                numberOfLinesDescription={1}
                wrapperStyle={[styles.pv4, styles.ph4]}
                onPress={status ? onConfigure : onConnect}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.CARD}
                disabled={!status && (isOffline || !!isLoading)}
                shouldShowRightComponent
                rightComponent={status ? statusButton : connectIcon}
            />
        </View>
    );
}

export default ConnectionCard;
