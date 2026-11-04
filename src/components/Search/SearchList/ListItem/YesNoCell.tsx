import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import React from 'react';

type YesNoCellProps = {
    /** Whether the cell shows Yes or No */
    value: boolean;
};

function YesNoCell({value}: YesNoCellProps) {
    const {translate} = useLocalize();

    return (
        <Text
            selectable
            dataSet={COPYABLE_TEXT_DATA_SET}
        >
            {value ? translate('common.yes') : translate('common.no')}
        </Text>
    );
}

export default YesNoCell;
