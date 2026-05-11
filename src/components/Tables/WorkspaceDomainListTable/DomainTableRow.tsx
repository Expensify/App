import {View} from 'react-native';
import Icon from '@components/Icon';
import style from '@components/Icon/IconWrapperStyles';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PopoverMenuItem} from '@components/PopoverMenu';
import TableRow from '@components/Table/TableRow';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDomainErrors} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import {DomainRowData} from '.';

type DomainTableRowProps = {
    item: DomainRowData;

    rowIndex: number;

    shouldUseNarrowTableLayout: boolean;
};

export default function DomainTableRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'ArrowRight']);

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

    return (
        <OfflineWithFeedback
            errors={item.errors}
            pendingAction={item.pendingAction}
            onClose={() => clearDomainErrors(item.domainAccountID)}
        >
            <TableRow
                interactive
                rowIndex={rowIndex}
                skeletonReasonAttributes={{context: 'domainTableRow'}}
            >
                {({hovered}) => (
                    <>
                        <View style={[styles.flex1]}></View>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                            {threeDotMenuItems.length > 0 && (
                                <ThreeDotsMenu
                                    isNested
                                    shouldOverlay
                                    shouldSelfPosition
                                    menuItems={threeDotMenuItems}
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
        </OfflineWithFeedback>
    );
}
