import React from 'react'

import 'lagom-engine/dist/index.css'
import { LagomGameComponent } from 'lagom-engine'
import { TestGame } from './TestGame'

const App = () => {

  return <LagomGameComponent game={new TestGame()}/>
}

export default App
