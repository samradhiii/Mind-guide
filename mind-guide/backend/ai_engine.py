from __future__ import annotations

import json
import os
import re
import random
from dataclasses import dataclass
from typing import Dict, List, Optional, Any


@dataclass
class CrisisResult:
    is_crisis: bool
    matched_terms: List[str]


HELPLINES = {
    "IN": {
        "name": "India",
        "numbers": [
            {"label": "AASRA", "value": "+91 22 2754 6669"},
            {"label": "KIRAN (Govt)", "value": "1800-599-0019"},
        ],
    },
    "US": {
        "name": "USA",
        "numbers": [
            {"label": "988 Suicide & Crisis Lifeline", "value": "988"},
        ],
    },
    "UK": {
        "name": "UK",
        "numbers": [
            {"label": "Samaritans", "value": "116 123"},
        ],
    },
}


CRISIS_TERMS = [
    "suicide",
    "kill myself",
    "end it",
    "self harm",
    "self-harm",
    "cut myself",
    "want to die",
    "no reason to live",
    "hurt myself",
    "end my life",
    "take my life",
    "no point anymore",
    "better off dead",
]


MOOD_RULES: List[tuple] = [
    ("burnout", ["burnt out", "burnout", "exhausted", "can't cope", "overwhelmed", "drained", "depleted"]),
    ("anxious", ["anxious", "panic", "worried", "nervous", "restless", "overthinking", "anxiety"]),
    ("stressed", ["stressed", "pressure", "deadline", "tense", "irritated", "frustrated", "stressed out"]),
    ("sad", ["sad", "down", "depressed", "hopeless", "lonely", "cry", "tired of everything", "unhappy", "miserable"]),
    ("happy", ["happy", "grateful", "excited", "good", "great", "proud", "relieved", "amazing", "wonderful"]),
]


QUOTES = [
    "Breathe. This moment will pass.",
    "You don't have to solve everything today.",
    "Small steps still move you forward.",
    "Be as kind to yourself as you would be to a friend.",
    "Progress, not perfection.",
    "It's okay to not be okay.",
    "Every storm runs out of rain.",
    "You are stronger than you think.",
]


def detect_crisis(text: str) -> CrisisResult:
    lowered = text.lower()
    matched = []
    for term in CRISIS_TERMS:
        if term in lowered:
            matched.append(term)
    return CrisisResult(is_crisis=len(matched) > 0, matched_terms=matched)


def detect_mood(text: str) -> str:
    lowered = text.lower()
    for mood, keywords in MOOD_RULES:
        for k in keywords:
            if k in lowered:
                return mood
    if re.search(r"\b(ok|fine|alright|not bad)\b", lowered):
        return "neutral"
    return "neutral"


