VALID_TRANSITIONS = {
    "created": ["video_uploaded"],
    "video_uploaded": ["analyzing"],
    "analyzing": ["analysis_completed", "failed"],
    "analysis_completed": ["approved", "failed"],
    "approved": [],
    "failed": [],
}

def validate_transition(current_status: str, target_status: str) -> bool:
    """Validate if a status transition is allowed."""
    if current_status not in VALID_TRANSITIONS:
        raise ValueError(f"Invalid current status: {current_status}")
    
    allowed_transitions = VALID_TRANSITIONS.get(current_status, [])
    
    if target_status not in allowed_transitions:
        raise ValueError(
            f"Invalid transition from '{current_status}' to '{target_status}'. "
            f"Allowed transitions: {allowed_transitions}"
        )
    
    return True