import { APP } from '@/app.config'
import { Button, GradientText } from '@/components/ui'
import { isNonBlank } from '@/domain/constraints'
import { useAppStore } from '@/store/appStore'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * First run. One step here, but the shape is what matters: onboarding is
 * OUTSIDE the shell (no bottom nav to escape through) and the only thing that
 * lets the user past it is `completeOnboarding`, which is also the flag
 * `routes.tsx` guards on. Keep those two facts together and the flow cannot be
 * skipped by deep-linking.
 */
export default function OnboardingPage() {
  const { t } = useTranslation()
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const [name, setName] = useState('')

  return (
    <div className="page page--stack" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="text-headline-m">
          <GradientText>{APP.name}</GradientText>
        </div>
        <div
          className="text-body-m"
          style={{ color: 'var(--color-text-sub)', marginTop: 'var(--sp-sm)' }}
        >
          {t('onboardingSubtitle')}
        </div>

        <label
          className="text-label-m"
          htmlFor="onboarding-name"
          style={{ display: 'block', marginTop: 'var(--sp-xxxl)' }}
        >
          {t('onboardingNameLabel')}
        </label>
        <input
          id="onboarding-name"
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('onboardingNamePlaceholder')}
          style={{ marginTop: 'var(--sp-xs)' }}
        />
      </div>

      <Button
        variant="gradient"
        disabled={!isNonBlank(name)}
        onClick={() => completeOnboarding(name)}
      >
        {t('onboardingStart')}
      </Button>
    </div>
  )
}
