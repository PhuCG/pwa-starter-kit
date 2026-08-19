import {
  Add01Icon,
  Alert01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar01Icon,
  Cancel01Icon,
  ChartHistogramIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Delete01Icon,
  Download01Icon,
  DragDropVerticalIcon,
  Edit01Icon,
  FavouriteIcon,
  Home01Icon,
  InformationCircleIcon,
  LanguageSkillIcon,
  MoreHorizontalCircle01Icon,
  PinIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  SparklesIcon,
  StarIcon,
  StickyNote01Icon,
  Upload01Icon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

/**
 * The icon registry — the only place an icon enters the app.
 *
 * Two rules, both from CLAUDE.md rule 1:
 *
 * - **No emoji and no text glyphs (✕ ✓ ★ →) anywhere in the UI.** They render
 *   differently on every platform, they cannot be recoloured with a token, and
 *   they read as unfinished.
 * - **Every icon is referenced by a semantic key, not by its HugeIcons name.**
 *   `<AppIcon name="delete" />`, never `<HugeiconsIcon icon={Delete01Icon} />`.
 *   Swapping icon sets then means editing this map and nothing else.
 *
 * Add a key when a screen needs one. Keep the key describing the *meaning*
 * (`pin`, `back`) rather than the picture (`thumbtack`, `chevronLeft`).
 */
export const ICON_REGISTRY: Record<string, IconSvgElement> = {
  // Navigation
  home: Home01Icon,
  back: ArrowLeft01Icon,
  forward: ArrowRight01Icon,
  arrowUp: ArrowUp01Icon,
  arrowDown: ArrowDown01Icon,
  settings: Settings01Icon,
  // Actions
  add: Add01Icon,
  plus: PlusSignIcon,
  edit: Edit01Icon,
  delete: Delete01Icon,
  cancel: Cancel01Icon,
  search: Search01Icon,
  pin: PinIcon,
  download: Download01Icon,
  upload: Upload01Icon,
  dragHandle: DragDropVerticalIcon,
  // Status & feedback
  info: InformationCircleIcon,
  alert: Alert01Icon,
  checkCircle: CheckmarkCircle01Icon,
  eye: ViewIcon,
  eyeOff: ViewOffIcon,
  // Content
  note: StickyNote01Icon,
  calendar: Calendar01Icon,
  clock: Clock01Icon,
  chart: ChartHistogramIcon,
  star: StarIcon,
  favourite: FavouriteIcon,
  sparkles: SparklesIcon,
  language: LanguageSkillIcon,
  more: MoreHorizontalCircle01Icon,
}

export interface AppIconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

/**
 * HugeIcon wrapper with a safe fallback for unknown keys — a typo shows a
 * neutral glyph instead of crashing the screen it is on.
 */
export function AppIcon({ name, size = 22, color, strokeWidth = 1.8, className }: AppIconProps) {
  const icon = ICON_REGISTRY[name] ?? MoreHorizontalCircle01Icon
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? 'currentColor'}
      strokeWidth={strokeWidth}
      className={className}
    />
  )
}
