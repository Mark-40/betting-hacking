import type { Category, Team } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "innovative",
    label: "Most Innovative",
    tagline: "Boldest idea, freshest tech, biggest 'whoa'.",
    accent: "violet",
  },
  {
    id: "organized",
    label: "Most Organized",
    tagline: "Tightest plan, cleanest execution, zero chaos.",
    accent: "cyan",
  },
  {
    id: "pitch",
    label: "Best Pitch",
    tagline: "Smoothest delivery, sharpest story, sold us in 60s.",
    accent: "magenta",
  },
];

export const TEAMS: Team[] = [
  {
    id: "team-nova",
    name: "Team Nova",
    tagline: "Bending pixels into product.",
    emoji: "🌌",
    members: [
      { name: "Ava Chen", role: "Product / Frontend" },
      { name: "Marcus Reyes", role: "ML Engineer" },
      { name: "Priya Patel", role: "Designer" },
      { name: "Diego Alvarez", role: "Backend" },
    ],
  },
  {
    id: "team-quantum",
    name: "Team Quantum",
    tagline: "Probabilities into products.",
    emoji: "⚛️",
    members: [
      { name: "Jordan Kim", role: "Full Stack" },
      { name: "Sasha Volkov", role: "Data Eng" },
      { name: "Lena Park", role: "PM / UX" },
      { name: "Noah Brooks", role: "DevOps" },
    ],
  },
  {
    id: "team-orbit",
    name: "Team Orbit",
    tagline: "Shipping at escape velocity.",
    emoji: "🛰️",
    members: [
      { name: "Riya Singh", role: "Founder / Eng" },
      { name: "Tomás Herrera", role: "Mobile" },
      { name: "Yuki Tanaka", role: "AI / Research" },
      { name: "Hannah Cole", role: "Growth" },
    ],
  },
];

export const TEAM_IDS = TEAMS.map((t) => t.id);
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}
