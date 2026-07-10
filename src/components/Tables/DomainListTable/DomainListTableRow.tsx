import Badge from '@components/Badge';
import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TableRow from '@components/Table/TableRow';
import TextWithTooltip from '@components/TextWithTooltip';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDomainErrors} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import type {DomainRowData} from '.';

type DomainListTableRowProps = {
    item: DomainRowData;

    rowIndex: number;

    shouldUseNarrowTableLayout: boolean;
};

export default function DomainListTableRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainListTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'ArrowRight']);
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const threeDotMenuItems: PopoverMenuItem[] = [];

    if (item.isAdmin) {
        threeDotMenuItems.push({
            icon: icons.Globe,
            text: translate('domain.goToDomain'),
            onSelected: item.action,
        });
    }

    if (item.isAdmin && !item.isValidated) {
        threeDotMenuItems.push({
            icon: icons.Globe,
            text: translate('domain.verifyDomain.title'),
            onSelected: () => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(item.domainAccountID)),
        });
    }

    const VerifiedDomainBadge = (
        <Badge
            success={item.isValidated}
            text={item.isValidated ? translate('common.verified') : translate('domain.notVerified')}
            textStyles={styles.textStrong}
            badgeStyles={[styles.alignSelfStart, styles.ml0]}
            isCondensed={shouldUseNarrowTableLayout}
        />
    );

    const domainDetailsContainerStyles = [
        styles.flex1,
        !shouldUseNarrowTableLayout && styles.alignItemsCenter,
        !shouldUseNarrowTableLayout && styles.flexRow,
        shouldUseNarrowTableLayout ? styles.gap1 : styles.gap2,
    ];

    const accessibilityLabel = [
        translate('domain.addDomain.domainName'),
        item.title,
        item.isValidated && item.isAdmin && translate('common.verified'),
        !item.isValidated && item.isAdmin && translate('domain.notVerified'),
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <TableRow
            interactive
            rowIndex={rowIndex}
            onPress={item.action}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: () => clearDomainErrors(item.domainAccountID),
            }}
        >
            {({hovered}) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <Icon
                            src={icons.Globe}
                            fill={theme.icon}
                            additionalStyles={[shouldUseNarrowTableLayout ? styles.domainIconCompact : styles.domainIcon]}
                        />
                        <View style={domainDetailsContainerStyles}>
                            <TextWithTooltip
                                text={item.title}
                                shouldShowTooltip
                            />
                            {item.isAdmin && VerifiedDomainBadge}
                        </View>
                    </View>
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        {threeDotMenuItems.length > 0 && (
                            <ThreeDotsMenu
                                isNested
                                shouldOverlay
                                shouldSelfPosition
                                menuItems={threeDotMenuItems}
                                iconStyles={styles.h7}
                            />
                        )}

                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </TableRow>
    );
}
