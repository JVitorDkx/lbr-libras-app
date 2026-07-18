from datetime import date, datetime, timedelta

from app.db.models import Player


ANSWER_XP = 25


def xp_threshold_for_level(level_number: int) -> int:
    """Retorna o XP total mínimo do nível (N2=100, N3=250)."""
    level = max(1, level_number)
    return 25 * (level * (level + 1) - 2)


def level_for_xp(xp: int) -> int:
    total_xp = max(0, xp)
    level = 1
    while total_xp >= xp_threshold_for_level(level + 1):
        level += 1
    return level


def level_bounds(xp: int) -> tuple[int, int, int]:
    level = level_for_xp(xp)
    return level, xp_threshold_for_level(level), xp_threshold_for_level(level + 1)


def local_today() -> date:
    return datetime.now().astimezone().date()


def register_daily_activity(player: Player, played_on: date | None = None) -> None:
    today = played_on or local_today()
    previous = player.last_played_date

    if previous is None:
        player.streak_days = max(1, player.streak_days)
    elif previous == today:
        return
    elif previous == today - timedelta(days=1):
        player.streak_days += 1
    else:
        player.streak_days = 1

    player.last_played_date = today
