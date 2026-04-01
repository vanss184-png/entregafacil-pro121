import { useEffect, useMemo, useState } from "react";

const emailsLiberados = [
  "vans.s184@gmail.com",
  "cliente1@gmail.com",
  "dududeoliveiracosta@gmail.com",
];

const ADICIONAL_AREA_RISCO = 45;
const VALOR_POR_PACOTE = 2.4;
const VALOR_POR_KM = 0.5;

const initialEntries = [
  {
    id: 1,
    data: "2026-03-25",
    pacotes: 100,
    areaRisco: true,
    ganho: 325,
    gasolina: 90,
    manutencao: 0,
    km: 80,
  },
  {
    id: 2,
    data: "2026-03-26",
    pacotes: 90,
    areaRisco: false,
    ganho: 256,
    gasolina: 70,
    manutencao: 20,
    km: 80,
  },
  {
    id: 3,
    data: "2026-03-27",
    pacotes: 120,
    areaRisco: true,
    ganho: 373,
    gasolina: 95,
    manutencao: 0,
    km: 80,
  },
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
  const [aba, setAba] = useState("inicio");

  const [email, setEmail] = useState("");
  const [emailLogado, setEmailLogado] = useState(() => localStorage.getItem("app_email") || "");
  const [erroLogin, setErroLogin] = useState("");

  const [nome, setNome] = useState(() => localStorage.getItem("app_nome") || "");
  const [meta, setMeta] = useState(() => Number(localStorage.getItem("app_meta")) || 5000);

  const [pacotes, setPacotes] = useState("");
  const [gasolina, setGasolina] = useState("");
  const [manutencao, setManutencao] = useState("");
  const [km, setKm] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [areaRisco, setAreaRisco] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");

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

  const ganhoCalculado =
    (areaRisco ? ADICIONAL_AREA_RISCO : 0) +
    Number(pacotes || 0) * VALOR_POR_PACOTE +
    Number(km || 0) * VALOR_POR_KM;

  const enriquecidos = useMemo(() => {
    return lancamentos.map((item) => ({
      ...item,
      lucro: Number(item.ganho) - Number(item.gasolina) - Number(item.manutencao),
      gastos: Number(item.gasolina) + Number(item.manutencao),
    }));
  }, [lancamentos]);

  const filtrados = useMemo(() => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6);
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 29);

    return enriquecidos.filter((item) => {
      const dataItem = new Date(`${item.data}T00:00:00`);

      if (filtroPeriodo === "hoje") return dataItem >= inicioHoje;
      if (filtroPeriodo === "7dias") return dataItem >= seteDiasAtras;
      if (filtroPeriodo === "30dias") return dataItem >= trintaDiasAtras;
      if (filtroPeriodo === "mes") {
        return (
          dataItem.getMonth() === hoje.getMonth() &&
          dataItem.getFullYear() === hoje.getFullYear()
        );
      }

      return true;
    });
  }, [enriquecidos, filtroPeriodo]);

  const totais = useMemo(() => {
    const ganhos = filtrados.reduce((a, i) => a + Number(i.ganho), 0);
    const gastos = filtrados.reduce((a, i) => a + Number(i.gastos), 0);
    const lucro = filtrados.reduce((a, i) => a + Number(i.lucro), 0);
    const kmRodado = filtrados.reduce((a, i) => a + Number(i.km), 0);
    const totalPacotes = filtrados.reduce((a, i) => a + Number(i.pacotes || 0), 0);
    const totalAreaRisco = filtrados.filter((i) => i.areaRisco).length;
    return { ganhos, gastos, lucro, kmRodado, totalPacotes, totalAreaRisco };
  }, [filtrados]);

  const progresso = Math.max(0, Math.min(100, meta ? (totais.lucro / meta) * 100 : 0));

  const maxGrafico = Math.max(
    1,
    ...filtrados.flatMap((i) => [Number(i.ganho), Number(i.gastos), Number(i.lucro)])
  );

  const melhorLancamento = useMemo(() => {
    if (!filtrados.length) return null;
    return [...filtrados].sort((a, b) => b.lucro - a.lucro)[0];
  }, [filtrados]);

  const piorLancamento = useMemo(() => {
    if (!filtrados.length) return null;
    return [...filtrados].sort((a, b) => a.lucro - b.lucro)[0];
  }, [filtrados]);

  const mediaLucro = filtrados.length ? totais.lucro / filtrados.length : 0;

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
      pacotes: Number(pacotes || 0),
      areaRisco,
      ganho: ganhoCalculado,
      gasolina: Number(gasolina || 0),
      manutencao: Number(manutencao || 0),
      km: Number(km || 0),
    };

    setLancamentos((prev) => [novo, ...prev]);
    setPacotes("");
    setGasolina("");
    setManutencao("");
    setKm("");
    setAreaRisco(false);
    setData(new Date().toISOString().slice(0, 10));
    setAba("inicio");
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
            <h2>Modo Shopee com Área de Risco</h2>
            <p>
              {moeda(VALOR_POR_PACOTE)} por pacote + {moeda(VALOR_POR_KM)} por km
              + adicional de {moeda(ADICIONAL_AREA_RISCO)} quando houver área de risco
            </p>
          </div>
          <button className="btn-secondary" onClick={sair}>
            Sair
          </button>
        </div>

        <div className="tabs">
          <button
            className={aba === "inicio" ? "tab active" : "tab"}
            onClick={() => setAba("inicio")}
          >
            Início
          </button>
          <button
            className={aba === "lancar" ? "tab active" : "tab"}
            onClick={() => setAba("lancar")}
          >
            Lançar
          </button>
          <button
            className={aba === "relatorios" ? "tab active" : "tab"}
            onClick={() => setAba("relatorios")}
          >
            Relatórios
          </button>
        </div>

        {aba === "inicio" && (
          <>
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
                <span>Pacotes</span>
                <strong>{totais.totalPacotes}</strong>
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
          </>
        )}

        {aba === "lancar" && (
          <>
            <div className="panel">
              <h2>Novo lançamento Shopee</h2>

              <label>Data</label>
              <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />

              <label>Pacotes entregues</label>
              <input
                className="input"
                type="number"
                placeholder="Digite a quantidade de pacotes"
                value={pacotes}
                onChange={(e) => setPacotes(e.target.value)}
              />

              <label>KM rodado</label>
              <input
                className="input"
                type="number"
                placeholder="Digite o km rodado"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />

              <div className="risk-toggle">
                <label className="risk-label">
                  <input
                    type="checkbox"
                    checked={areaRisco}
                    onChange={(e) => setAreaRisco(e.target.checked)}
                  />
                  <span>Recebe adicional de área de risco</span>
                </label>
              </div>

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

              <div className="calc-preview">
                <div className="calc-row">
                  <span>Pacotes ({pacotes || 0} × {moeda(VALOR_POR_PACOTE)})</span>
                  <strong>{moeda(Number(pacotes || 0) * VALOR_POR_PACOTE)}</strong>
                </div>
                <div className="calc-row">
                  <span>KM ({km || 0} × {moeda(VALOR_POR_KM)})</span>
                  <strong>{moeda(Number(km || 0) * VALOR_POR_KM)}</strong>
                </div>
                <div className="calc-row">
                  <span>Área de risco</span>
                  <strong>{areaRisco ? moeda(ADICIONAL_AREA_RISCO) : moeda(0)}</strong>
                </div>
                <div className="calc-total">
                  <span>Ganho calculado automático</span>
                  <strong>{moeda(ganhoCalculado)}</strong>
                </div>
              </div>

              <button className="btn-primary" onClick={salvarLancamento}>
                Salvar lançamento
              </button>
            </div>

            <div className="panel">
              <h2>Histórico de lançamentos</h2>

              <div className="history-list">
                {lancamentos.map((item) => {
                  const lucro = Number(item.ganho) - Number(item.gasolina) - Number(item.manutencao);

                  return (
                    <div className="history-card" key={item.id}>
                      <div className="history-top">
                        <div>
                          <div className="history-date">{formatarData(item.data)}</div>
                          <div className="history-sub">
                            Pacotes: {item.pacotes || 0} • KM: {item.km} •{" "}
                            {item.areaRisco ? "Área de risco" : "Sem área de risco"}
                          </div>
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
                          <strong>{moeda(lucro)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {aba === "relatorios" && (
          <>
            <div className="panel">
              <h2>Filtro de período</h2>

              <select
                className="input"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="mes">Mês atual</option>
              </select>
            </div>

            <div className="cards-grid">
              <div className="card">
                <span>Lucro do período</span>
                <strong>{moeda(totais.lucro)}</strong>
              </div>
              <div className="card">
                <span>Média por lançamento</span>
                <strong>{moeda(mediaLucro)}</strong>
              </div>
              <div className="card">
                <span>Melhor lucro</span>
                <strong>{melhorLancamento ? moeda(melhorLancamento.lucro) : moeda(0)}</strong>
              </div>
              <div className="card">
                <span>Pior lucro</span>
                <strong>{piorLancamento ? moeda(piorLancamento.lucro) : moeda(0)}</strong>
              </div>
            </div>

            <div className="panel">
              <h2>Gráfico de ganhos x gastos x lucro</h2>
              <div className="mini-chart">
                {filtrados.slice(0, 6).map((item) => (
                  <div className="mini-chart-item" key={item.id}>
                    <div className="bars triple">
                      <div
                        className="bar ganhos"
                        style={{ height: `${(Number(item.ganho) / maxGrafico) * 120}px` }}
                        title={`Ganhos: ${moeda(item.ganho)}`}
                      />
                      <div
                        className="bar gastos"
                        style={{ height: `${(Number(item.gastos) / maxGrafico) * 120}px` }}
                        title={`Gastos: ${moeda(item.gastos)}`}
                      />
                      <div
                        className="bar lucro"
                        style={{ height: `${(Math.max(Number(item.lucro), 0) / maxGrafico) * 120}px` }}
                        title={`Lucro: ${moeda(item.lucro)}`}
                      />
                    </div>
                    <span>{formatarData(item.data).slice(0, 5)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>Resumo do relatório</h2>
              <div className="report-list">
                <div className="report-row">
                  <span>Total de lançamentos</span>
                  <strong>{filtrados.length}</strong>
                </div>
                <div className="report-row">
                  <span>Total de pacotes</span>
                  <strong>{totais.totalPacotes}</strong>
                </div>
                <div className="report-row">
                  <span>Rotas com área de risco</span>
                  <strong>{totais.totalAreaRisco}</strong>
                </div>
                <div className="report-row">
                  <span>Total ganho</span>
                  <strong>{moeda(totais.ganhos)}</strong>
                </div>
                <div className="report-row">
                  <span>Total gasto</span>
                  <strong>{moeda(totais.gastos)}</strong>
                </div>
                <div className="report-row">
                  <span>Lucro líquido</span>
                  <strong>{moeda(totais.lucro)}</strong>
                </div>
                <div className="report-row">
                  <span>Total de km</span>
                  <strong>{totais.kmRodado}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
