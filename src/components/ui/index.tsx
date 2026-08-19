import { type YearMonth, addMonths, monthKey, parseDayKey } from '@/domain/dates'
import type { CSSProperties, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer } from 'vaul'
import { AppIcon } from './icons'
import './ui.css'

export { AppIcon, ICON_REGISTRY } from './icons'

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({
  children,
  elevated = false,
  onClick,
  className = '',
  style,
}: {
  children: ReactNode
  elevated?: boolean
  onClick?: () => void
  className?: string
  style?: CSSProperties
}) {
  const cls = `ui-card ${elevated ? 'ui-card--elevated' : ''} ${onClick ? 'ui-card--tappable' : ''} ${className}`
  if (onClick) {
    return (
      <button type="button" className={cls} style={style} onClick={onClick}>
        {children}
      </button>
    )
  }
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}

export function GradientCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`ui-gradient-card ${className}`} style={style}>
      {children}
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'gradient' | 'outlined' | 'danger' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// ── Progress bar (6px pill standard) ─────────────────────────────────────────

export function ProgressBar({
  value,
  color = 'var(--color-primary)',
  trackColor,
  size = 'md',
}: {
  value: number
  color?: string
  trackColor?: string
  /**
   * `sm` (4px) is for a bar that supports a figure someone is already reading —
   * a full-width 6px rail under a headline number reads as a second headline.
   * The bar carries no information the text beside it does not, so losing 2px
   * of it costs nothing.
   */
  size?: 'md' | 'sm'
}) {
  const clamped = Math.min(Math.max(value, 0), 1)
  return (
    <div
      className={`ui-progress ${size === 'sm' ? 'ui-progress--sm' : ''}`}
      style={trackColor ? { background: trackColor } : undefined}
    >
      <div style={{ width: `${clamped * 100}%`, background: color }} />
    </div>
  )
}

// ── Date field ────────────────────────────────────────────────────────────────

/**
 * A date field that looks the same on every platform.
 *
 * `input[type=date]` is drawn by the OS, and the drawing differs enough to
 * break the layout: on iOS with a Vietnamese locale the value reads
 * "ngày 12 thg 8, 2026", centred, and wider than the box it sits in — the row
 * overflows and the sheet can be dragged sideways. Styling that away means
 * betting on WebKit internals, so the native rendering is not styled at all:
 * the input is laid over the field at zero opacity (still the real control, so
 * a tap still opens the OS picker and the keyboard/a11y story is unchanged),
 * and what the user reads is our own `Intl` text. Absolute positioning also
 * takes the input out of flow, so whatever width the OS wants for it can no
 * longer affect this row.
 */
