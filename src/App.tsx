import { useState } from "react";
import { RotaryKnob } from "./RotaryKnob";
import { RotaryKnobVertical } from "./RotaryKnobVertical";
import { RotaryKnobBidirectional } from "./RotaryKnobBidirectional";
import { RotaryKnobAngular } from "./RotaryKnobAngular";
import { RotaryKnobGari } from "./RotaryKnobGari";
import { RotaryKnobSafe } from "./RotaryKnobSafe";
import { RotaryKnobTiny } from "./RotaryKnobTiny";
import { HSVKnob3D, type HSVColor, hsvToHex } from "./HSVKnob3D";
import { RotaryKnob3D, type Rotation3D } from "./RotaryKnob3D";
import { RotaryKnobMatryoshka } from "./RotaryKnobMatryoshka";
import { RotaryKnobDateTime } from "./RotaryKnobDateTime";
import { RotaryKnobDateTimeSimple } from "./RotaryKnobDateTimeSimple";
import "./App.css";

function App() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(50);
  const [value4, setValue4] = useState(50);
  const [value5, setValue5] = useState(50);
  const [value6, setValue6] = useState(50);
  const [tinyValues, setTinyValues] = useState([30, 50, 70, 40, 60, 80, 20, 90]);
  const [hsvColor, setHsvColor] = useState<HSVColor>({ h: 200, s: 80, v: 90 });
  const [rotation3D, setRotation3D] = useState<Rotation3D>({ x: 20, y: -30, z: 0 });
  const [matryoshkaValues, setMatryoshkaValues] = useState([70, 45, 80, 30]);
  const [dateTime, setDateTime] = useState(new Date());
  const [dateTime2, setDateTime2] = useState(new Date());

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
        <h3>3D Sphere</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>3軸回転（ホイールでZ軸）</p>
        <RotaryKnob3D
          rotation={rotation3D}
          size={200}
          onChange={setRotation3D}
        />
        <p style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>
          X: {Math.round(rotation3D.x)}° Y: {Math.round(rotation3D.y)}° Z: {Math.round(rotation3D.z)}°
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>HSV Color</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>3D球でHSV選択</p>
        <HSVKnob3D
          hsv={hsvColor}
          size={200}
          onChange={setHsvColor}
        />
        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: hsvToHex(hsvColor.h, hsvColor.s, hsvColor.v),
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
          <div style={{ textAlign: "left", fontSize: "12px", color: "#888" }}>
            <div>H: {Math.round(hsvColor.h)}°</div>
            <div>S: {Math.round(hsvColor.s)}%</div>
            <div>V: {Math.round(hsvColor.v)}%</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", fontFamily: "monospace", marginTop: "8px" }}>
          {hsvToHex(hsvColor.h, hsvColor.s, hsvColor.v)}
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>Matryoshka</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>多層ノブ</p>
        <RotaryKnobMatryoshka
          values={matryoshkaValues}
          min={0}
          max={100}
          size={200}
          onChange={setMatryoshkaValues}
        />
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <label style={{ color: "#888", fontSize: "12px" }}>層数:</label>
          <input
            type="number"
            min={1}
            max={8}
            value={matryoshkaValues.length}
            onChange={(e) => {
              const newCount = Math.max(1, Math.min(8, parseInt(e.target.value) || 1));
              if (newCount > matryoshkaValues.length) {
                setMatryoshkaValues([...matryoshkaValues, ...Array(newCount - matryoshkaValues.length).fill(50)]);
              } else if (newCount < matryoshkaValues.length) {
                setMatryoshkaValues(matryoshkaValues.slice(0, newCount));
              }
            }}
            style={{
              width: 50,
              padding: "4px 8px",
              border: "1px solid #555",
              borderRadius: 4,
              background: "#333",
              color: "#fff",
              textAlign: "center",
            }}
          />
        </div>
        <p style={{ fontSize: "12px", color: "#4fc3f7", marginTop: "8px" }}>
          {matryoshkaValues.join(", ")}
        </p>
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

      <div style={{ textAlign: "center" }}>
        <h3>DateTime</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>多スケール日時選択</p>
        <RotaryKnobDateTime
          value={dateTime}
          size={200}
          onChange={setDateTime}
        />
        <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
          内→外: 分・時・日・月・年
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3>DateTime Simple</h3>
        <p style={{ fontSize: "12px", color: "#888" }}>距離でモード切替</p>
        <RotaryKnobDateTimeSimple
          value={dateTime2}
          size={150}
          onChange={setDateTime2}
        />
        <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
          近→遠: 分・時・日・月・年
        </p>
      </div>
    </div>
  );
}

export default App;
