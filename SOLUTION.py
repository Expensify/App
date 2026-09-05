from dataclasses import dataclass
from enum import Enum
from typing import Optional, Union

class UserRole(Enum):
    COPILOT = "copilot"
    FULL_COPILOT = "full_copilot"
    REGULAR = "regular"
    ACTING_ON_BEHALF = "acting_on_behalf"

@dataclass
class ThreadAvatarContext:
    """Context determining how to display avatar in thread summary."""
    user_id: str
    user_name: str
    user_role: UserRole
    display_as: Optional[str] = None
    thread_depth: int = 0  # 0 for parent, 1+ for thread comments

    def is_copilot_actor(self) -> bool:
        return self.user_role in [UserRole.COPILOT, UserRole.FULL_COPILOT]

    def get_avatar_type(self) -> str:
        if self.is_copilot_actor():
            return self.display_as or "copilot_avatar"
        return "default_avatar"
    
    def should_show_copilot_name(self) -> bool:
        if self.thread_depth == 0:
            return True  # Parent message always shows copilot
        return False  # Thread summary shows "on behalf of" context

    def get_display_name(self) -> str:
        if self.is_copilot_actor() and self.thread_depth == 0:
            return self.display_as or self.user_name
        return self.user_name

class AvatarDeterminer:
    """Determines correct avatar to display based on thread context."""

    @staticmethod
    def from_thread_context(thread_data: dict) -> ThreadAvatarContext:
        user_id = thread_data.get('user_id', 'default')
        user_name = thread_data.get('user_name', 'Default')
        user_role = thread_data.get('user_role', UserRole.REGULAR)
        thread_depth = thread_data.get('thread_depth', 0)
        
        return ThreadAvatarContext(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            thread_depth=thread_depth
        )

    @staticmethod
    def determine_avatar(data: dict, is_thread_summary: bool = True) -> dict:
        """Determine the correct avatar display for given data."""
        user_data = data.get('user', {})
        thread_depth = data.get('thread_depth', 0)
        
        # Check if user is a copilot acting on behalf of another
        if 'on_behalf_of' in user_data:
            # Thread summary should show copilot avatar with on-behalf context
            return {
                'avatar_type': 'copilot_avatar',
                'display_name': data.get('user_name', 'Adele'),
                'sub_line': f"on behalf of {user_data['on_behalf_of']}",
                'avatar_url': data.get('avatar_url')
            }
        
        # Standard avatar determination
        return {
            'avatar_type': 'standard_avatar',
            'display_name': user_data.get('full_name', user_data.get('username', 'User')),
            'sub_line': None,
            'avatar_url': user_data.get('avatar_url')
        }

class CopilotThreadHelper:
    """Helper for consistent Copilot avatar display across parent and thread messages."""

    def __init__(self, base_user: dict):
        self.user = base_user
        self.copilot_id = base_user.get('copilot_id', '')

    def get_thread_summary_avatar(self, thread_depth: int = 1) -> dict:
        """Get the avatar to display in thread summary."""
        if self.copilot_id and self.user.get('role') == 'full_copilot':
            return {
                'avatar_type': 'copilot_avatar',
                'display_name': self.user.get('full_name', self.copilot_id),
                'sub_line': f"on behalf of {self.user.get('on_behalf_of')}",
                'avatar_url': self.user.get('avatar_url')
            }
        return {
            'avatar_type': 'standard_avatar',
            'display_name': self.user.get('full_name', self.copilot_id),
            'sub_line': None,
            'avatar_url': self.user.get('avatar_url')
        }

    def compare_parent_vs_thread(self, thread_data: dict, parent_data: dict) -> bool:
        """Check if parent and thread avatars are consistent."""
        parent_avatar = parent_data.get('avatar_type', 'standard_avatar')
        thread_avatar = thread_data.get('avatar_type', 'standard_avatar')
        
        # If one is copilot, both should have consistent naming
        if 'copilot' in parent_avatar.lower() and 'copilot' not in thread_avatar.lower():
            return False
        return True

def format_thread_avatar(user: dict, is_thread: bool = True) -> tuple[str, Optional[str]]:
    """Format avatar data for display in thread context."""
    base_name = user.get('full_name', user.get('username', ''))
    on_behalf_of = user.get('on_behalf_of', '')
    
    if on_behalf_of and is_thread:
        formatted_name = f"{base_name} {on_behalf_of}"
    elif on_behalf_of:
        formatted_name = base_name
    else:
        formatted_name = base_name
    
    return ('copilot_avatar' if user.get('role') == 'full_copilot' else 'standard_avatar', formatted_name)

def resolve_copilot_avatars_in_thread(thread_messages: list[dict]) -> list[dict]:
    """Resolve avatar consistency across thread messages."""
    if not thread_messages:
        return thread_messages

    # Find the first (parent) message to determine baseline
    first_message = thread_messages[0] if len(thread_messages) > 1 else thread_messages[0]
    parent_is_copilot = 'full_copilot' in first_message.get('user', {}).get('role', '') or 'copilot' in first_message.get('user', {}).get('role', '')

    for idx, msg in enumerate(thread_messages):
        msg['user']['avatar_type'] = 'copilot_avatar' if parent_is_copilot and msg['is_thread'] else first_message['user']['avatar_type']
        msg['user']['thread_depth'] = idx + 1

        if msg.get('is_thread') and parent_is_copilot and msg.get('user', {}).get('on_behalf_of'):
            msg['user']['sub_line'] = msg['user'].get('sub_line', f"on behalf of {msg['user']['on_behalf_of']}")

        # Ensure consistency
        if msg.get('is_thread') and parent_is_copilot:
            if msg['user']['avatar_type'] == 'standard_avatar' and idx > 0:
                msg['user']['avatar_type'] = 'copilot_avatar'
    
    return thread_messages