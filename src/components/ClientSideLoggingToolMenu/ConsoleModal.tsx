import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ListRenderItem, ListRenderItemInfo, View} from 'react-native';
import ConsolePage from "@pages/settings/AboutPage/ConsolePage";
import CONST from "@src/CONST";
import Modal from "@components/Modal";
import useWindowDimensions from "@hooks/useWindowDimensions";
import useStyleUtils from "@hooks/useStyleUtils";
import useThemeStyles from "@hooks/useThemeStyles";
import useLocalize from "@hooks/useLocalize";
import InvertedFlatList from "@components/InvertedFlatList";
import Text from "@components/Text";
import {CapturedLogs, Log} from "@src/types/onyx";
import {format} from "date-fns";
import {OnyxEntry, withOnyx} from "react-native-onyx";
import ONYXKEYS from "@src/ONYXKEYS";
import {createLog, parseStringifiedMessages, sanitizeConsoleInput} from "@libs/Console";
import {addLog} from "@userActions/Console";
import useKeyboardShortcut from "@hooks/useKeyboardShortcut";
import localFileDownload from "@libs/localFileDownload";
import localFileCreate from "@libs/localFileCreate";
import Navigation from "@navigation/Navigation";
import ROUTES from "@src/ROUTES";
import Button from "@components/Button";
import * as Expensicons from "@components/Icon/Expensicons";
import TextInput from "@components/TextInput";
import ConfirmModal from "@components/ConfirmModal";
import ShareLogList from "@pages/settings/AboutPage/ShareLogList";
import ConsoleComponents from "@components/ClientSideLoggingToolMenu/ConsoleComponents";

type ConsoleModalProps = {
    /** Locally created file */
    isVisible: boolean
    /** Action to run when pressing Share button */
    onClose?: () => void;
};


function ConsoleModal({isVisible, onClose, closeTestToolsModal}: ConsoleModalProps) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    return (
        <Modal
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_SMALL_AND_UNSWIPEABLE}
            onClose={onClose}
        >
            <View style={[StyleUtils.getTestToolsModalStyle(windowWidth), {height: (windowHeight * 0.9)}]}>

                <ConsoleComponents onClose={() => {
                    if (onClose) {
                        onClose()
                    }
                    closeTestToolsModal()
                }}
                                   isViaTestToolsModal/>
            </View>
        </Modal>
    );
}

ConsoleModal.displayName = 'ConsoleModal';

export default ConsoleModal;
