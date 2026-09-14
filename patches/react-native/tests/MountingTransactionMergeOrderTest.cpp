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
#include <functional>
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
// Drain harness.
//
// Models FabricUIManagerBinding::schedulerShouldRenderTransactions together
// with the Java side it hands batches to. MountItemDispatcher appends every
// batch to a FIFO and does not re-enter while it is dispatching ("If we're
// already dispatching, don't reenter"), so native view operations are applied
// in the order executeMount schedules batches. Two hazards are modelled, both
// reachable only once patch +015 lets a surface hold several pending
// transactions:
//  - re-entrancy: a state update committed synchronously while the dispatcher
//    is part-way through applying a batch;
//  - concurrency: a drain on another thread (JS vs UI) that runs after this
//    drain has taken a transaction off the queue but before it mounts it.
// ---------------------------------------------------------------------------
enum class Drain { SwapWholeQueue, PopFront, SingleDrainer };

struct Op {
  int commit;
  ShadowViewMutation::Type type;
  Tag tag;
};

static std::vector<Op> gOps;

static ShadowViewMutation track(int commit, ShadowViewMutation mutation) {
  Tag tag = mutation.newChildShadowView.tag != -1 ? mutation.newChildShadowView.tag
                                                  : mutation.oldChildShadowView.tag;
  gOps.push_back({commit, mutation.type, tag});
  return mutation;
}

static int commitOf(const ShadowViewMutation& mutation) {
  Tag tag = mutation.newChildShadowView.tag != -1 ? mutation.newChildShadowView.tag
                                                  : mutation.oldChildShadowView.tag;
  for (const auto& op : gOps) {
    if (op.type == mutation.type && op.tag == tag) {
      return op.commit;
    }
  }
  return -1;
}

struct Binding {
  Drain drain;
  std::vector<MountingTransaction> pendingTransactions_;
  bool isDrainingPendingTransactions_ = false;

  // Java MountItemDispatcher.
  std::vector<std::vector<int>> javaQueue;
  bool inDispatch = false;

  // Commit number of every native view operation, in the order applied.
  std::vector<int> applied;

  // One-shot hooks.
  std::function<void()> afterFirstNativeOperation;
  std::function<void()> afterTakingTransaction;

  static void fire(std::function<void()>& hook) {
    if (hook) {
      auto run = std::move(hook);
      hook = nullptr;
      run();
    }
  }

  void schedulerDidFinishTransaction(MountingTransaction&& incoming) {
    auto pending = std::find_if(
        pendingTransactions_.rbegin(), pendingTransactions_.rend(),
        [&](const auto& t) { return t.getSurfaceId() == incoming.getSurfaceId(); });
    if (pending != pendingTransactions_.rend() && pending->canMergeWith(incoming)) {
      pending->mergeWith(std::move(incoming));
    } else {
      pendingTransactions_.push_back(std::move(incoming));
    }
  }

  // FabricMountingManager::executeMount -> FabricUIManager.scheduleMountItem on
  // the UI thread: append the batch, then try to dispatch.
  void executeMount(const MountingTransaction& transaction) {
    std::vector<int> batch;
    for (const auto& mutation : transaction.getMutations()) {
      batch.push_back(commitOf(mutation));
    }
    javaQueue.push_back(std::move(batch));
    tryDispatchMountItems();
  }

  void tryDispatchMountItems() {
    if (inDispatch) {
      return;
    }
    inDispatch = true;
    while (!javaQueue.empty()) {
      auto batch = std::move(javaQueue.front());
      javaQueue.erase(javaQueue.begin());
      for (int commit : batch) {
        applied.push_back(commit);
        fire(afterFirstNativeOperation);
      }
    }
    inDispatch = false;
  }