export function DateField({
  value,
  onChange,
  min,
  max,
  ariaLabel,
  placeholder,
}: {
  /** `yyyy-MM-dd`, or empty when the date is optional and unset. */
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  ariaLabel: string
  /** Shown in place of the date while `value` is empty. */
  placeholder?: string
}) {
  const { i18n } = useTranslation()
  const text = useMemo(() => {
    if (!value) return null
    const { year, month, day } = parseDayKey(value)
    return new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(year, month - 1, day))
  }, [value, i18n.language])

  return (
    <div className="ui-input ui-datefield">
      <span
        className="ui-datefield__text"
        style={text ? undefined : { color: 'var(--color-text-muted)' }}
      >
        {text ?? placeholder}
      </span>
      <AppIcon name="calendar" size={20} color="var(--color-text-muted)" />
      <input
        className="ui-datefield__native"
        type="date"
        value={value}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

// ── Bottom sheet (vaul) ───────────────────────────────────────────────────────

export function Sheet({
  open,
  onOpenChange,
  children,
  ariaTitle,
  footer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  ariaTitle: string
  /**
   * Pinned below the scrolling body — where a sheet's primary action belongs.
   * A form long enough to scroll (most are, on a phone) otherwise hides its own
   * Save button until the user reaches the end, which reads as "there is no way
   * to finish this".
   */
  footer?: ReactNode
}) {
  return (
    // `handleOnly`: by default vaul drags the sheet from anywhere on its
    // content, so a swipe meant to scroll the form — or a slip while tapping a
    // category — drags the whole sheet down and can dismiss it. The grabber is
    // the affordance for that gesture, so it is the only place that starts it.
    // Requires `Drawer.Handle` rather than a plain div: that is what vaul binds
    // the drag to, and it comes with a 44px hit area around the 4px pill.
    // `repositionInputs` off: vaul answers the keyboard by writing an inline
    // `height` and `bottom` onto the drawer, computed against the layout
    // viewport. On iOS that lands the sheet mid-screen with its top clipped and
    // its footer floating above a gap. The same job is done in CSS from the
    // measured viewport insets (`src/pwa/viewportInsets.ts`), which keep the
    // footer sitting on the keyboard and let the body scroll under it.
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false} handleOnly>
      <Drawer.Portal>
        <Drawer.Overlay className="ui-sheet-overlay" />
        <Drawer.Content className="ui-sheet-content">
          <Drawer.Title style={{ display: 'none' }}>{ariaTitle}</Drawer.Title>
          <Drawer.Handle className="ui-sheet-handle" />
          <div className={`ui-sheet-body ${footer ? 'ui-sheet-body--with-footer' : ''}`}>
            {children}
          </div>
          {footer ? <div className="ui-sheet-footer">{footer}</div> : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export function Dialog({
  open,
  title,
  content,
  confirmLabel,
  cancelLabel,
  confirmDanger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  content?: ReactNode
  confirmLabel: string
  cancelLabel: string
  confirmDanger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div
      className="ui-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="ui-dialog" role="dialog" aria-modal="true">
        <div className="text-title-m" style={{ marginBottom: 'var(--sp-md)' }}>
          {title}
        </div>
        {content ? (
          <div
            className="text-body-m"
            style={{ color: 'var(--color-text-sub)', marginBottom: 'var(--sp-xl)' }}
          >
            {content}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 'var(--sp-md)' }}>
          <Button variant="outlined" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmDanger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="ui-empty">
      {icon ? <div className="ui-empty__icon">{icon}</div> : null}
      <div className="text-title-m">{title}</div>
      {subtitle ? (
        <div className="text-body-m" style={{ color: 'var(--color-text-sub)' }}>
          {subtitle}
        </div>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="gradient" onClick={onAction} className="ui-empty__action">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

// ── Month navigator ───────────────────────────────────────────────────────────

/**
 * The `[<] Month YYYY [>]` row. It lives here rather than being copied per page
 * so screens cannot drift in label format, hit-target size or spacing — a user
 * moving between them is operating what reads as one control.
 *
 * `max` disables forward navigation past a month, for a screen where a future
 * month has nothing to show. Backwards is always open.
 */
export function MonthNavigator({
  value,
  onChange,
  max,
}: {
  value: YearMonth
  onChange: (ym: YearMonth) => void
  max?: YearMonth
}) {
  const { i18n } = useTranslation()
  const label = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(
        new Date(value.year, value.month - 1, 1),
      ),
    [value, i18n.language],
  )
  const atMax = max ? monthKey(value) >= monthKey(max) : false

  return (
    <div className="ui-month-nav">
      <MonthNavButton direction="back" onClick={() => onChange(addMonths(value, -1))} />
      <div className="text-title-m ui-month-nav__label">{label}</div>
      <MonthNavButton
        direction="forward"
        disabled={atMax}
        onClick={() => onChange(addMonths(value, 1))}
      />
    </div>
  )
}

function MonthNavButton({
  direction,
  onClick,
  disabled = false,
}: {
  direction: 'back' | 'forward'
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={direction}
      onClick={onClick}
      disabled={disabled}
      className="ui-month-nav__btn"
    >
      <AppIcon name={direction} size={16} />
    </button>
  )
}

// ── Segmented toggle ──────────────────────────────────────────────────────────

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="ui-segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-active={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Half-donut gauge (custom SVG) ────────────────────────────────────────────

export function HalfDonutGauge({
  progress,
  progressColor,
  centerLabel,
  centerValue,
  trackColor = 'var(--color-surface-variant)',
  centerLabelColor = 'var(--color-text-muted)',
  centerValueColor = 'var(--color-text-main)',
}: {
  progress: number
  progressColor: string
  centerLabel: string
  centerValue: string
  trackColor?: string
  centerLabelColor?: string
  centerValueColor?: string
}) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  // Semi-circle: radius 90, stroke 22 (mobile strokeWidth 22), viewBox 240×130
  const r = 90
  const cx = 120
  const cy = 115
  const halfCircumference = Math.PI * r
  return (
    <div style={{ position: 'relative', maxWidth: 280, margin: '0 auto' }}>
      <svg viewBox="0 0 240 130" style={{ width: '100%' }} aria-hidden="true">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={progressColor}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={halfCircumference}
          strokeDashoffset={halfCircumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 4,
          textAlign: 'center',
        }}
      >
        <div className="text-body-s" style={{ color: centerLabelColor }}>
          {centerLabel}
        </div>
        <div className="text-title-l" style={{ color: centerValueColor, fontWeight: 700 }}>
          {centerValue}
        </div>
      </div>
    </div>
  )
}

// ── Toast (SnackbarUtils parity) ─────────────────────────────────────────────

type ToastKind = 'default' | 'success' | 'error'

interface ToastState {
  message: string
  kind: ToastKind
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(
    (message: string, kind: ToastKind = 'default') => {
      if (timer) clearTimeout(timer)
      setToast({ message, kind })
      setTimer(setTimeout(() => setToast(null), 2500))
    },
    [timer],
  )

  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="ui-toast-wrap">
          <div
            className={`ui-toast ${toast.kind !== 'default' ? `ui-toast--${toast.kind}` : ''}`}
            role="status"
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

// ── Gradient text ─────────────────────────────────────────────────────────────

export function GradientText({
  children,
  className = '',
}: { children: ReactNode; className?: string }) {
  return <span className={`ui-gradient-text ${className}`}>{children}</span>
}

// ── Route skeleton ────────────────────────────────────────────────────────────

/** Lazy-route placeholder: a title bar plus a few card-sized blocks. */
export function RouteSkeleton() {
  return (
    <div className="ui-skeleton" aria-hidden="true">
      <div className="ui-skeleton__bar" style={{ height: 28, width: '45%' }} />
      <div className="ui-skeleton__bar" style={{ height: 132 }} />
      <div className="ui-skeleton__bar" style={{ height: 96 }} />
      <div className="ui-skeleton__bar" style={{ height: 96 }} />
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────

/** Small pill for a short annotation next to a field label, e.g. "optional". */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="ui-tag text-label-s">{children}</span>
}
