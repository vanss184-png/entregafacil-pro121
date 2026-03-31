import { useState } from "react";

export default function App() {
  const [ganhos, setGanhos] = useState(0);
  const [gastos, setGastos] = useState(0);

  const lucro = ganhos - gastos;

  return (
    <div style={{
      fontFamily: "Arial",
      background: "#f5f5f5",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h1>EntregaFácil PRO</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Ganhos"
          onChange={(e) => setGanhos(Number(e.target.value))}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <input
          type="number"
          placeholder="Gastos"
          onChange={(e) => setGastos(Number(e.target.value))}
          style={{ padding: "10px" }}
        />
      </div>

      <h2>Lucro: R$ {lucro}</h2>
    </div>
  );
}
