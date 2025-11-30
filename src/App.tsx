import { useState } from "react";
import { RotaryKnob } from "./RotaryKnob";
import { RotaryKnobVertical } from "./RotaryKnobVertical";
import { RotaryKnobBidirectional } from "./RotaryKnobBidirectional";
import "./App.css";

function App() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(50);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        padding: "40px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h3>Rotary</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>円周操作</p>
        <RotaryKnob
          value={value1}
          min={0}
          max={100}
          size={150}
          onChange={setValue1}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value1}</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>Vertical</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>上下ドラッグ</p>
        <RotaryKnobVertical
          value={value2}
          min={0}
          max={100}
          size={150}
          onChange={setValue2}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value2}</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>Bidirectional</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>上下+左右ドラッグ</p>
        <RotaryKnobBidirectional
          value={value3}
          min={0}
          max={100}
          size={150}
          onChange={setValue3}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value3}</p>
      </div>
    </div>
  );
}

export default App;
