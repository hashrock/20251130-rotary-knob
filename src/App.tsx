import { useState } from 'react'
import { RotaryKnob } from './RotaryKnob'
import './App.css'

function App() {
  const [value, setValue] = useState(50)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '40px'
    }}>
      <h1>Rotary Knob</h1>
      <RotaryKnob
        value={value}
        min={0}
        max={100}
        size={150}
        onChange={setValue}
      />
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {value}
      </p>
    </div>
  )
}

export default App
