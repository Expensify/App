# `victory-native` patches

### [victory-native+42.0.1+001+horizontal-bars.patch](victory-native+42.0.1+001+horizontal-bars.patch)

- Reason:
  
    ```
    This patch adds support to horizontal bars when rendered in <BarGroup />
    ```
  
- Upstream PR/issue: Not yet. This is urgent patch with deadline.
- E/App issue: https://github.com/Expensify/App/issues/91883
- PR introducing patch: https://github.com/Expensify/App/pull/91659


### [victory-native+42.0.1+002+tickCount-4121.patch](victory-native+42.0.1+002+tickCount-4121.patch)

- Reason:
  
    ```
    After updating to v42 the tickCount broke.
    This was was caused by this commit https://github.com/FormidableLabs/victory-native-xl/pull/664/changes/fcd8affe655878d0bf95ab87c087eab428d4f62d
    which fixed some bug but caused us another bug. This small patch reverts it. This is a temporarily solution not a real fix.
    The fix should address both bugs.
    ```
  
- Upstream PR/issue: Not yet.
- E/App issue: https://github.com/Expensify/App/issues/91883
- PR introducing patch: https://github.com/Expensify/App/pull/100186
