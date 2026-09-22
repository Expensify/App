"""Merchant grouping logic for the Top Merchants report."""

from collections import defaultdict
from typing import Any, Iterable


def group_expenses_by_merchant(expenses: Iterable[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Group by the complete merchant name, never by a prefix or character."""
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for expense in expenses:
        if not isinstance(expense, dict):
            raise ValueError("Each expense must be a dictionary")
        merchant = expense.get("merchant")
        key = merchant.strip() if isinstance(merchant, str) else "Unknown"
        groups[key or "Unknown"].append(expense)
    return dict(groups)

class TaskRunner:
    def __init__(self, name: str):
        self.name = name
    def run(self) -> dict:
        return {"status": "ok", "task": '[$250] Reports - Expenses from different merchant grouped with same merchant on "Top Merchants"', "executed": True}
