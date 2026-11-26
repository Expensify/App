import {render, screen} from '@testing-library/react-native';

import MoneyReportHeaderHistoryButton from '@components/MoneyReportHeaderHistoryButton';
import Text from '@components/Text';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => (key === 'reportHistoryPage.title' ? 'Report history' : key)}));
jest.mock('@libs/Navigation/Navigation');

describe('MoneyReportHeaderHistoryButton', () => {
    it('reads the next step without its full stop before the comma', () => {
        // Given a next step message that ends with a full stop, as most of them do
        // When the status bar button renders it
        render(
            <MoneyReportHeaderHistoryButton
                message="Waiting for you to submit expenses."
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            >
                <Text>Waiting for you to submit expenses.</Text>
            </MoneyReportHeaderHistoryButton>,
        );

        // Then a screen reader hears one clean pause, not "expenses., Report history"
        expect(screen.getByLabelText('Waiting for you to submit expenses, Report history')).toBeOnTheScreen();
    });
});
