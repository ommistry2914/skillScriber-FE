import { useState } from 'react'
import { Button } from './components/ui/button'
import AppRoute from './routes/AppRoute'
import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoute'

function App() {

  return (
    <HashRouter>
      <AppRoutes/>
    </HashRouter>
  )
}

export default App
