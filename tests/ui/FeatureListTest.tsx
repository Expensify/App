import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import CreditCardsNew from '@assets/images/simple-illustrations/simple-illustration__credit-cards.svg';
import HandCard from '@assets/images/simple-illustrations/simple-illustration__handcard.svg';
import MagnifyingGlassMoney from '@assets/images/simple-illustrations/simple-illustration__magnifyingglass-money.svg';
import MoneyReceipts from '@assets/images/simple-illustrations/simple-illustration__money-receipts.svg';
import MoneyWings from '@assets/images/simple-illustrations/simple-illustration__moneywings.svg';

import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {fontFamilyScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';

const TITLE = 'Card benefits';
const SUBTITLE = 'Features available to this workspace';
const FOOTER = 'Card terms remain below the benefits';
const CTA_TEXT = 'Set up cards';
const CTA_LABEL = 'Open card setup';
const PRESS_EVENT = {nativeEvent: {}};

const companyCardFeatures: FeatureListItem[] = [
    {icon: CreditCardsNew, translationKey: 'workspace.moreFeatures.companyCards.feed.features.support'},
    {icon: HandCard, translationKey: 'workspace.moreFeatures.companyCards.feed.features.assignCards'},
    {icon: MagnifyingGlassMoney, translationKey: 'workspace.moreFeatures.companyCards.feed.features.automaticImport'},
];

const expensifyCardFeatures: FeatureListItem[] = [
    {icon: MoneyReceipts, translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.cashBack'},
    {icon: CreditCardsNew, translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.unlimited'},
    {icon: MoneyWings, translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.spend'},
];

function renderFeatureList(props: Partial<React.ComponentProps<typeof FeatureList>> = {}) {
    return render(
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <LocaleContextProvider>
                    <FeatureList
                        title={TITLE}
                        subtitle={SUBTITLE}
                        menuItems={companyCardFeatures}
                        illustration={undefined}
                        {...props}
                    />
                </LocaleContextProvider>
            </ThemeStylesProvider>
        </ThemeProvider>,
    );
}

describe('FeatureList', () => {
    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each([
        {consumer: 'company cards', menuItems: companyCardFeatures},
        {consumer: 'Expensify Card', menuItems: expensifyCardFeatures},
    ])('renders the ordered illustrated benefits for $consumer without row actions', async ({menuItems}) => {
        // Given the benefit text and illustrations used by a real card empty state
        // When the feature list explains those benefits without offering a row action
        renderFeatureList({menuItems});

        // Then each translated announcement stays paired with its full-color illustration in the supplied order
        const icons = screen.UNSAFE_getAllByType(Icon);
        expect(icons).toHaveLength(menuItems.length);
        for (const [index, item] of menuItems.entries()) {
            const label = translateLocal(item.translationKey);
            const row = await screen.findByLabelText(label);
            const icon = within(row).UNSAFE_getByType(Icon);
            const iconProps = icon.props;
            const iconCellStyle: unknown = StyleSheet.flatten(icon.parent?.props.style);
            const title = screen.getByText(label);

            expect(icons.at(index)?.props).toMatchObject({src: item.icon});
            expect(iconProps).toMatchObject({src: item.icon, width: variables.menuIconSize, height: variables.menuIconSize});
            expect(iconProps.fill).toBeUndefined();
            expect(iconCellStyle).toMatchObject({width: variables.avatarSizeMedium, alignItems: 'center', justifyContent: 'center'});
            expect(title).toHaveStyle(fontFamilyScale.strong);

            // An omitted limit and zero both let translated titles wrap without truncation.
            expect(title.props.numberOfLines ?? 0).toBe(0);
            expect(row).toHaveProp('tabIndex', -1);
            expect(row).toHaveStyle({padding: 0});
            expect(within(row).queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
            expect(within(row).queryAllByRole('image')).toHaveLength(0);
        }
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it.each([undefined, ''])('keeps the section and footer when benefits are empty and CTA text is %p', (ctaText) => {
        // Given an empty benefit list and no CTA copy, which must not create an empty button
        // When the section still supplies its introductory text and terms
        renderFeatureList({menuItems: [], ctaText, footer: <Text>{FOOTER}</Text>});

        // Then the surrounding content remains readable without benefit icons or an unintended action
        expect(screen.getByText(TITLE)).toBeOnTheScreen();
        expect(screen.getByText(SUBTITLE)).toBeOnTheScreen();
        expect(screen.getByText(FOOTER)).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(Icon)).toHaveLength(0);
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it('keeps every benefit and unlimited bold titles for a longer translated list', async () => {
        // Given more benefits than either card screen and a locale that needs additional wrapping
        const menuItems = [...companyCardFeatures, ...expensifyCardFeatures];
        const longBenefitKey = 'workspace.moreFeatures.expensifyCard.feed.features.spend';
        const englishBenefit = translateLocal(longBenefitKey);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DE);
            await IntlStore.load(CONST.LOCALES.DE);
        });

        // When the real component renders all supplied benefits in that locale
        renderFeatureList({menuItems});

        // Then neither the number of benefits nor their translated length imposes a line limit
        expect(translateLocal(longBenefitKey)).not.toBe(englishBenefit);
        expect(screen.UNSAFE_getAllByType(Icon)).toHaveLength(menuItems.length);
        for (const item of menuItems) {
            const label = translateLocal(item.translationKey);
            expect(await screen.findByLabelText(label)).toBeOnTheScreen();
            const title = screen.getByText(label);
            expect(title.props.numberOfLines ?? 0).toBe(0);
            expect(title).toHaveStyle(fontFamilyScale.strong);
        }
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it('invokes the CTA callback only from the separately labelled button', async () => {
        // Given a setup action that belongs to the CTA rather than the explanatory benefits
        const openCardSetup = jest.fn();
        renderFeatureList({ctaText: CTA_TEXT, ctaAccessibilityLabel: CTA_LABEL, onCtaPress: openCardSetup});

        // When a reader presses the benefits while inspecting them
        for (const item of companyCardFeatures) {
            fireEvent.press(await screen.findByLabelText(translateLocal(item.translationKey)), PRESS_EVENT);
        }

        // Then reading the benefits cannot trigger setup
        expect(openCardSetup).not.toHaveBeenCalled();
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: CTA_LABEL});
        expect(cta).toBeEnabled();
        expect(screen.getByText(CTA_TEXT)).toBeOnTheScreen();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);

        // When the reader deliberately activates the CTA
        fireEvent.press(cta, PRESS_EVENT);

        // Then the existing callback runs once without making any benefit actionable
        expect(openCardSetup).toHaveBeenCalledTimes(1);
    });

    it('keeps a disabled CTA inactive without hiding its benefits or footer', async () => {
        // Given a caller that cannot start setup yet but still needs to explain its card benefits
        const openCardSetup = jest.fn();
        renderFeatureList({ctaText: CTA_TEXT, ctaAccessibilityLabel: CTA_LABEL, onCtaPress: openCardSetup, isButtonDisabled: true, footer: <Text>{FOOTER}</Text>});
        const cta = screen.getByRole(CONST.ROLE.BUTTON, {name: CTA_LABEL});

        // When activation is attempted while the caller has disabled setup
        fireEvent.press(cta, PRESS_EVENT);

        // Then the button keeps its disabled semantics and the explanatory content remains available
        expect(cta).toBeDisabled();
        expect(openCardSetup).not.toHaveBeenCalled();
        expect(screen.getByText(FOOTER)).toBeOnTheScreen();
        for (const item of companyCardFeatures) {
            expect(await screen.findByLabelText(translateLocal(item.translationKey))).toBeOnTheScreen();
        }
    });
});
