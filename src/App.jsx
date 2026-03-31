import { useMemo, useState } from "react";

export default function App() {
  const [nome, setNome] = useState("diego");
  const [entrou, setEntrou] = useState(true);
  const [ganho, setGanho] = useState("");
  const [gasolina, setGasolina] = useState("");
  const [manutencao, setManutencao] = useState("");
  const [km, setKm] = useState("");

  const lucro = useMemo(() => {
    return Number(ganho || 0) - Number(gasolina || 0) - Number(manutencao || 0);
  }, [ganho, gasolina, manutencao]);

  if (!entrou) {
    return (
      <div className="login-bg">
        <div className="login-card">
          <div className="badge">ENTREGAFÁCIL PRO</div>
          <h1>Controle suas entregas</h1>
          <p>Seu app premium para acompanhar ganhos e gastos.</p>

          <input
            className="input"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <button className="btn-primary" onClick={() => setEntrou(true)}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg">
      <div className="container">
        <div className="hero">
          <div>
            <div className="hero-mini">ENTREGAFÁCIL PRO</div>
            <h1>Olá, {nome}</h1>
            <p>Controle financeiro premium para entregadores</p>
          </div>
          <div className="hero-icon">🚗</div>
        </div>

        <div className="premium-box">
          <div>
            <h2>Versão Premium</h2>
            <p>Libere relatórios, metas e visual profissional.</p>
          </div>
          <button className="btn-secondary">Liberar demonstração</button>
        </div>

        <div className="tabs">
          <button className="tab active">Início</button>
          <button className="tab">Lançar</button>
          <button className="tab">Relatórios</button>
          <button className="tab">Config</button>
        </div>

        <div className="cards-grid">
          <div className="card">
            <span>Lucro atual</span>
            <strong>R$ {lucro.toFixed(2)}</strong>
          </div>
          <div className="card">
            <span>KM rodado</span>
            <strong>{Number(km || 0)}</strong>
          </div>
          <div className="card">
            <span>Ganhos</span>
            <strong>R$ {Number(ganho || 0).toFixed(2)}</strong>
          </div>
          <div className="card">
            <span>Gastos</span>
            <strong>
              R$ {(Number(gasolina || 0) + Number(manutencao || 0)).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="panel">
          <h2>Novo lançamento</h2>

          <label>Ganho</label>
          <input
            className="input"
            type="number"
            placeholder="Digite o ganho"
            value={ganho}
            onChange={(e) => setGanho(e.target.value)}
          />

          <label>Gasolina</label>
          <input
            className="input"
            type="number"
            placeholder="Digite o gasto com gasolina"
            value={gasolina}
            onChange={(e) => setGasolina(e.target.value)}
          />

          <label>Manutenção</label>
          <input
            className="input"
            type="number"
            placeholder="Digite a manutenção"
            value={manutencao}
            onChange={(e) => setManutencao(e.target.value)}
          />

          <label>KM</label>
          <input
            className="input"
            type="number"
            placeholder="Digite o km rodado"
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />

          <button className="btn-primary">Salvar lançamento</button>
        </div>
      </div>
    </div>
  );
}
