import {
  Smartphone,
  BookOpen,
  Armchair,
  Shirt,
  Dumbbell,
  ChefHat,
  Sparkles,
  Gamepad2,
  Music,
  Wrench,
  Package,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  BookOpen,
  Armchair,
  Shirt,
  Dumbbell,
  ChefHat,
  Sparkles,
  Gamepad2,
  Music,
  Wrench,
  Package,
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  return ICON_MAP[iconName || 'Package'] || Package;
}
