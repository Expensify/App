// Deterministic, device-free harness for Expensify/App#98791.
//
// It links the REAL, UNMODIFIED translation unit
//   node_modules/react-native/ReactCommon/react/renderer/mounting/MountingTransaction.cpp
// (which carries patch +015's canMergeWith) against minimal stand-in headers.
// Every merge decision below is made by the shipped code, not by a copy of it.
//
// Run with: ./patches/react-native/tests/run.sh
#include <react/renderer/mounting/MountingTransaction.h>

#include <algorithm>
#include <cstdio>
#include <string>
#include <optional>
#include <utility>
#include <vector>

using namespace facebook::react;

static int failures = 0;
static void check(const std::string& name, bool actual, bool expected) {
  const bool ok = actual == expected;
  if (!ok) {
    failures++;
  }
  std::printf(
      "%s  %-58s canMergeWith=%-5s expected=%s\n",
      ok ? "PASS" : "FAIL",
      name.c_str(),
      actual ? "true" : "false",
      expected ? "true" : "false");
}

static ShadowView view(Tag tag) {
  ShadowView v;
  v.tag = tag;
  return v;
}

static MountingTransaction tx(
    MountingTransaction::Number number,
    ShadowViewMutationList&& mutations,
    SurfaceId surfaceId = 1) {
  return MountingTransaction(
      surfaceId, number, std::move(mutations), TransactionTelemetry{});
}


// ---------------------------------------------------------------------------
// Queue-ordering harness.
//
// Replicates FabricUIManagerBinding::schedulerDidFinishTransaction's merge-target
// selection verbatim (node_modules/.../jni/react/fabric/FabricUIManagerBinding.cpp:638-650)
// and its drain order (:697-700). The merge DECISIONS come from the real
// MountingTransaction::canMergeWith / ::mergeWith linked above.
// ---------------------------------------------------------------------------
enum class Lookup { Forward, Reverse };

static std::vector<std::pair<ShadowViewMutation::Type, Tag>> drainOrder(Lookup lookup) {
  std::vector<MountingTransaction> pendingTransactions_;

  auto submit = [&](MountingTransaction&& incoming) {
    if (lookup == Lookup::Forward) {
      auto pendingTransaction = std::find_if(
          pendingTransactions_.begin(),
          pendingTransactions_.end(),
          [&](const auto& transaction) {
            return transaction.getSurfaceId() == incoming.getSurfaceId();
          });
      if (pendingTransaction != pendingTransactions_.end() &&
          pendingTransaction->canMergeWith(incoming)) {
        pendingTransaction->mergeWith(std::move(incoming));
      } else {
        pendingTransactions_.push_back(std::move(incoming));
      }
    } else {
      auto pendingTransaction = std::find_if(
          pendingTransactions_.rbegin(),
          pendingTransactions_.rend(),
          [&](const auto& transaction) {
            return transaction.getSurfaceId() == incoming.getSurfaceId();
          });
      if (pendingTransaction != pendingTransactions_.rend() &&
          pendingTransaction->canMergeWith(incoming)) {
        pendingTransaction->mergeWith(std::move(incoming));
      } else {
        pendingTransactions_.push_back(std::move(incoming));
      }
    }
  };

  // T1 deletes tag 100.  T2 re-creates tag 100 -> +015 correctly refuses the
  // merge, so the surface now holds TWO pending transactions.  T3 touches only
  // unrelated tags, so it is free to merge with either of them.
  submit(tx(1, {ShadowViewMutation::DeleteMutation(view(100))}));
  submit(tx(2, {ShadowViewMutation::CreateMutation(view(100)),
                ShadowViewMutation::InsertMutation(1, view(100), 0)}));
  submit(tx(3, {ShadowViewMutation::InsertMutation(1, view(300), 1)}));

  // schedulerShouldRenderTransactions executes the queue in list order.
  std::vector<std::pair<ShadowViewMutation::Type, Tag>> order;
  for (const auto& transaction : pendingTransactions_) {
    for (const auto& mutation : transaction.getMutations()) {
      Tag tag = mutation.newChildShadowView.tag != -1
          ? mutation.newChildShadowView.tag
          : mutation.oldChildShadowView.tag;
      order.emplace_back(mutation.type, tag);
    }
  }
  return order;
}

static const char* typeName(ShadowViewMutation::Type type) {
  switch (type) {
    case ShadowViewMutation::Create: return "Create";
    case ShadowViewMutation::Delete: return "Delete";
    case ShadowViewMutation::Insert: return "Insert";
    case ShadowViewMutation::Remove: return "Remove";
    default: return "Update";
  }
}

