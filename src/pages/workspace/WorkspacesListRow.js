"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Badge_1 = require("@components/Badge");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var Tooltip_1 = require("@components/Tooltip");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var WorkspacesListRowDisplayName_1 = require("@components/WorkspacesListRowDisplayName");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var workspaceTypeIcon = function (workspaceType) {
    switch (workspaceType) {
        case CONST_1.default.POLICY.TYPE.CORPORATE:
            return Illustrations.ShieldYellow;
        case CONST_1.default.POLICY.TYPE.TEAM:
            return Illustrations.Mailbox;
        default:
            return Illustrations.Mailbox;
    }
};
function BrickRoadIndicatorIcon(_a) {
    var brickRoadIndicator = _a.brickRoadIndicator;
    var theme = (0, useTheme_1.default)();
    return brickRoadIndicator ? (<Icon_1.default src={Expensicons.DotIndicator} fill={brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.iconSuccessFill}/>) : null;
}
function WorkspacesListRow(_a) {
    var _b;
    var title = _a.title, menuItems = _a.menuItems, workspaceIcon = _a.workspaceIcon, fallbackWorkspaceIcon = _a.fallbackWorkspaceIcon, ownerAccountID = _a.ownerAccountID, workspaceType = _a.workspaceType, currentUserPersonalDetails = _a.currentUserPersonalDetails, _c = _a.layoutWidth, layoutWidth = _c === void 0 ? CONST_1.default.LAYOUT_WIDTH.NONE : _c, rowStyles = _a.rowStyles, style = _a.style, brickRoadIndicator = _a.brickRoadIndicator, shouldDisableThreeDotsMenu = _a.shouldDisableThreeDotsMenu, isJoinRequestPending = _a.isJoinRequestPending, policyID = _a.policyID, isDefault = _a.isDefault, isLoadingBill = _a.isLoadingBill, resetLoadingSpinnerIconIndex = _a.resetLoadingSpinnerIconIndex;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var threeDotsMenuContainerRef = (0, react_1.useRef)(null);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var ownerDetails = ownerAccountID && (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: [ownerAccountID], currentUserAccountID: currentUserPersonalDetails.accountID }).at(0);
    var threeDotsMenuRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (isLoadingBill) {
            return;
        }
        resetLoadingSpinnerIconIndex === null || resetLoadingSpinnerIconIndex === void 0 ? void 0 : resetLoadingSpinnerIconIndex();
        if (!((_a = threeDotsMenuRef.current) === null || _a === void 0 ? void 0 : _a.isPopupMenuVisible)) {
            return;
        }
        (_b = threeDotsMenuRef === null || threeDotsMenuRef === void 0 ? void 0 : threeDotsMenuRef.current) === null || _b === void 0 ? void 0 : _b.hidePopoverMenu();
    }, [isLoadingBill, resetLoadingSpinnerIconIndex]);
    var calculateAndSetThreeDotsMenuPosition = (0, react_1.useCallback)(function () {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({ horizontal: 0, vertical: 0 });
        }
        return new Promise(function (resolve) {
            var _a;
            (_a = threeDotsMenuContainerRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);
    if (layoutWidth === CONST_1.default.LAYOUT_WIDTH.NONE) {
        // To prevent layout from jumping or rendering for a split second, when
        // isWide is undefined we don't assume anything and simply return null.
        return null;
    }
    var isWide = layoutWidth === CONST_1.default.LAYOUT_WIDTH.WIDE;
    var isNarrow = layoutWidth === CONST_1.default.LAYOUT_WIDTH.NARROW;
    var isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedback.deleted) : false;
    var ThreeDotMenuOrPendingIcon = (<react_native_1.View style={[styles.flexRow, !shouldUseNarrowLayout && styles.workspaceThreeDotMenu]}>
            {!!isJoinRequestPending && (<react_native_1.View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                    <Badge_1.default text={translate('workspace.common.requested')} textStyles={styles.textStrong} badgeStyles={[styles.alignSelfCenter, styles.badgeBordered]} icon={Expensicons.Hourglass}/>
                </react_native_1.View>)}
            {!!isDefault && (<Tooltip_1.default maxWidth={variables_1.default.w184} text={translate('workspace.common.defaultNote')} numberOfLines={4}>
                    <react_native_1.View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                        <Badge_1.default text={translate('common.default')} textStyles={styles.textStrong} badgeStyles={[styles.alignSelfCenter, styles.badgeBordered, styles.badgeSuccess]}/>
                    </react_native_1.View>
                </Tooltip_1.default>)}
            {!isJoinRequestPending && (<react_native_1.View style={[styles.flexRow, styles.ml2, styles.gap1]}>
                    <react_native_1.View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, isNarrow && styles.workspaceListRBR]}>
                        <BrickRoadIndicatorIcon brickRoadIndicator={brickRoadIndicator}/>
                    </react_native_1.View>
                    <react_native_1.View ref={threeDotsMenuContainerRef}>
                        <ThreeDotsMenu_1.default getAnchorPosition={calculateAndSetThreeDotsMenuPosition} menuItems={menuItems} anchorAlignment={{ horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP }} shouldOverlay disabled={shouldDisableThreeDotsMenu} isNested threeDotsMenuRef={threeDotsMenuRef}/>
                    </react_native_1.View>
                </react_native_1.View>)}
        </react_native_1.View>);
    return (<react_native_1.View style={[styles.flexRow, styles.highlightBG, rowStyles, style, isWide && styles.gap5, styles.br3, styles.p5]}>
            <react_native_1.View style={[isWide ? styles.flexRow : styles.flexColumn, styles.flex1, isWide && styles.gap5]}>
                <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.flex2, isNarrow && styles.mb3, styles.alignItemsCenter]}>
                    <react_native_1.View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
                        <Avatar_1.default imageStyles={[styles.alignSelfCenter]} size={CONST_1.default.AVATAR_SIZE.DEFAULT} source={workspaceIcon} fallbackIcon={fallbackWorkspaceIcon} avatarID={policyID} name={title} type={CONST_1.default.ICON_TYPE_WORKSPACE}/>
                        <Tooltip_1.default text={title}>
                            <Text_1.default numberOfLines={1} style={[styles.flex1, styles.flexGrow1, styles.textStrong, isDeleted ? styles.offlineFeedback.deleted : {}]}>
                                {title}
                            </Text_1.default>
                        </Tooltip_1.default>
                    </react_native_1.View>
                    {shouldUseNarrowLayout && ThreeDotMenuOrPendingIcon}
                </react_native_1.View>
                <react_native_1.View style={[styles.flexRow, isWide && styles.flex1, isWide && styles.workspaceOwnerSectionMinWidth, styles.gap2, styles.alignItemsCenter]}>
                    {!!ownerDetails && (<>
                            <Avatar_1.default source={ownerDetails.avatar} avatarID={ownerDetails.accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.SMALL} containerStyles={styles.workspaceOwnerAvatarWrapper}/>
                            <react_native_1.View style={styles.flex1}>
                                <WorkspacesListRowDisplayName_1.default isDeleted={isDeleted} ownerName={(0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(ownerDetails)}/>
                                <Text_1.default numberOfLines={1} style={[styles.textMicro, styles.textSupporting, isDeleted ? styles.offlineFeedback.deleted : {}]}>
                                    {expensify_common_1.Str.removeSMSDomain((_b = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.login) !== null && _b !== void 0 ? _b : '')}
                                </Text_1.default>
                            </react_native_1.View>
                        </>)}
                </react_native_1.View>
                <react_native_1.View style={[styles.flexRow, isWide && styles.flex1, styles.gap2, styles.alignItemsCenter]}>
                    <Icon_1.default src={workspaceTypeIcon(workspaceType)} width={variables_1.default.workspaceTypeIconWidth} height={variables_1.default.workspaceTypeIconWidth} additionalStyles={styles.workspaceTypeWrapper}/>
                    <react_native_1.View>
                        {!!workspaceType && (<Text_1.default numberOfLines={1} style={[styles.labelStrong, isDeleted ? styles.offlineFeedback.deleted : {}]}>
                                {(0, PolicyUtils_1.getUserFriendlyWorkspaceType)(workspaceType)}
                            </Text_1.default>)}
                        <Text_1.default numberOfLines={1} style={[styles.textMicro, styles.textSupporting, isDeleted ? styles.offlineFeedback.deleted : {}]}>
                            {translate('workspace.common.plan')}
                        </Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>

            {!shouldUseNarrowLayout && ThreeDotMenuOrPendingIcon}
        </react_native_1.View>);
}
WorkspacesListRow.displayName = 'WorkspacesListRow';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(WorkspacesListRow);
