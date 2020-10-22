import React from 'react'

import { Entity, ExampleComponent } from 'lagom-engine'
import 'lagom-engine/dist/index.css'

const App = () => {
  let a = new Entity('baanna')
  a.getScene()
  a.getScene()
  return <ExampleComponent text="Create React Library Example WOW 😄"/>
}

export default App
