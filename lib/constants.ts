export const MOODS = [
  { value: "happy",       emoji: "😊", label: "Happy",       color: "#92400e", bg: "#fef3c7" },
  { value: "romantic",    emoji: "💕", label: "Romantic",    color: "#9d174d", bg: "#fce7f3" },
  { value: "adventurous", emoji: "🌟", label: "Adventurous", color: "#1e40af", bg: "#dbeafe" },
  { value: "peaceful",    emoji: "🌿", label: "Peaceful",    color: "#065f46", bg: "#d1fae5" },
  { value: "silly",       emoji: "😄", label: "Silly",       color: "#6d28d9", bg: "#ede9fe" },
  { value: "emotional",   emoji: "🥹", label: "Emotional",   color: "#b45309", bg: "#fff7ed" },
] as const;

export const CATEGORIES = [
  "Date Night",
  "Travel",
  "Anniversary",
  "Everyday",
  "Milestone",
  "Other",
] as const;

export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "Date Night":  { color: "#9d174d", bg: "#fce7f3" },
  Travel:        { color: "#1e40af", bg: "#dbeafe" },
  Anniversary:   { color: "#92400e", bg: "#fef3c7" },
  Everyday:      { color: "#065f46", bg: "#d1fae5" },
  Milestone:     { color: "#6d28d9", bg: "#ede9fe" },
  Other:         { color: "#374151", bg: "#f3f4f6" },
};

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]));

export const APP_PIN_KEY = "memories_auth";
export const CHAT_SETTINGS_KEY = "dil_chat_settings";
export const CHAT_HISTORY_KEY = "dil_chat_history";
