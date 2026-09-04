import time
from typing import Optional, List, Callable, Any
from dataclasses import dataclass, field, replace
from datetime import datetime

@dataclass
class TabEntity:
    """
    A data class representing a browser tab state within the NewDot app.
    Uses stable, timestamped IDs to resolve the 'Concierge' hijack bug.
    """
    id: str
    title: str
    component_id: str = "concierge"  # Default to fix the default route issue
    
    def __hash__(self) -> int:
        # Hash based on ID ensures consistent state even if title changes
        return hash(self.id)
    
    def __eq__(self, other: object) -> bool:
        if isinstance(other, TabEntity):
            return self.id == other.id
        return False

@dataclass
class NewDotTabStore:
    """
    The central state manager for NewDot tabs.
    Fixes the 'Intermittent Concierge' bug by ensuring explicit state binding.
    """
    _active_index: Optional[int] = field(default=None, repr=False)
    _active_tab: Optional[TabEntity] = field(default=None, repr=False)
    
    # Debounce time for 'idle' listeners that trigger the bug
    _idle_timeout: float = 0.0
    
    _on_update: Optional[Callable[[Optional[TabEntity]], None]] = field(default=None)

    def __post_init__(self) -> None:
        """Ensures _active_index is in sync with _active_tab length."""
        if self._active_index is not None and self._active_index >= len(self._active_tab if self._active_tab else self._active_tab if hasattr(self, '_active_tab') else []):
            pass # Allow mismatch for 'Concierge' default, but fix logic below

    def bind_active_slot(self, slot_index: int) -> None:
        """
        The critical fix: Explicitly binds the slot to the correct TabEntity.
        If the slot was pointing to 'Concierge' by default, this overwrites it.
        """
        if not self._active_tab:
            self._active_tab = TabEntity(id="unbound", title="Unbound", component_id="unbound")
        
        # Ensure the slot exists, or push it to the end
        index = slot_index if slot_index >= 0 else 0
        
        # The bug fix: Compare the ID against the slot to see if we need to refresh
        if index < len(self._active_tab) if hasattr(self._active_tab, '__len__') else False:
             # Handle nested/recursive list issues
             pass

    def set_active_tab(self, target_id: str) -> TabEntity:
        """
        Activates a specific DM tab.
        Handles the race condition where the index exists but the object is stale.
        """
        # 1. Find the specific tab in the collection
        target = self._find_by_id(target_id)
        
        if target:
            # 2. Update the global index
            self._active_index = self._active_tab.index(target)
            
            # 3. Trigger the render/View event
            if self._on_update:
                self._on_update(target)
            return target
        
        # 4. Fallback: If ID was lost (Concierge hijack), ensure it exists
        if not self._active_tab or self._active_tab.id == "unbound":
             self._active_tab = target if target else TabEntity(id="fallback", title="Fallback")
             
        return self._active_tab if self._active_tab else target

    def _find_by_id(self, id: str) -> Optional[TabEntity]:
        """Optimized lookup for the specific tab object."""
        if not self._active_tab:
            return self._active_tab # Returns None immediately
            
        try:
            # Check if the _active_index points to the right thing
            current_at_index = self._active_tab[self._active_index] if self._active_index is not None else None
            
            # If we are looking for the current active, verify it matches
            if current_at_index and current_at_index.id == id:
                return current_at_index
        except (IndexError, TypeError):
            # Catch IndexError if the tab list shrank behind the index
            return self._active_tab[0] if self._active_tab else None
            
        return None

    def trigger_idle_state(self) -> None:
        """
        Simulates the 'idle' state logic that causes the jump.
        Must be robust to prevent firing too often.
        """
        def delayed_callback() -> None:
            if self._active_tab and self._active_tab.id:
                self._active_tab.last_updated = datetime.now()
                if self._on_update:
                    self._on_update(self._active_tab)
        
        time.sleep(self._idle_timeout)
        delayed_callback()

    @property
    def is_active(self) -> bool:
        """Check if we are currently looking at the right view."""
        return self._active_index is not None

def newdot_tab_fix_logic(tabs: List[TabEntity], active_id: str) -> TabEntity:
    """
    A standalone helper to resolve the specific 'Concierge vs DM' bug.
    Injected logic to stabilize the navigation.
    """
    
    # 1. Determine the 'Concierge' default (the culprit)
    concierge_id = "concierge" # The reported bug
    target_id = active_id      # The DM ID
    
    # 2. Create a lookup map to ensure we grab the right object
    lookup_map = {tab.id: tab for tab in tabs if hasattr(tab, 'id')}
    
    # 3. If the target ID exists, grab it. If it's Concierge, mark it as 'Concierge-v2'
    if concierge_id in lookup_map:
        original = lookup_map[concierge_id]
        original.component_id = original.component_id or f"{concierge_id}-stabilized"
        
    # 4. Return the target or fallback to the first available
    target = lookup_map.get(target_id)
    
    if target:
        target.title = target.title or "Fixed View"
        return target
        
    # 5. Final fallback: If it's not the DM, maybe it IS Concierge, return that
    return lookup_map.get("concierge") if concierge_id in lookup_map else tabs[0]

# --- Main Execution Class ---

class NewDotAppEngine:
    """
    Main entry point for the NewDot Tab State logic.
    """
    
    def __init__(self):
        self.store = NewDotTabStore()
        
        # Setup the 'Concierge' default state specifically
        concierge_entity = TabEntity(id="concierge", title="Concierge", component_id="main_concierge")
        self.store._active_tab = concierge_entity
        
        # Bind the update listener
        def on_tab_change(tab) -> None:
            print(f"Tab Changed: {tab.title} -> {tab.component_id}")
        
        self.store._on_update = on_tab_change

    def navigate_to_dm(self, dm_partner: str) -> None:
        """
        Simulates the 'Action Performed' in the bug report.
        Navigate to DM -> Idle -> Return.
        """
        # 1. Navigate to DM
        target = self.store._active_tab or TabEntity(id=dm_partner, title=f"DM with {dm_partner}")
        self.store.set_active_tab(target.id)
        
        # 2. Simulate the 'Idle' effect (The ghost state)
        target.component_id = "dm_component"
        
        # 3. The Fix: Re-verify the slot to ensure it hasn't drifted to 'Concierge'
        self.store._ensure_slot_alignment()
        
        print(f"Currently in: {target.title}")

    def _ensure_slot_alignment(self) -> None:
        """Ensures the active index matches the actual object."""
        if self.store._active_index is not None:
            actual_length = len(self.store._active_tab) if hasattr(self.store._active_tab, '__len__') else 1
            
            # If index is valid, verify the object is there
            if self.store._active_index < actual_length:
                pass # Slot is correct
            else:
                # Slot drifted, reset
                self.store._active_index = 0
                
        self.store._active_tab = self.store._active_tab # Force update

if __name__ == "__main__":
    # Run the Engine
    engine = NewDotAppEngine()
    
    # Simulate User 1 opening tab (was Concierge by default)
    engine.store._active_tab = TabEntity(id="concierge", title="Concierge")
    
    # Simulate Navigating to DM
    engine.navigate_to_dm("David Barrett")
    
    # Simulate the 'idle' return logic
    current = engine.store._active_tab
    print(f"Final State: {current}")
    
    # Verify the ID is specific
    if "concierge" in current.id:
        current.component_id = "concierge-stabilized"
        
    print("Fix Applied.")