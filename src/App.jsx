import { useEffect, useMemo, useState } from "react";

const emailsLiberados = [
  "vans.s184@gmail.com",
  "cliente1@gmail.com",
  "dududeoliveiracosta@gmail.com",
];

const initialEntries = [
  { id: 1, data: "2026-03-25", ganho: 320, gasolina: 90, manutencao: 0, km: 86 },
  { id: 2, data: "2026-03-26", ganho: 280, gasolina: 70, manutencao: 20, km: 74 },
  { id: 3, data: "2026-03-27", ganho: 360, gasolina: 95, manutencao: 0, km: 91 },
];

function moeda(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));
}

function formatarData(data) {
  if (!data) return "";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [emailLogado, setEmailLogado] = useState(() => localStorage.getItem("app_email") || "");
  const [erroLogin, setErroLogin] = useState("");

  const [nome, setNome] = useState(() => localStorage.getItem("app_nome") || "");
  const [meta, setMeta] = useState(() => Number(localStorage.getItem("app_meta")) || 5000);

  const [ganho, setGanho] = useState("");
  const [gasolina, setGasolina] = useState("");
  const [manutencao, setManutencao] = useState("");
  const [km, setKm] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const [lancamentos, setLancamentos] = useState(() => {
    const salvo = localStorage.getItem("app_lancamentos");
    return salvo ? JSON.parse(salvo) : initialEntries;
  });

  useEffect(() => {
    localStorage.setItem("app_lancamentos", JSON.stringify(lancamentos));
  }, [lancamentos]);

  useEffect(() => {
    localStorage.setItem("app_meta", String(meta));
  }, [meta]);

  useEffect(() => {
    localStorage.setItem("app_nome", nome);
  }, [nome]);

  useEffect(() => {
    if (emailLogado) {
      localStorage.setItem("app_email", emailLogado);
    } else {
      localStorage.removeItem("app_email");
    }
  }, [emailLogado]);

  const enriquecidos = useMemo(() => {
    return lancamentos.map((item) => ({
      ...item,
      lucro: Number(item.ganho) - Number(item.gasolina) - Number(item.manutencao),
    }));
  }, [lancamentos]);

  const totais = useMemo(() => {
    const ganhos = enriquecidos.reduce((a, i) => a + Number(i.ganho), 0);
    const gastos = enriquecidos.reduce((a, i) => a + Number(i.gasolina) + Number(i.manutencao), 0);
    const lucro = enriquecidos.reduce((a, i) => a + Number(i.lucro), 0);
    const kmRodado = enriquecidos.reduce((a, i) => a + Number(i.km), 0);
    return { ganhos, gastos, lucro, kmRodado };
  }, [enriquecidos]);

  const progresso = Math.max(0, Math.min(100, meta ? (totais.lucro / meta) * 100 : 0));

  const maxGrafico = Math.max(
    1,
    ...enriquecidos.flatMap((i) => [Number(i.ganho), Number(i.gasolina) + Number(i.manutencao)])
  );

  function entrar() {
    const emailTratado = email.trim().toLowerCase();

    if (!nome.trim()) {
      setErroLogin("Digite seu nome.");
      return;
    }

    if (!emailTratado) {
      setErroLogin("Digite seu e-mail.");
      return;
    }

    if (!emailsLiberados.includes(emailTratado)) {
      setErroLogin("Acesso não liberado para este e-mail.");
      return;
    }

    setEmailLogado(emailTratado);
    setErroLogin("");
  }

  function sair() {
    setEmailLogado("");
    setEmail("");
    setNome("");
  }

  function salvarLancamento() {
    const novo = {
      id: Date.now(),
      data,
      ganho: Number(ganho || 0),
      gasolina: Number(gasolina || 0),
      manutencao: Number(manutencao || 0),
      km: Number(km || 0),
    };

    setLancamentos((prev) => [novo, ...prev]);
    setGanho("");
    setGasolina("");
    setManutencao("");
    setKm("");
    setData(new Date().toISOString().slice(0, 10));
  }

  function excluirLancamento(id) {
    setLancamentos((prev) => prev.filter((item) => item.id !== id));
  }

  if (!emailLogado) {
    return (
      <div className="login-bg">
        <div className="login-card">
          <div className="badge">ENTREGAFÁCIL PRO</div>
          <h1>Tela de acesso</h1>
          <p>Entre com o nome e o e-mail informado na compra.</p>

          <label>Seu nome</label>
          <input
            className="input"
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>E-mail da compra</label>
          <input
            className="input"
            type="email"
            placeholder="seuemail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {erroLogin && <div className="erro-login">{erroLogin}</div>}

          <button className="btn-primary" onClick={entrar}>
            Entrar no app
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
            <h1>Olá, {nome || "Cliente"}</h1>
            <p>{emailLogado}</p>
          </div>
          <div className="hero-icon">🚗</div>
        </div>

        <div className="premium-box">
          <div>
            <h2>Versão Premium</h2>
            <p>Gráficos, histórico e dados salvos automático.</p>
          </div>
          <button className="btn-secondary" onClick={sair}>
            Sair
          </button>
        </div>

        <div className="cards-grid">
          <div className="card">
            <span>Lucro total</span>
            <strong>{moeda(totais.lucro)}</strong>
          </div>
          <div className="card">
            <span>KM rodado</span>
            <strong>{totais.kmRodado}</strong>
          </div>
          <div className="card">
            <span>Ganhos</span>
            <strong>{moeda(totais.ganhos)}</strong>
          </div>
          <div className="card">
            <span>Gastos</span>
            <strong>{moeda(totais.gastos)}</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Meta mensal</h2>

          <label>Nome do usuário</label>
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />

          <label>Meta em reais</label>
          <input
            className="input"
            type="number"
            value={meta}
            onChange={(e) => setMeta(Number(e.target.value || 0))}
          />

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progresso}%` }} />
          </div>

          <div className="meta-row">
            <span>{moeda(totais.lucro)}</span>
            <span>{moeda(meta)}</span>
          </div>
        </div>

        <div className="panel">
          <h2>Gráfico de ganhos x gastos</h2>
          <div className="mini-chart">
            {enriquecidos.slice(0, 6).map((item) => (
              <div className="mini-chart-item" key={item.id}>
                <div className="bars">
                  <div
                    className="bar ganhos"
                    style={{ height: `${(Number(item.ganho) / maxGrafico) * 120}px` }}
                    title={`Ganhos: ${moeda(item.ganho)}`}
                  />
                  <div
                    className="bar gastos"
                    style={{
                      height: `${((Number(item.gasolina) + Number(item.manutencao)) / maxGrafico) * 120}px`,
                    }}
                    title={`Gastos: ${moeda(Number(item.gasolina) + Number(item.manutencao))}`}
                  />
                </div>
                <span>{formatarData(item.data).slice(0, 5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Novo lançamento</h2>

          <label>Data</label>
          <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />

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

          <button className="btn-primary" onClick={salvarLancamento}>
            Salvar lançamento
          </button>
        </div>

        <div className="panel">
          <h2>Histórico de lançamentos</h2>

          <div className="history-list">
            {enriquecidos.map((item) => (
              <div className="history-card" key={item.id}>
                <div className="history-top">
                  <div>
                    <div className="history-date">{formatarData(item.data)}</div>
                    <div className="history-sub">KM: {item.km}</div>
                  </div>
                  <button className="btn-danger" onClick={() => excluirLancamento(item.id)}>
                    Excluir
                  </button>
                </div>

                <div className="history-grid">
                  <div className="mini-box">
                    <span>Ganho</span>
                    <strong>{moeda(item.ganho)}</strong>
                  </div>
                  <div className="mini-box">
                    <span>Gasolina</span>
                    <strong>{moeda(item.gasolina)}</strong>
                  </div>
                  <div className="mini-box">
                    <span>Manutenção</span>
                    <strong>{moeda(item.manutencao)}</strong>
                  </div>
                  <div className="mini-box">
                    <span>Lucro</span>
                    <strong>{moeda(item.lucro)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
