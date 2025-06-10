# `react-navigation` patches

### [@react-navigation+core+6.4.11+001+fix-react-strictmode.patch](@react-navigation+core+6.4.11+001+fix-react-strictmode.patch)

- Reason:

    ```
    The source of problems for us is that inside `useNavigationBuilder` there is [code](https://github.com/react-navigation/react-navigation/blob/6.x/packages/core/src/useNavigationBuilder.tsx#L557-L561) that cleans state on component unmount.
    Because of StrictMode navigation components will be rendered twice and their effects will run twice.
    This in turn means that when the navigation renders and runs for the second time, the state is already cleaned from the previous effect cleanup.
    
    Then [this](https://github.com/react-navigation/react-navigation/blob/6.x/packages/core/src/useNavigationBuilder.tsx#L372) check will trigger and there is no navigation happening at all.
    
    The patch fixes this similarly to v7.
    ```

- Upstream PR/issue: No upstream PR because it's already fixed in v7
- E/App issue: https://github.com/Expensify/App/issues/62850
- PR Introducing Patch: https://github.com/Expensify/App/pull/42592

### [@react-navigation+core+6.4.11+002+getStateFromPath-getPathFromState-configs-caching.patch](@react-navigation+core+6.4.11+002+getStateFromPath-getPathFromState-configs-caching.patch)

- Reason:

    ```
    Patch tries to improve getStateFromPath helper performance by extracting and caching calculations related to last linking config provided
    (due to its static nature, keeping reference to the latest value seems an OK heuristic).
    ```

- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/12120
- E/App issue: https://github.com/Expensify/App/issues/62850
- PR Introducing Patch: https://github.com/Expensify/App/pull/48151

### [@react-navigation+core+6.4.11+003+platform-navigation-stack-types.patch](@react-navigation+core+6.4.11+003+platform-navigation-stack-types.patch)

- Reason:

    ```
    Exposed types by exporting them and added/adapted some of the generic parameters, so that we can forward navigator's ParamLists
    ```

- Upstream PR/issue: X
- E/App issue: X
- PR Introducing Patch: https://github.com/Expensify/App/pull/37891

### [@react-navigation+material-top-tabs+6.6.3.patch](@react-navigation+material-top-tabs+6.6.3.patch)

- Reason:

    ```
    Before, the camera would only be set to active as soon as the camera screen (its rendered inside a tab screen navigator)
    has become fully visible. Now it will activate the camera as soon as we swipe / navigate to the camera
    ```
  
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11568
- E/App issue: https://github.com/Expensify/App/issues/62850
- PR Introducing Patch: https://github.com/Expensify/App/pull/26321

### [@react-navigation+native+6.1.12+001+initial.patch](@react-navigation+native+6.1.12+001+initial.patch)

- Reason:

    ```
    This patch allows us to use some more advanced navigation actions without messing up the browser history
    ```

- Upstream PR/issue: X
- E/App issue: X
- PR Introducing Patch: https://github.com/Expensify/App/pull/24165

### [@react-navigation+native+6.1.12+002+fix-getting-history-entry-when-navigating-back.patch](@react-navigation+native+6.1.12+002+fix-getting-history-entry-when-navigating-back.patch)

- Reason: 

    ```
    Fix a bug related to finding history entries corresponding to the current URL.
    ```

- Upstream PR/issue: X
- E/App issue: X
- PR Introducing Patch: https://github.com/Expensify/App/pull/58382

### [@react-navigation+native-stack+6.9.26+001+keyboardHandlingEnabled-prop.patch](@react-navigation+native-stack+6.9.26+001+keyboardHandlingEnabled-prop.patch)

- Reason:

    ```
    Add the keyboardHandlingEnabled prop on native-stack
    ```

- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11803/files
- E/App issue: https://github.com/Expensify/App/issues/62850
- PR Introducing Patch: https://github.com/Expensify/App/pull/37891

### [@react-navigation+native-stack+6.9.26+002+added-interaction-manager-integration.patch](@react-navigation+native-stack+6.9.26+002+added-interaction-manager-integration.patch)

- Reason:

    ```
    The integration with interactionManager was added in react-navigation@5 (https://reactnavigation.org/blog/2020/02/06/react-navigation-5.0/#other-improvements).
    
    And since then it was a convenient way to run tasks when animation gets finished.
    
    Since react-navigation@6 it's recommended to use native-stack instead of stack.
    However, it seems like InteractionManager doesn't take into consideration animations driven by native-stack.
    As a result all code that was relying on execution InteractionManager.runAfterInteractions callback after animation is broken when we switch to native-stack.
    ```

- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11887
- E/App issue: 
- PR Introducing Patch: https://github.com/Expensify/App/pull/37891

### [@react-navigation+stack+6.3.29+001+initial.patch](@react-navigation+stack+6.3.29+001+initial.patch)

- Reason:

    ```
    This is a patch for react-navigation to remove animation glitches on iOS Safari.
    These glitches occur when the user wants to navigate in the browser history with the swipe gesture.
    Quick and partial animation of the transition from the previous page is visible after swiping.

    To fix that we need to prevent transition animation for navigation done with gestures.
    ```

- Upstream PR/issue: https://github.com/react-navigation/react-navigation/issues/11309
- E/App issue:
- PR Introducing Patch: https://github.com/Expensify/App/pull/22678

### [@react-navigation+stack+6.3.29+002+dontDetachScreen.patch](@react-navigation+stack+6.3.29+002+dontDetachScreen.patch)

- Reason:

    ```
    Do not detach the Home screen even if the navigator has the detachInactiveScreens option.
    It's necessary to keep rendering the Home screen in wide view even if we have more screens on the stack.
    ```

- Upstream PR/issue:
- E/App issue:
- PR Introducing Patch: https://github.com/Expensify/App/pull/22437
