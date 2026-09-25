/**
 * A single integration tile on the Connections page. Connected integrations show their status and a Configure or Fix
 * button, and the rest show a "+" that starts the connection flow.
 */
import Badge from '@components/Badge';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ConnectionListing} from './types';

type ConnectionCardProps = {
    listing: ConnectionListing;
};

function ConnectionCard({listing}: ConnectionCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Plus']);
    const {title, icon, status, onConnect, onConfigure, registerConnectButton} = listing;

    const statusButton = !!status && (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            variant={status.isBroken ? CONST.BUTTON_VARIANT.DANGER : undefined}
            onPress={onConfigure}
            style={styles.alignSelfCenter}
        >
            <Button.Text>{translate(status.isBroken ? 'workspace.connections.fix' : 'workspace.connections.configure')}</Button.Text>
        </Button>
    );

    return (
        <View style={[styles.workspaceSectionMoreFeaturesItem, styles.p0, styles.overflowHidden, shouldUseNarrowLayout && [styles.flexBasis100, StyleUtils.getMinimumWidth(0)]]}>
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
                wrapperStyle={styles.pv4}
                onPress={status ? onConfigure : onConnect}
                disabled={!status && isOffline}
                shouldShowRightIcon={!status}
                iconRight={icons.Plus}
                shouldShowRightComponent={!!status}
                rightComponent={statusButton}
            />
        </View>
    );
}

export default ConnectionCard;
