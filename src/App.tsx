import { useState } from "react";
import { RotaryKnob } from "./RotaryKnob";
import { RotaryKnobVertical } from "./RotaryKnobVertical";
import { RotaryKnobBidirectional } from "./RotaryKnobBidirectional";
import { RotaryKnobAngular } from "./RotaryKnobAngular";
import { RotaryKnobGari } from "./RotaryKnobGari";
import { RotaryKnobSafe } from "./RotaryKnobSafe";
import { RotaryKnobTiny } from "./RotaryKnobTiny";
import "./App.css";

function App() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(50);
  const [value4, setValue4] = useState(50);
  const [value5, setValue5] = useState(50);
  const [value6, setValue6] = useState(50);
  const [tinyValues, setTinyValues] = useState([30, 50, 70, 40, 60, 80, 20, 90]);

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
        <p style={{ fontSize: "12px", color: "#888" }}>円周操作（絶対）</p>
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

      <div style={{ textAlign: "center" }}>
        <h3>Angular</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>円周操作（相対）</p>
        <RotaryKnobAngular
          value={value4}
          min={0}
          max={100}
          size={150}
          onChange={setValue4}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value4}</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>Gari</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>接点不良ノイズ付き</p>
        <RotaryKnobGari
          value={value5}
          min={0}
          max={100}
          size={150}
          onChange={setValue5}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value5}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h3>Safe</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>金庫ダイヤル付き</p>
        <RotaryKnobSafe
          value={value6}
          min={0}
          max={100}
          size={200}
          onChange={setValue6}
        />
        <p style={{ fontSize: "24px", fontWeight: "bold", marginTop: "30px" }}>{value6}</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>Tiny</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>めちゃくちゃちっちゃい</p>
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "150px",
          margin: "0 auto"
        }}>
          {tinyValues.map((v, i) => (
            <RotaryKnobTiny
              key={i}
              value={v}
              min={0}
              max={100}
              onChange={(newVal) => {
                const newValues = [...tinyValues];
                newValues[i] = newVal;
                setTinyValues(newValues);
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
          {tinyValues.join(", ")}
        </p>
      </div>
    </div>
  );
}

export default App;
