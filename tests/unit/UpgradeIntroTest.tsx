import {render, screen} from '@testing-library/react-native';

import MockText from '@components/Text';

import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import type UpgradeIntroView from '@pages/workspace/upgrade/UpgradeIntroView';

import CONST from '@src/CONST';

import React from 'react';

let mockMissingIcon: string | undefined;
let mockOverlapIcon: string | undefined;
let mockIntroProps: React.ComponentProps<typeof UpgradeIntroView> | undefined;
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: (names: string[]) => Object.fromEntries(names.filter((name) => name !== mockMissingIcon).map((name) => [name, `illustration:${name}`])),
    useMemoizedLazyExpensifyIcons: (names: string[]) =>
        Object.fromEntries([...names, ...(mockOverlapIcon ? [mockOverlapIcon] : [])].filter((name) => name !== mockMissingIcon).map((name) => [name, `icon:${name}`])),
}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/usePreferredCurrency', () => ({__esModule: true, default: () => 'USD'}));
jest.mock('@hooks/useHasTeam2025Pricing', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({br0: {borderRadius: 0}})}));
jest.mock('@pages/workspace/upgrade/GenericFeaturesView', () => ({__esModule: true, default: () => <MockText>generic upgrade</MockText>}));
jest.mock('@pages/workspace/upgrade/UpgradeIntroView', () => ({
    __esModule: true,
    default: (props: React.ComponentProps<typeof UpgradeIntroView>) => {
        mockIntroProps = props;
        return <MockText>feature upgrade</MockText>;
    },
}));
beforeEach(() => {
    mockMissingIcon = undefined;
    mockOverlapIcon = undefined;
    mockIntroProps = undefined;
});
describe('UpgradeIntro', () => {
    it('prefers the icon registry when both registries contain a feature name', () => {
        // Given the report-fields icon appears in both registries
        const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields;
        mockOverlapIcon = feature.icon;
        // When the real upgrade intro selects the icon
        render(
            <UpgradeIntro
                feature={feature}
                policyID="policy-1"
                onUpgrade={jest.fn()}
            />,
        );
        // Then the icon registry wins while illustration membership is retained
        expect(screen.getByText('feature upgrade')).toBeTruthy();
        expect(mockIntroProps?.iconSrc).toBe(`icon:${feature.icon}`);
        expect(mockIntroProps?.isIllustration).toBe(true);
    });
    it('reports a missing registry icon', () => {
        // Given a mapped feature whose icon is absent from both registries
        mockMissingIcon = CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.icon;
        // When the real upgrade intro checks its registry
        // Then it reports the missing icon instead of rendering a broken card
        expect(() =>
            render(
                <UpgradeIntro
                    feature={CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals}
                    policyID="policy-1"
                    onUpgrade={jest.fn()}
                />,
            ),
        ).toThrow(`Missing icons: ${mockMissingIcon}`);
    });
    it('shows the generic view without a feature', () => {
        // Given no feature was selected
        // When the real upgrade intro renders
        render(<UpgradeIntro onUpgrade={jest.fn()} />);
        // Then the generic view is shown
        expect(screen.getByText('generic upgrade')).toBeTruthy();
    });
    it('passes the approvals border style to the feature view', () => {
        // Given an approvals feature tied to a workspace
        // When the real upgrade intro renders
        render(
            <UpgradeIntro
                feature={CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals}
                policyID="policy-1"
                onUpgrade={jest.fn()}
            />,
        );
        // Then the approvals illustration receives its square-border style
        expect(mockIntroProps?.iconAdditionalStyles).toEqual({borderRadius: 0});
    });
});
