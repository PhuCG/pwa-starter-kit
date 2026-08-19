import { RouteSkeleton } from '@/components/ui'
import { Shell } from '@/features/shell/Shell'
import { useAppStore } from '@/store/appStore'
import { Suspense, lazy } from 'react'
import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router'

/**
 * Every page is lazy. The initial bundle is then the shell plus whichever
 * screen was opened — which is what makes the app usable on a mid-range phone
 * over 4G, and it costs nothing but this one `lazy()` per route.
 *
 * `RouteSkeleton` rather than a spinner: the skeleton occupies the space the
 * page is about to take, so nothing jumps when it arrives.
 */
const HomePage = lazy(() => import('@/features/home/HomePage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const OnboardingPage = lazy(() => import('@/features/onboarding/OnboardingPage'))

/**
 * The single gate. Redirect rules live here and nowhere else — a page that
 * bounces the user somewhere from inside its own render is how you end up with
 * two guards disagreeing.
 */
function Guard() {
  const hasCompletedOnboarding = useAppStore((s) => s.profile.hasCompletedOnboarding)
  const location = useLocation()

  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  if (hasCompletedOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />
  }
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Outlet />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <Guard />,
    children: [
      // Outside the shell: a full-screen flow with no bottom nav.
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        element: <Shell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
      // An unknown deep link is almost always a stale bookmark or an old share
      // link, so it goes home rather than to a dead end.
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
