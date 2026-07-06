import { act, render } from "@testing-library/react-native";
import { LocaleContextProvider } from "@components/LocaleContextProvider";
import TransferOwnershipFlow from "@components/Tables/WorkspaceListTable/TransferOwnershipFlow";
import createDynamicRoute from "@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute";
import ROUTES, { DYNAMIC_ROUTES } from "@src/ROUTES";
import CONST from "@src/CONST";
import ONYXKEYS from "@src/ONYXKEYS";
import React from "react";
import Onyx from "react-native-onyx";

import waitForBatchedUpdatesWithAct from "../utils/waitForBatchedUpdatesWithAct";

const mockClearWorkspaceOwnerChangeFlow = jest.fn();
const mockRequestWorkspaceOwnerChange = jest.fn();
const mockNavigate = jest.fn();
const mockUseCurrentUserPersonalDetails = jest.fn();

jest.mock(
  "@hooks/useCurrentUserPersonalDetails",
  () => (): unknown => mockUseCurrentUserPersonalDetails(),
);

jest.mock("@libs/actions/Policy/Member", () => ({
  clearWorkspaceOwnerChangeFlow: (...args: unknown[]) => {
    mockClearWorkspaceOwnerChangeFlow(...args);
  },
  requestWorkspaceOwnerChange: (...args: unknown[]) => {
    mockRequestWorkspaceOwnerChange(...args);
  },
}));

jest.mock("@libs/Navigation/Navigation", () => ({
  navigate: (...args: unknown[]) => {
    mockNavigate(...args);
  },
  getActiveRoute: () => "",
}));

const POLICY_ID = "test-policy-id";
const USER_EMAIL = "owner@example.com";
const USER_ACCOUNT_ID = 42;

const renderAction = (onDismiss = jest.fn()) =>
  render(
    <LocaleContextProvider>
      <TransferOwnershipFlow policyID={POLICY_ID} onDismiss={onDismiss} />
    </LocaleContextProvider>,
  );

describe("TransferOwnershipFlow", () => {
  beforeAll(() => {
    Onyx.init({ keys: ONYXKEYS });
  });

  beforeEach(async () => {
    mockClearWorkspaceOwnerChangeFlow.mockReset();
    mockRequestWorkspaceOwnerChange.mockReset();
    mockNavigate.mockReset();
    mockUseCurrentUserPersonalDetails.mockReturnValue({
      accountID: USER_ACCOUNT_ID,
      login: USER_EMAIL,
    });
    await act(async () => {
      await Onyx.clear();
    });
  });

  it("renders null", async () => {
    await Onyx.set(ONYXKEYS.SESSION, {
      email: USER_EMAIL,
      accountID: USER_ACCOUNT_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
      id: POLICY_ID,
      name: "Test",
      role: CONST.POLICY.ROLE.ADMIN,
    });
    const { toJSON } = renderAction();
    await waitForBatchedUpdatesWithAct();
    expect(toJSON()).toBeNull();
  });

  it("calls clearWorkspaceOwnerChangeFlow with the policy ID once data loads", async () => {
    await Onyx.set(ONYXKEYS.SESSION, {
      email: USER_EMAIL,
      accountID: USER_ACCOUNT_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
      id: POLICY_ID,
      name: "Test",
      role: CONST.POLICY.ROLE.ADMIN,
    });
    renderAction();
    await waitForBatchedUpdatesWithAct();
    expect(mockClearWorkspaceOwnerChangeFlow).toHaveBeenCalledWith(POLICY_ID);
  });

  it("calls requestWorkspaceOwnerChange with the personal details account ID and login", async () => {
    await Onyx.set(ONYXKEYS.SESSION, {
      email: USER_EMAIL,
      accountID: USER_ACCOUNT_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
      id: POLICY_ID,
      name: "Test",
      role: CONST.POLICY.ROLE.ADMIN,
    });
    renderAction();
    await waitForBatchedUpdatesWithAct();
    expect(mockRequestWorkspaceOwnerChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: POLICY_ID }),
      USER_ACCOUNT_ID,
      USER_EMAIL,
    );
  });

  it("navigates to the ownership change check screen", async () => {
    await Onyx.set(ONYXKEYS.SESSION, {
      email: USER_EMAIL,
      accountID: USER_ACCOUNT_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
      id: POLICY_ID,
      name: "Test",
      role: CONST.POLICY.ROLE.ADMIN,
    });
    renderAction();
    await waitForBatchedUpdatesWithAct();
    // The component always passes 'amountOwed' as the initial error step and the active route from Navigation.getActiveRoute()
    expect(mockNavigate).toHaveBeenCalledWith(
      createDynamicRoute(
        DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
          POLICY_ID,
          USER_ACCOUNT_ID,
          "amountOwed",
        ),
        ROUTES.WORKSPACES_LIST.route,
      ),
    );
  });

  it("calls onDismiss once the flow has started", async () => {
    const onDismiss = jest.fn();
    await Onyx.set(ONYXKEYS.SESSION, {
      email: USER_EMAIL,
      accountID: USER_ACCOUNT_ID,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
      id: POLICY_ID,
      name: "Test",
      role: CONST.POLICY.ROLE.ADMIN,
    });
    renderAction(onDismiss);
    await waitForBatchedUpdatesWithAct();
    expect(onDismiss).toHaveBeenCalled();
  });
});
