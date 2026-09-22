"""Unit tests for Antigravity deliverable."""
import pytest
from app_module import TaskRunner, group_expenses_by_merchant

def test_task_runner():
    runner = TaskRunner("freelance_test")
    res = runner.run()
    assert res["status"] == "ok"
    assert res["executed"] is True

def test_different_merchants_with_shared_prefix_are_separate():
    expenses = [{"id": 1, "merchant": "I"}, {"id": 2, "merchant": "Ig"}]
    assert group_expenses_by_merchant(expenses) == {"I": [expenses[0]], "Ig": [expenses[1]]}

def test_same_merchant_expenses_stay_in_one_group():
    expenses = [{"id": 1, "merchant": "Cafe"}, {"id": 2, "merchant": "Cafe"}]
    assert group_expenses_by_merchant(expenses) == {"Cafe": expenses}

@pytest.mark.parametrize("expense", [None, "not an expense", 42])
def test_invalid_expense_is_rejected(expense):
    with pytest.raises(ValueError, match="dictionary"):
        group_expenses_by_merchant([expense])

def test_blank_or_missing_merchants_use_unknown_bucket():
    expenses = [{"id": 1, "merchant": "  "}, {"id": 2}]
    assert group_expenses_by_merchant(expenses) == {"Unknown": expenses}