async def _generate_llm_response(
    user_message: str,
    user_profile: Dict[str, str],
    mood: str,
    chat_history: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    return _fallback_response(mood, user_profile)



def _fallback_response(mood: str, user_profile: Dict) -> Dict[str, Any]:
    name = user_profile.get("name", "friend")
    
    responses = {
        "anxious": f"""{name}, I hear that you're feeling anxious right now. Anxiety can feel overwhelming, but you're not alone in this.

First, let's take a moment together. Close your eyes if you can, and take a slow breath in... and out. Repeat this three times.

When you're ready, I'd love to understand more about what's making you anxious. Is it something specific, like work, relationships, or a decision you need to make? Or does it feel more general, like a cloud that's just there?

Sometimes anxiety thrives on uncertainty. If there's something specific worrying you, let's break it down together. What one small thing could you do right now that would help?""",
        "stressed": f"""Hey {name}, stress can really pile up, can't it? I can hear that you're carrying a lot right now.

Here's something important to remember: stress is your body's way of responding to demands, but it doesn't mean you're failing. It means you're human.

What tends to help me think about stress is breaking it down:
- What's within your control right now?
- What's just noise that you can let go of, at least for today?

Sometimes we stress about things that don't need our immediate attention. Other times, we need to face things head-on but don't know where to start.

What's the one thing that's feeling heaviest right now? Let's talk through it together.""",
        "sad": f"""{name}, I'm really sorry you're feeling this way. Sadness is one of the most human experiences we have, and it deserves to be felt, not pushed away.

You don't have to pretend with me. If you want to talk about what's making you sad, I'm here to listen without judgment.

Sometimes when we're sad, a few things can help ease the weight even just a little:
- Getting some fresh air or sunlight
- Moving your body gently, even just a short walk
- Reaching out to someone who cares about you

But right now, what I want you to know is this: whatever you're going through, this feeling isn't permanent. Feelings move through us like waves. You're not alone.""",
        "burnout": f"""{name}, burnout is real, and it sounds like you've been running on empty for a while. That takes a real toll.

When we're burned out, even small tasks can feel insurmountable. Please know that this isn't a sign of weakness—it's a sign that you've been giving a lot, possibly too much.

Here's what I'd gently suggest:
- Permission to rest: You don't have to be productive every moment. Rest is productive.
- Check in with your basics: Did you eat? Drink water? Sleep?
- Small boundaries: Is there something you can say no to, even just for today?

You've been pushing hard. What would it look like to give yourself some grace right now?""",
        "happy": f"""{name}, I love hearing that you're feeling happy! That's genuinely wonderful.

Happiness is worth noticing and celebrating. Sometimes we're so focused on solving problems that we forget to appreciate the good moments.

What made today feel good? Is there something specific you'd like to share, or just bask in the feeling for a moment?

And hey, these moments are worth holding onto. Even when things are hard, knowing what brings us joy helps us build a life we want to live. What would you like more of in your life?""",
        "neutral": f"""Hey {name}, thanks for checking in. Sometimes life is just... okay. Not great, not terrible. That's totally valid too.

How are you really doing beneath the surface? Is there something specific on your mind, or just looking for someone to talk to?

I'm here for whatever you need—whether that's practical advice, someone to listen, or just a place to vent."""
    }
    
    reply = responses.get(mood, responses["neutral"])
    
    advice_map = {
        "anxious": ["Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s", "Name 5 things you can see, 4 you can touch, 3 you can hear"],
        "stressed": ["Make a quick list of what's in your control", "Take a 5-minute stretch break"],
        "sad": ["Get some sunlight if possible", "Reach out to someone you trust"],
        "burnout": ["Schedule a 20-minute 'nothing' break today", "Protect your sleep tonight"],
        "happy": ["Write down what made today good", "Share the positivity with someone"],
        "neutral": ["What's one small thing you could do today?", "Remember to stay hydrated and rested"],
    }
    
    return {
        "reply": reply,
        "mood": mood,
        "is_crisis": False,
        "helplines": {},
        "advice": advice_map.get(mood, advice_map["neutral"]),
        "quote": random.choice(QUOTES),
        "source": "fallback",
    }


async def generate_counselor_reply(user_message: str, user_profile: Dict) -> Dict[str, Any]:
    crisis = detect_crisis(user_message)
    mood = detect_mood(user_message)
    name = user_profile.get("name", "friend")
    
    if crisis.is_crisis:
        return {
            "mood": mood,
            "is_crisis": True,
            "reply": _build_crisis_response(name, crisis.matched_terms),
            "helplines": HELPLINES,
            "advice": [
                "Your life matters. Please reach out for help.",
                "Call a crisis helpline or go to your nearest emergency room.",
                "If alone, stay on the line with someone you trust.",
                "You're not alone. Support is available right now.",
            ],
            "quote": "You matter. Your feelings are valid. Help is available.",
            "source": "crisis",
        }
    
    return await _generate_llm_response(user_message, user_profile, mood)


def _build_crisis_response(name: str, matched_terms: List[str]) -> str:
    return f"""{name}, I want you to know that I'm deeply concerned about what you just shared. What you're feeling right now is real and valid.

Please hear me: You are not alone. What you're experiencing is a crisis, and you deserve immediate support and care.

Your life has value. Whatever pain you're feeling right now—it can get better. But you need someone to help you through this moment.

Please take one of these steps right now:
1. Call your local emergency number (911 in US, 999 in UK, 112 in EU)
2. Call a crisis helpline—people are ready to listen 24/7
3. Text or call someone you're close to

If you're alone, please stay where you are and reach out. You don't have to face this by yourself.

Is there someone you can call right now? Or would you like me to share the crisis helpline numbers for your country?

You reached out. That took courage. Let's use that courage to get you the help you deserve."""


def _advice_for_mood(mood: str) -> List[str]:
    advice = _fallback_response(mood, {})["advice"]
    return advice


def simulate_future(habits: List[str], months: int, baseline: Dict[str, float]) -> Dict[str, Any]:
    months = max(1, min(months, 12))

    deltas = {
        "better sleep": {"energy": +18, "stress": -15, "focus": +12, "happiness": +10, "health_risk": -12},
        "meditation": {"stress": -20, "focus": +10, "happiness": +12, "energy": +6, "health_risk": -8},
        "exercise": {"energy": +15, "stress": -12, "focus": +8, "happiness": +10, "health_risk": -15},
        "healthy eating": {"energy": +10, "stress": -6, "focus": +6, "happiness": +6, "health_risk": -14},
        "less screen time": {"stress": -10, "focus": +14, "happiness": +7, "energy": +8, "health_risk": -6},
        "quit junk food": {"energy": +9, "stress": -4, "focus": +6, "happiness": +4, "health_risk": -16},
    }

    factor = min(1.0, 0.35 + (months / 12) * 0.65)

    after = dict(baseline)
    chosen = []

    for h in habits:
        key = h.strip().lower()
        if key in deltas:
            chosen.append(key)
            for metric, delta in deltas[key].items():
                after[metric] = after.get(metric, 0) + delta * factor

    def clamp(x: float) -> float:
        return float(max(0, min(100, round(x, 1))))

    for k in ["stress", "focus", "happiness", "energy", "health_risk"]:
        after[k] = clamp(after.get(k, 0))

    before = {k: clamp(baseline.get(k, 0)) for k in ["stress", "focus", "happiness", "energy", "health_risk"]}

    narrative = (
        f"If you continue this lifestyle for {months} months with: {', '.join(chosen) if chosen else 'no habit changes'}, "
        "you'll likely notice steadier energy, better mental clarity, and a calmer baseline. "
        "The biggest gains come from consistency, not perfection."
    )

    return {
        "months": months,
        "habits": chosen,
        "before": before,
        "after": after,
        "narrative": narrative,
    }
