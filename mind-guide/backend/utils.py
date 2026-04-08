import json
import os
import tempfile
from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_parent_dir(file_path: str) -> None:
    parent = os.path.dirname(file_path)
    if parent:
        os.makedirs(parent, exist_ok=True)


def load_json(file_path: str, default: Any) -> Any:
    _ensure_parent_dir(file_path)
    if not os.path.exists(file_path):
        save_json(file_path, default)
        return default

    with open(file_path, "r", encoding="utf-8") as f:
        raw = f.read().strip()
        if not raw:
            return default
        return json.loads(raw)


def save_json(file_path: str, data: Any) -> None:
    _ensure_parent_dir(file_path)

    directory = os.path.dirname(file_path) or "."
    fd, tmp_path = tempfile.mkstemp(prefix=".tmp_", dir=directory)

    try:
        with os.fdopen(fd, "w", encoding="utf-8") as tmp:
            json.dump(data, tmp, ensure_ascii=False, indent=2)
            tmp.write("\n")

        os.replace(tmp_path, file_path)
    finally:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except OSError:
            pass
