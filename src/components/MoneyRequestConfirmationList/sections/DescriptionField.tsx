import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestDescription} from '@libs/actions/IOU/MoneyRequest';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';

import variables from '@styles/variables';

import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useRef} from 'react';
import {View} from 'react-native';

import {descriptionStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type DescriptionFieldProps = {
    isNewManualExpenseFlowEnabled: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    isDescriptionRequired: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function DescriptionField({
    isNewManualExpenseFlowEnabled,
    isReadOnly,
    didConfirm,
    isDescriptionRequired,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    policy,
}: DescriptionFieldProps) {
    const {isEditingSplitBill, scrollFocusedInputIntoView, onSubmitForm} = useConfirmationFields();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // Ref on the field's outer container (the bordered box), so scrolling brings the whole field — including its
    // top border and label — into view rather than just the inner text area.
    const fieldContainerRef = useRef<View>(null);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const descriptionState = useTransactionSelector(transactionID, descriptionStateSelector);

    // `getDescription` returns raw `transaction.comment.comment`, which can be HTML for saved transactions.
    // We normalize to markdown so both the read-only and editable inputs receive a consistent format.
    const iouComment = Parser.htmlToMarkdown(descriptionState?.description ?? '');
    const transactionHasReceipt = descriptionState?.hasReceipt ?? false;

    const contextMenuStateValue = {
        anchor: null,
        report: undefined,
        action: undefined,
        isDisabled: true,
        shouldDisplayContextMenu: false,
    };

    const contextMenuActionsValue = {
        checkIfContextMenuActive: () => {},
        onShowContextMenu: () => {},
    };

    const mentionReportContextValue = {currentReportID: reportID, exactlyMatch: true};

    // This is a multi-line input, so Enter must insert a new line. On touch devices that's the only way to add one,
    // so we never let Enter submit there (otherwise it's impossible to type a multi-line description — see #94258).
    // On hardware-keyboard setups Shift+Enter still inserts a new line, so we keep Enter-to-confirm, matching the
    // dedicated description step page (which gets `blurAndSubmit` from InputWrapper for the same reason).
    const canUseHardwareKeyboard = !canUseTouchScreen();

    const handleDescriptionInputChange = (newDescription: string) => {
        if (!transactionID) {
            return;
        }

        // When editing a split expense, persist directly to the split draft so that
        // SplitBillDetailsPage and completeSplitBill read the latest value.
        // Trimming is deferred to submission time, not during keystrokes, to avoid
        // silently stripping trailing spaces as the user types.
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {comment: newDescription});
            return;
        }

        setMoneyRequestDescription(transactionID, newDescription, true, transactionHasReceipt);
    };

    return (
        <View>
            <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                    <MentionReportContext.Provider value={mentionReportContextValue}>
                        {isNewManualExpenseFlowEnabled && !isReadOnly ? (
                            <View
                                ref={fieldContainerRef}
                                style={[styles.mh4, styles.mv2]}
                            >
                                <TextInput
                                    value={iouComment ?? ''}
                                    readOnly={didConfirm}
                                    onChangeText={handleDescriptionInputChange}
                                    onFocus={() => scrollFocusedInputIntoView?.(fieldContainerRef.current)}
                                    submitBehavior={canUseHardwareKeyboard ? 'blurAndSubmit' : 'newline'}
                                    onSubmitEditing={canUseHardwareKeyboard ? onSubmitForm : undefined}
                                    label={translate('common.description')}
                                    accessibilityLabel={translate('common.description')}
                                    autoGrowHeight
                                    maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                                    type="markdown"
                                    excludedMarkdownStyles={!policy ? ['mentionReport'] : []}
                                />
                            </View>
                        ) : (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon={!isReadOnly}
                                shouldParseTitle
                                excludedMarkdownRules={!policy ? ['reportMentions'] : []}
                                title={iouComment}
                                description={translate('common.description')}
                                onPress={() => {
                                    if (!transactionID) {
                                        return;
                                    }

                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                                    );
                                }}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                                disabled={didConfirm}
                                interactive={!isReadOnly}
                                numberOfLinesTitle={2}
                                rightLabel={isDescriptionRequired ? translate('common.required') : ''}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESCRIPTION_FIELD}
                            />
                        )}
                    </MentionReportContext.Provider>
                </ShowContextMenuActionsContext.Provider>
            </ShowContextMenuStateContext.Provider>
        </View>
    );
}

export default DescriptionField;