static void checkOrder(const std::string& name, Lookup lookup, bool expectInCommitOrder) {
  auto order = drainOrder(lookup);

  std::string rendered;
  long idxCreate100 = -1;
  long idxInsert300 = -1;
  for (size_t i = 0; i < order.size(); i++) {
    rendered += (i ? " " : "");
    rendered += typeName(order[i].first);
    rendered += "(" + std::to_string(order[i].second) + ")";
    if (order[i].first == ShadowViewMutation::Create && order[i].second == 100) {
      idxCreate100 = static_cast<long>(i);
    }
    if (order[i].first == ShadowViewMutation::Insert && order[i].second == 300) {
      idxInsert300 = static_cast<long>(i);
    }
  }

  // Commit 3's Insert(300) was diffed against a tree that already contains
  // commit 2's Create(100). Executing it first applies commit 3 to a tree
  // commit 2 has not built yet -- the divergence both Sentry signatures need.
  const bool inCommitOrder = idxCreate100 >= 0 && idxInsert300 > idxCreate100;
  const bool ok = inCommitOrder == expectInCommitOrder;
  if (!ok) {
    failures++;
  }
  std::printf(
      "%s  %-44s %s\n",
      ok ? "PASS" : "FAIL",
      name.c_str(),
      rendered.c_str());
}


// ---------------------------------------------------------------------------
// Re-entrancy harness.
//
// schedulerShouldRenderTransactions justifies its swap-then-mount drain with:
//   "This is safe because we're already combining all the transactions for the
//    same surface ID in a single transaction in the pending transactions list,
//    so operations won't run out of order."
// Patch +015 made that premise false: a refused merge leaves several pending
// transactions for one surface. This models a synchronous commit raised from
// inside executeMount, which the same comment says does happen.
// ---------------------------------------------------------------------------
enum class Drain { SwapWholeQueue, PopFront };

struct Binding {
  Drain drain;
  Lookup lookup;
  std::vector<MountingTransaction> pendingTransactions_;
  std::vector<Tag> mounted;
  bool reentrantCommitPending = false;

  void schedulerDidFinishTransaction(MountingTransaction&& incoming) {
    if (lookup == Lookup::Forward) {
      auto it = std::find_if(
          pendingTransactions_.begin(), pendingTransactions_.end(),
          [&](const auto& t) { return t.getSurfaceId() == incoming.getSurfaceId(); });
      if (it != pendingTransactions_.end() && it->canMergeWith(incoming)) {
        it->mergeWith(std::move(incoming));
        return;
      }
    } else {
      auto it = std::find_if(
          pendingTransactions_.rbegin(), pendingTransactions_.rend(),
          [&](const auto& t) { return t.getSurfaceId() == incoming.getSurfaceId(); });
      if (it != pendingTransactions_.rend() && it->canMergeWith(incoming)) {
        it->mergeWith(std::move(incoming));
        return;
      }
    }
    pendingTransactions_.push_back(std::move(incoming));
  }

  void executeMount(const MountingTransaction& transaction) {
    for (const auto& mutation : transaction.getMutations()) {
      Tag tag = mutation.newChildShadowView.tag != -1 ? mutation.newChildShadowView.tag
                                                      : mutation.oldChildShadowView.tag;
      mounted.push_back(tag);
    }
    // A state update committed synchronously from the UI thread while mounting.
    if (reentrantCommitPending) {
      reentrantCommitPending = false;
      schedulerDidFinishTransaction(tx(3, {ShadowViewMutation::InsertMutation(1, view(300), 1)}));
      schedulerShouldRenderTransactions();
    }
  }

  void schedulerShouldRenderTransactions() {
    if (drain == Drain::SwapWholeQueue) {
      std::vector<MountingTransaction> pendingTransactions;
      {
        pendingTransactions_.swap(pendingTransactions);
      }
      for (auto& transaction : pendingTransactions) {
        executeMount(transaction);
      }
    } else {
      while (true) {
        std::optional<MountingTransaction> transaction;
        {
          if (pendingTransactions_.empty()) {
            break;
          }
          transaction = std::move(pendingTransactions_.front());
          pendingTransactions_.erase(pendingTransactions_.begin());
        }
        executeMount(*transaction);
      }
    }
  }
};

