import { Config } from '@remotion/cli/config'

// Chromium de l'environnement de rendu, pas de téléchargement par Remotion.
Config.setBrowserExecutable(process.env.CHROME_PATH ?? null)
Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)
