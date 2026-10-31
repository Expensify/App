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

    /** Stacks the card at full width instead of wrapping it by its minimum width */
    shouldUseFullWidth: boolean;
};

function ConnectionCard({listing, shouldUseFullWidth}: ConnectionCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Plus']);
    const {title, icon, status, offer, onConnect, onConfigure, registerConnectButton, isLoading} = listing;

    const connectIcon = (
        <View style={[styles.justifyContentCenter, styles.ml3, styles.mr2]}>
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

    let statusComponent = (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            variant={status?.isBroken ? CONST.BUTTON_VARIANT.DANGER : undefined}
            onPress={onConfigure}
            style={[styles.alignSelfCenter, styles.ml3]}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.CONFIGURE_BUTTON}
        >
            <Button.Text>{translate(status?.isBroken ? 'workspace.connections.fix' : 'workspace.connections.configure')}</Button.Text>
        </Button>
    );
    if (status?.isSyncing) {
        statusComponent = (
            <View style={[styles.justifyContentCenter, styles.ml3]}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View
            style={[
                styles.workspaceSectionMoreFeaturesItem,
                styles.p0,
                styles.overflowHidden,
                shouldUseFullWidth ? [styles.flexBasis100, StyleUtils.getMinimumWidth(0)] : styles.connectionCard,
            ]}
        >
            <MenuItem
                ref={registerConnectButton}
                title={title}
                titleStyle={[styles.textStrong, styles.flexShrink1]}
                icon={icon}
                iconType={CONST.ICON_TYPE_AVATAR}
                // Many partner logos are transparent, so they need a white backdrop in both themes
                avatarImageStyles={styles.backgroundWhite}
                fallbackIcon={icons.Building}
                descriptionAddon={
                    status ? (
                        <Badge
                            text={translate(status?.isBroken ? 'workspace.connections.broken' : 'workspace.connections.active')}
                            success={!status.isBroken}
                            error={status.isBroken}
                            isCondensed
                            badgeStyles={styles.ml0}
                        />
                    ) : undefined
                }
                description={status?.message}
                titleAddon={
                    offer ? (
                        <Badge
                            text={translate('workspace.connections.offer')}
                            isCondensed
                            badgeStyles={[styles.ml2, styles.badgeOffer]}
                            textStyles={styles.badgeOfferText}
                            onPress={offer.onPress}
                            pressable={!!offer.onPress}
                        />
                    ) : undefined
                }
                numberOfLinesDescription={1}
                wrapperStyle={[styles.pv4, styles.ph4]}
                onPress={status ? onConfigure : onConnect}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.CARD}
                disabled={!status && (isOffline || !!isLoading)}
                shouldShowRightComponent
                rightComponent={status ? statusComponent : connectIcon}
            />
        </View>
    );
}

export default ConnectionCard;
