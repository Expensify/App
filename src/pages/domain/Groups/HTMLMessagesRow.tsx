import React from 'react';
import {View} from 'react-native';
import MessagesRow from '@components/MessagesRow';
import RenderHTML from '@components/RenderHTML';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type HTMLMessagesRowProps = {
    errors?: Errors;
    onDismiss?: () => void;
};

function HTMLMessagesRow({errors, onDismiss}: HTMLMessagesRowProps) {
    const styles = useThemeStyles();

    return (
        !!errors &&
        !isEmptyObject(errors) && (
            <MessagesRow
                type="error"
                messages={{
                    error: (
                        <View style={[styles.renderHTML, styles.flexRow]}>
                            <RenderHTML html={getLatestErrorMessage({errors})} />
                        </View>
                    ),
                }}
                onDismiss={onDismiss}
                containerStyles={[styles.mh5, styles.mt3]}
            />
        )
    );
}

export default HTMLMessagesRow;