static void checkReentrancy(const std::string& name, Drain drain, Lookup lookup, bool expectInOrder) {
  Binding binding{drain, lookup, {}, {}, false};
  // T1 deletes tag 100; T2 re-creates it, so +015 refuses the merge and the
  // surface is left holding TWO pending transactions.
  binding.schedulerDidFinishTransaction(tx(1, {ShadowViewMutation::DeleteMutation(view(100))}));
  binding.schedulerDidFinishTransaction(tx(2, {ShadowViewMutation::CreateMutation(view(100)),
                                               ShadowViewMutation::InsertMutation(1, view(100), 0)}));
  if (binding.pendingTransactions_.size() != 2) {
    failures++;
    std::printf("FAIL  %-44s setup: expected 2 pending, got %zu\n", name.c_str(),
                binding.pendingTransactions_.size());
    return;
  }
  binding.reentrantCommitPending = true;
  binding.schedulerShouldRenderTransactions();

  std::string rendered;
  for (size_t i = 0; i < binding.mounted.size(); i++) {
    rendered += (i ? " -> " : "") + std::to_string(binding.mounted[i]);
  }
  // Commit 3 is the newest commit, so its Insert(300) must mount last.
  const bool inOrder = !binding.mounted.empty() && binding.mounted.back() == 300;
  const bool ok = inOrder == expectInOrder;
  if (!ok) failures++;
  std::printf("%s  %-44s %s\n", ok ? "PASS" : "FAIL", name.c_str(), rendered.c_str());
}

int main() {
  constexpr Tag kChild = 5;
  constexpr Tag kParent = 7;

  std::printf("\n=== canMergeWith: what the shipped guard actually refuses ===\n");

  // 1. Baseline: the arm patch +015 does close. Must stay closed.
  {
    auto pending = tx(1, {ShadowViewMutation::RemoveMutation(kParent, view(kChild), 0),
                          ShadowViewMutation::DeleteMutation(view(kChild))});
    auto incoming = tx(2, {ShadowViewMutation::CreateMutation(view(kChild)),
                           ShadowViewMutation::InsertMutation(kParent, view(kChild), 0)});
    check("Delete(t) + Create(t)      [+015 guard, must refuse]",
          pending.canMergeWith(incoming), false);
  }

  // 2. APP-7AR arm. The guard's own header comment names INSERT; the code checks only Create.
  {
    auto pending = tx(1, {ShadowViewMutation::RemoveMutation(kParent, view(kChild), 0),
                          ShadowViewMutation::DeleteMutation(view(kChild))});
    auto incoming = tx(2, {ShadowViewMutation::InsertMutation(kParent, view(kChild), 1)});
    check("Delete(t) + Insert(t), no Create  [APP-7AR, must refuse]",
          pending.canMergeWith(incoming), false);
  }

  // 3. APP-H7A arm: a deleted tag reused as the parent of an incoming mutation.
  {
    auto pending = tx(1, {ShadowViewMutation::RemoveMutation(1, view(kParent), 0),
                          ShadowViewMutation::DeleteMutation(view(kParent))});
    auto incoming = tx(2, {ShadowViewMutation::InsertMutation(kParent, view(9), 0)});
    check("Delete(p) + Insert(child under p) [APP-H7A, must refuse]",
          pending.canMergeWith(incoming), false);
  }

  // 4. Same, remove side: removeViewAt resolves a parent that the deferred Delete tore down.
  {
    auto pending = tx(1, {ShadowViewMutation::RemoveMutation(1, view(kParent), 0),
                          ShadowViewMutation::DeleteMutation(view(kParent))});
    auto incoming = tx(2, {ShadowViewMutation::RemoveMutation(kParent, view(9), 0)});
    check("Delete(p) + Remove(child under p) [APP-H7A, must refuse]",
          pending.canMergeWith(incoming), false);
  }

  // 5. Negative control: unrelated tags must still merge, or we would kill batching.
  {
    auto pending = tx(1, {ShadowViewMutation::DeleteMutation(view(kChild))});
    auto incoming = tx(2, {ShadowViewMutation::InsertMutation(kParent, view(11), 0),
                           ShadowViewMutation::CreateMutation(view(12))});
    check("Delete(5) + Insert(11)/Create(12) [unrelated, must merge]",
          pending.canMergeWith(incoming), true);
  }

  std::printf("\n=== pending-transaction queue: execution vs commit order ===\n");
  checkOrder("first match  [shipped: OUT of commit order]", Lookup::Forward, false);
  checkOrder("newest match [fixed:   IN commit order]", Lookup::Reverse, true);

  std::printf("\n=== re-entrant commit raised from inside executeMount ===\n");
  checkReentrancy("swap + first match  [shipped]", Drain::SwapWholeQueue, Lookup::Forward, false);
  checkReentrancy("swap + newest match [#99608 only]", Drain::SwapWholeQueue, Lookup::Reverse, false);
  checkReentrancy("pop front + newest  [fixed]", Drain::PopFront, Lookup::Reverse, true);

  std::printf("\n%d assertion(s) failing\n\n", failures);
  return failures == 0 ? 0 : 1;
}
