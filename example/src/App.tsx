import React from 'react'

import 'lagom-engine/dist/index.css'
import { LagomGameComponent } from 'lagom-engine'
// import { TestGame } from './TestGame'
import { LD47 } from './LD47/LD47'

const App = () => {

  return <LagomGameComponent game={new LD47()}/>
}

export default App
