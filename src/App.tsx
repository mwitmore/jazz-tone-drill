import { useEffect, useState } from 'react'
import { DrillScreen } from './components/DrillScreen.tsx'
import { loadSettings, saveSettings } from './drills/settings.ts'
import type { DrillSettings } from './drills/types.ts'

export default function App() {
  const [settings, setSettings] = useState<DrillSettings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
    const themeColor = settings.theme === 'light' ? '#f6f0e4' : '#16130f'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
  }, [settings])

  return <DrillScreen settings={settings} onSettingsChange={setSettings} />
}
