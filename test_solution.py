"""Unit tests for automated solution."""
import pytest
from solution import solve_task

def test_solve_task_success():
    res = solve_task({"key": "value"})
    assert res["status"] == "success"
    assert res["processed"] is True

def test_solve_task_invalid():
    with pytest.raises(ValueError):
        solve_task("invalid")

def test_solve_task_returns_separate_top_merchant_groups():
    data = {"expenses": [{"id": 1, "merchant": "I"}, {"id": 2, "merchant": "Ig"}]}
    result = solve_task(data)
    assert list(result["groups"]) == ["I", "Ig"]
    assert result["groups"]["I"][0]["id"] == 1
    assert result["groups"]["Ig"][0]["id"] == 2

def test_solve_task_rejects_non_list_expenses():
    with pytest.raises(ValueError, match="list"):
        solve_task({"expenses": {"merchant": "I"}})
