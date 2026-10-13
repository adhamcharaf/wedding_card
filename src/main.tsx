import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Compte } from './pages/Compte'
import { ListeAdham } from './pages/ListeAdham'
import './styles/fonts.css'
import './styles/global.css'
import './styles/sections.css'

/** Deux pages en plus du faire-part : `/compte` et `/adham` (vercel.json les renvoie sur index.html). */
const chemin = window.location.pathname
const page = chemin === '/compte' ? <Compte /> : chemin === '/adham' ? <ListeAdham /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
