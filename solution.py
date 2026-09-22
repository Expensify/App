"""Compatibility entry point for the Top Merchants report task."""

from typing import Any
from app_module import group_expenses_by_merchant

def solve_task(data: dict[str, Any]) -> dict[str, Any]:
    """Process input according to specifications."""
    if not isinstance(data, dict):
        raise ValueError("Invalid input format")
    expenses = data.get("expenses", [])
    if not isinstance(expenses, list):
        raise ValueError("expenses must be a list")
    return {
        "status": "success",
        "task": '[$250] Reports - Expenses from different merchant grouped with same merchant on "Top Merchants"',
        "processed": True,
        "data": data,
        "groups": group_expenses_by_merchant(expenses),
    }
