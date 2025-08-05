import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import ReportActionAvatars from '@components/ReportActionAvatars';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIsUserSubmittedExpenseOrScannedReceipt} from '@libs/OptionsListUtils';
import {isSelectedManagerMcTest} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {InviteMemberListItemProps, ListItem} from './types';

function InviteMemberListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    canShowProductTrainingTooltip = true,
}: InviteMemberListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();

    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP_MANAGER,
        canShowProductTrainingTooltip &&
            !getIsUserSubmittedExpenseOrScannedReceipt() &&
            isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST) &&
            isSelectedManagerMcTest(item.login) &&
            !item.isSelected,
    );

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const shouldShowCheckBox = canSelectMultiple && !item.isDisabled;

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            shouldDisplayRBR={!shouldShowCheckBox}
            testID={item.text}
        >
            {(hovered?: boolean) => (
                <EducationalTooltip
                    shouldRender={shouldShowProductTrainingTooltip}
                    renderTooltipContent={renderProductTrainingTooltip}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    shouldHideOnNavigate
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                >
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                        {!!item.icons && (
                            <ReportActionAvatars
                                subscriptAvatarBorderColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                shouldShowTooltip={showTooltip}
                                secondaryAvatarContainerStyle={[
                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                    isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                    hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                ]}
                                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                                reportID={item.reportID}
                                accountIDs={!item.reportID && item.accountID ? [item.accountID] : undefined}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <TextWithTooltip
                                    shouldShowTooltip={showTooltip}
                                    text={Str.removeSMSDomain(item.text ?? '')}
                                    style={[
                                        styles.optionDisplayName,
                                        isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                        item.isBold !== false && styles.sidebarLinkTextBold,
                                        styles.pre,
                                        item.alternateText ? styles.mb1 : null,
                                    ]}
                                />
                            </View>
                            {!!item.alternateText && (
                                <TextWithTooltip
                                    shouldShowTooltip={showTooltip}
                                    text={Str.removeSMSDomain(item.alternateText ?? '')}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                />
                            )}
                        </View>
                        {!!item.rightElement && item.rightElement}
                        {!!shouldShowCheckBox && (
                            <PressableWithFeedback
                                onPress={handleCheckboxPress}
                                disabled={isDisabled}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={item.text ?? ''}
                                style={[styles.ml2, styles.optionSelectCircle]}
                            >
                                <SelectCircle
                                    isChecked={item.isSelected ?? false}
                                    selectCircleStyles={styles.ml0}
                                />
                            </PressableWithFeedback>
                        )}
                    </View>
                </EducationalTooltip>
            )}
        </BaseListItem>
    );
}

InviteMemberListItem.displayName = 'InviteMemberListItem';

export default InviteMemberListItem;
