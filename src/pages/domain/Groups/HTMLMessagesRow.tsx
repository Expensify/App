import React from 'react';
import {View} from 'react-native';
import MessagesRow from '@components/MessagesRow';
import RenderHTML from '@components/RenderHTML';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Parser from '@libs/Parser';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type HTMLMessagesRowProps = {
    errors?: Errors;
    onDismiss?: () => void;
};

function HTMLMessagesRow({errors, onDismiss}: HTMLMessagesRowProps) {
    const styles = useThemeStyles();

    if (!errors || isEmptyObject(errors)) {
        return null;
    }

    const latestErrorMessage = getLatestErrorMessage({errors});
    const messages = {
        error: Parser.isHTML(latestErrorMessage) ? (
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={latestErrorMessage} />
            </View>
        ) : (
            latestErrorMessage
        ),
    };

    return (
        <MessagesRow
            type="error"
            messages={messages}
            onDismiss={onDismiss}
            containerStyles={[styles.mh5, styles.mt3]}
        />
    );
}

export default HTMLMessagesRow;
