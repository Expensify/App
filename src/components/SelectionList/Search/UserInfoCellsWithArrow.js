"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var UserInfoCell_1 = require("./UserInfoCell");
function UserInfoCellsWithArrow(_a) {
    var shouldShowToRecipient = _a.shouldShowToRecipient, participantFrom = _a.participantFrom, participantFromDisplayName = _a.participantFromDisplayName, participantTo = _a.participantTo, participantToDisplayName = _a.participantToDisplayName, avatarSize = _a.avatarSize, infoCellsTextStyle = _a.infoCellsTextStyle, infoCellsAvatarStyle = _a.infoCellsAvatarStyle, fromRecipientStyle = _a.fromRecipientStyle;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    if (!participantFrom) {
        return null;
    }
    return (<>
            <react_native_1.View style={[styles.mw50, fromRecipientStyle]}>
                <UserInfoCell_1.default accountID={participantFrom.accountID} avatar={participantFrom.avatar} displayName={participantFromDisplayName} avatarSize={avatarSize} textStyle={infoCellsTextStyle} avatarStyle={infoCellsAvatarStyle}/>
            </react_native_1.View>
            {shouldShowToRecipient && (<>
                    <Icon_1.default src={Expensicons.ArrowRightLong} width={variables_1.default.iconSizeXXSmall} height={variables_1.default.iconSizeXXSmall} fill={theme.icon} testID="ArrowRightLong Icon"/>
                    <react_native_1.View style={[styles.flex1, styles.mw50]}>
                        <UserInfoCell_1.default accountID={participantTo.accountID} avatar={participantTo.avatar} displayName={participantToDisplayName} avatarSize={avatarSize} textStyle={infoCellsTextStyle} avatarStyle={infoCellsAvatarStyle}/>
                    </react_native_1.View>
                </>)}
        </>);
}
UserInfoCellsWithArrow.displayName = 'UserInfoCellsWithArrow';
exports.default = UserInfoCellsWithArrow;