  void schedulerShouldRenderTransactions() {
    switch (drain) {
      case Drain::SwapWholeQueue: {
        std::vector<MountingTransaction> pendingTransactions;
        pendingTransactions_.swap(pendingTransactions);
        for (auto& transaction : pendingTransactions) {
          fire(afterTakingTransaction);
          executeMount(transaction);
        }
        return;
      }
      case Drain::PopFront: {
        while (!pendingTransactions_.empty()) {
          MountingTransaction transaction = std::move(pendingTransactions_.front());
          pendingTransactions_.erase(pendingTransactions_.begin());
          fire(afterTakingTransaction);
          executeMount(transaction);
        }
        return;
      }
      case Drain::SingleDrainer: {
        if (isDrainingPendingTransactions_) {
          return;
        }
        isDrainingPendingTransactions_ = true;
        while (true) {
          std::optional<MountingTransaction> transaction;
          if (pendingTransactions_.empty()) {
            isDrainingPendingTransactions_ = false;
            break;
          }
          transaction = std::move(pendingTransactions_.front());
          pendingTransactions_.erase(pendingTransactions_.begin());
          fire(afterTakingTransaction);
          executeMount(*transaction);
        }
        return;
      }
    }
  }
};

enum class Hazard { ReentrantMidBatch, ConcurrentDrain };

static void checkDrain(const std::string& name, Drain drain, Hazard hazard, bool expectInOrder) {
  gOps.clear();
  Binding binding{drain};

  // T1 deletes tag 100 and mounts tag 110; T2 re-creates tag 100, so +015
  // refuses the merge and the surface holds TWO pending transactions.
  binding.schedulerDidFinishTransaction(tx(1, {track(1, ShadowViewMutation::DeleteMutation(view(100))),
                                               track(1, ShadowViewMutation::CreateMutation(view(110))),
                                               track(1, ShadowViewMutation::InsertMutation(1, view(110), 0))}));
  binding.schedulerDidFinishTransaction(tx(2, {track(2, ShadowViewMutation::CreateMutation(view(100))),
                                               track(2, ShadowViewMutation::InsertMutation(1, view(100), 1))}));
  if (binding.pendingTransactions_.size() != 2) {
    failures++;
    std::printf("FAIL  %-44s setup: expected 2 pending, got %zu\n", name.c_str(),
                binding.pendingTransactions_.size());
    return;
  }

  if (hazard == Hazard::ReentrantMidBatch) {
    // A state update committed synchronously while T1's batch is half applied.
    binding.afterFirstNativeOperation = [&binding] {
      binding.schedulerDidFinishTransaction(
          tx(3, {track(3, ShadowViewMutation::InsertMutation(1, view(300), 2))}));
      binding.schedulerShouldRenderTransactions();
    };
  } else {
    // Another thread's drain wins the race to mount.
    binding.afterTakingTransaction = [&binding] { binding.schedulerShouldRenderTransactions(); };
  }

  binding.schedulerShouldRenderTransactions();

  std::string rendered;
  bool inOrder = !binding.applied.empty();
  for (size_t i = 0; i < binding.applied.size(); i++) {
    rendered += (i ? " " : "") + std::string("T") + std::to_string(binding.applied[i]);
    if (i > 0 && binding.applied[i] < binding.applied[i - 1]) {
      inOrder = false;
    }
  }
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

  std::printf("\n=== re-entrant commit while a batch is half applied ===\n");
  checkDrain("swap queue      [main: T3 jumps T2]", Drain::SwapWholeQueue, Hazard::ReentrantMidBatch, false);
  checkDrain("pop front       [in commit order]", Drain::PopFront, Hazard::ReentrantMidBatch, true);
  checkDrain("single drainer  [in commit order]", Drain::SingleDrainer, Hazard::ReentrantMidBatch, true);

  std::printf("\n=== second drain between taking and mounting a transaction ===\n");
  checkDrain("swap queue      [in commit order]", Drain::SwapWholeQueue, Hazard::ConcurrentDrain, true);
  checkDrain("pop front       [T2 jumps T1]", Drain::PopFront, Hazard::ConcurrentDrain, false);
  checkDrain("single drainer  [in commit order]", Drain::SingleDrainer, Hazard::ConcurrentDrain, true);

  std::printf("\n%d assertion(s) failing\n\n", failures);
  return failures == 0 ? 0 : 1;
}
