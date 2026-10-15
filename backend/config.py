import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

USE_MOCK_FALLBACK = os.getenv("USE_MOCK_FALLBACK", "True").lower() == "true"
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_IMAGE_API_KEY = os.getenv("GEMINI_IMAGE_API_KEY", "") or GEMINI_API_KEY
EKISPERT_API_KEY = os.getenv("EKISPERT_API_KEY", "")
EKISPERT_MCP_URL = os.getenv("EKISPERT_MCP_URL", "http://localhost:8000")
PORT = int(os.getenv("PORT", "8080"))

def is_live_mode() -> bool:
    """Returns True if globally configured for live mode."""
    return not USE_MOCK_FALLBACK

def is_dlp_live() -> bool:
    """Returns True if DLP should use live mode (not mock and has project ID)."""
    return not USE_MOCK_FALLBACK and bool(GOOGLE_CLOUD_PROJECT)

def is_gemini_live() -> bool:
    """Returns True if Gemini should use live mode (not mock and has API key)."""
    return not USE_MOCK_FALLBACK and bool(GEMINI_API_KEY)

def is_gemini_image_live() -> bool:
    """Returns True if dedicated Image generation model has a valid key."""
    return not USE_MOCK_FALLBACK and bool(GEMINI_IMAGE_API_KEY)

def is_ekispert_live() -> bool:
    """Returns True if Ekispert should use live mode (not mock and has API key)."""
    return not USE_MOCK_FALLBACK and bool(EKISPERT_API_KEY)
