from typing import Callable, Dict, Any, Optional, List
from onyx import connect as onyx_connect
from src.libs.ONXKEYS import ONYXKEYS


class ReportUtils:
    """Handles report utilities and onyx connections - refactored from TypeScript"""

    def __init__(self):
        self._nvpOnboarding: Optional[Dict] = None

    def getOnboardingData(self, report: Dict) -> Optional[Dict]:
        """Get onboarding data for a report"""
        if self._nvpOnboarding:
            return self._nvpOnboarding.get('nvpOnboarding', {})
        return {}

    def connectOnyx(self) -> Callable:
        """Setup the onyx connection for NVP_ONBOARDING"""
        def onboardingCallback(value: Dict) -> None:
            self._nvpOnboarding = value

        onyx_connect(ONYXKEYS.NVP_ONBOARDING, onboardingCallback)
        return onyx_connect

    def hasNvpOnboarding(self) -> bool:
        """Check if NVP_ONBOARDING exists"""
        return self._nvpOnboarding is not None


def report_utils_factory() -> ReportUtils:
    """Factory to create ReportUtils instance"""
    instance = ReportUtils()
    instance.connectOnyx()
    return instance


def report_utils_with_key(key: str = ONYXKEYS.NVP_ONBOARDING) -> ReportUtils:
    """Create ReportUtils with custom onyx key"""
    instance = ReportUtils()
    
    def onboardingCallback(value: Dict) -> None:
        instance._nvpOnboarding = value
    
    onyx_connect(key, onboardingCallback)
    return instance


# Unit test for ReportUtils methods
def test_report_utils_unit():
    """Unit test for ReportUtils methods"""
    utils = report_utils_factory()
    
    # Test getOnboardingData
    assert utils.getOnboardingData({}) == {}
    
    # Trigger onboarding data
    def mock_callback(value):
        utils._nvpOnboarding = value
    
    mock_callback({'nvpOnboarding': True})
    assert utils.getOnboardingData({}) == {'nvpOnboarding': True}
    
    # Test hasNvpOnboarding
    assert utils.hasNvpOnboarding() == True
    
    # Test with key
    utils2 = report_utils_with_key()
    mock_callback({'nvpOnboarding': False})
    assert utils2.getOnboardingData({}) == {'nvpOnboarding': False}
    
    return True


# Functional test
def test_report_utils_functional():
    """Functional test for ReportUtils"""
    from onyx import OnyxConnector
    
    utils = report_utils_factory()
    onyx = OnyxConnector()
    
    # Connect onyx with onboarding data
    onyx_data = onyx.connect(ONYXKEYS.NVP_ONBOARDING)
    
    def update_callback(value):
        utils._nvpOnboarding = value
    
    onyx.connect(ONYXKEYS.NVP_ONBOARDING, update_callback)
    onyx.set(ONYXKEYS.NVP_ONBOARDING, {'nvpOnboarding': 'enabled'})
    
    assert utils.getOnboardingData({}) == {'nvpOnboarding': 'enabled'}
    return True


# QA test
def test_report_utils_qa():
    """QA test for ReportUtils"""
    utils = report_utils_factory()
    
    # Edge cases
    assert utils.getOnboardingData({}) == {}  # Empty report
    assert utils.getOnboardingData({None}) == {}  # None report
    
    # Trigger update
    mock_value = {'nvpOnboarding': 'completed'}
    def update(value):
        utils._nvpOnboarding = value
    
    update(mock_value)
    assert utils.getOnboardingData({}) == mock_value
    
    # Test chaining calls
    assert utils.hasNvpOnboarding() == True
    utils2 = report_utils_with_key()
    update({'nvpOnboarding': 'partial'})
    assert utils2.getOnboardingData({}) == {'nvpOnboarding': 'partial'}
    
    return True


if __name__ == '__main__':
    # Run tests
    print("Running Unit Tests...")
    assert test_report_utils_unit()
    
    print("Running Functional Tests...")
    assert test_report_utils_functional()
    
    print("Running QA Tests...")
    assert test_report_utils_qa()
    
    print("All tests passed!")