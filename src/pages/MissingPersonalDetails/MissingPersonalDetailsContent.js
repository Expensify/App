"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useSubStep_1 = require("@hooks/useSubStep");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormActions_1 = require("@libs/actions/FormActions");
var PersonalDetails_1 = require("@libs/actions/PersonalDetails");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MissingPersonalDetailsMagicCodeModal_1 = require("./MissingPersonalDetailsMagicCodeModal");
var Address_1 = require("./substeps/Address");
var Confirmation_1 = require("./substeps/Confirmation");
var DateOfBirth_1 = require("./substeps/DateOfBirth");
var LegalName_1 = require("./substeps/LegalName");
var PhoneNumber_1 = require("./substeps/PhoneNumber");
var utils_1 = require("./utils");
var formSteps = [LegalName_1.default, DateOfBirth_1.default, Address_1.default, PhoneNumber_1.default, Confirmation_1.default];
function MissingPersonalDetailsContent(_a) {
    var privatePersonalDetails = _a.privatePersonalDetails, draftValues = _a.draftValues;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isValidateCodeActionModalVisible = _b[0], setIsValidateCodeActionModalVisible = _b[1];
    var ref = (0, react_1.useRef)(null);
    var values = (0, react_1.useMemo)(function () { return (0, utils_1.getSubstepValues)(privatePersonalDetails, draftValues); }, [privatePersonalDetails, draftValues]);
    var startFrom = (0, react_1.useMemo)(function () { return (0, utils_1.getInitialSubstep)(values); }, [values]);
    var handleFinishStep = (0, react_1.useCallback)(function () {
        if (!values) {
            return;
        }
        setIsValidateCodeActionModalVisible(true);
    }, [values]);
    var _c = (0, useSubStep_1.default)({ bodyContent: formSteps, startFrom: startFrom, onFinished: handleFinishStep }), SubStep = _c.componentToRender, isEditing = _c.isEditing, nextScreen = _c.nextScreen, prevScreen = _c.prevScreen, screenIndex = _c.screenIndex, moveTo = _c.moveTo, goToTheLastStep = _c.goToTheLastStep, lastScreenIndex = _c.lastScreenIndex;
    var handleBackButtonPress = function () {
        var _a, _b;
        if (isEditing) {
            goToTheLastStep();
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveTo(lastScreenIndex);
            return;
        }
        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME) {
            (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM);
            Navigation_1.default.goBack();
            return;
        }
        (_b = ref.current) === null || _b === void 0 ? void 0 : _b.movePrevious();
        prevScreen();
    };
    var handleSubmitForm = (0, react_1.useCallback)(function (validateCode) {
        (0, PersonalDetails_1.updatePersonalDetailsAndShipExpensifyCards)(values, validateCode);
    }, [values]);
    var handleNextScreen = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (isEditing) {
            goToTheLastStep();
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveTo(lastScreenIndex);
            return;
        }
        (_b = ref.current) === null || _b === void 0 ? void 0 : _b.moveNext();
        nextScreen();
    }, [goToTheLastStep, isEditing, nextScreen, lastScreenIndex]);
    var handleMoveTo = (0, react_1.useCallback)(function (step) {
        var _a;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.moveTo(step);
        moveTo(step);
    }, [moveTo]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight testID={MissingPersonalDetailsContent.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.expensifyCard.addShippingDetails')} onBackButtonPress={handleBackButtonPress}/>
            <react_native_1.View style={[styles.ph5, styles.mb3, styles.mt3, { height: CONST_1.default.NETSUITE_FORM_STEPS_HEADER_HEIGHT }]}>
                <InteractiveStepSubHeader_1.default ref={ref} startStepIndex={startFrom} stepNames={CONST_1.default.MISSING_PERSONAL_DETAILS_INDEXES.INDEX_LIST}/>
            </react_native_1.View>
            <SubStep isEditing={isEditing} onNext={handleNextScreen} onMove={handleMoveTo} screenIndex={screenIndex} personalDetailsValues={values}/>

            <MissingPersonalDetailsMagicCodeModal_1.default onClose={function () { return setIsValidateCodeActionModalVisible(false); }} isValidateCodeActionModalVisible={isValidateCodeActionModalVisible} handleSubmitForm={handleSubmitForm}/>
        </ScreenWrapper_1.default>);
}
MissingPersonalDetailsContent.displayName = 'MissingPersonalDetailsContent';
exports.default = MissingPersonalDetailsContent;
