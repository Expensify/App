import Button from '@components/ButtonComposed';
import MenuItem from '@components/MenuItem';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

type RevokeRowProps = {
    /** Which set of devices this row revokes */
    title: string;

    /** Whether this row's revoke request is in flight */
    isLoading: boolean;

    /** Opens the confirmation modal for this row's set of devices */
    onPress: () => void;
};

/** A row naming a set of registered devices, with a `Revoke` button in the trailing cell */
function RevokeRow({title, isLoading, onPress}: RevokeRowProps) {
    const {translate} = useLocalize();

    return (
        <MenuItem.Root>
            <MenuItem.Row>
                <MenuItem.Content>
                    <MenuItem.Title>{title}</MenuItem.Title>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <Button
                        variant={CONST.BUTTON_VARIANT.DANGER}
                        size={CONST.BUTTON_SIZE.SMALL}
                        isLoading={isLoading}
                        onPress={onPress}
                    >
                        <Button.Text>{translate('multifactorAuthentication.revoke.revoke')}</Button.Text>
                    </Button>
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default RevokeRow;
