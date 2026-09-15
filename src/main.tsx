import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Compte } from './pages/Compte'
import './styles/fonts.css'
import './styles/global.css'
import './styles/sections.css'

/** Une seule page en plus du faire-part : `/compte` (vercel.json la renvoie sur index.html). */
const page = window.location.pathname === '/compte' ? <Compte /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
