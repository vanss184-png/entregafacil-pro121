import { useEffect, useMemo, useState } from "react";

const initialVehicles = [
  { id: "fiesta", name: "Fiesta Branco" },
  { id: "classic", name: "Classic Preto" },
];

const initialEntries = [
  {
    id: 1,
    date: "2026-03-25",
    vehicle: "Fiesta Branco",
    ganho: 320,
    gasolina: 90,
    manutencao: 0,
    km: 86,
  },
  {
    id: 2,
    date: "2026-03-26",
    vehicle: "Classic Preto",
    ganho: 280,
    gasolina: 70,
    manutencao: 20,
    km: 74,
  },
];

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand-badge">ENTREGAFÁCIL PRO</div>
        <h1 className="login-title">Controle suas entregas</h1>
        <p className="login-subtitle">
          Versão premium compatível, bonita e pronta para publicar.
        </p>

        <input
          className="input"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="primary-btn"
          onClick={() => onLogin({ name: name || "Motorista", email })}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

function KpiCard({ title, value, small }) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className={`kpi-value ${small ? "small" : ""}`}>{value}</div>
    </div>
  );
}

function PremiumBox({ premium, onUnlock }) {
  return (
    <div className="premium-box">
      <div>
        <div className="premium-title">
          {premium ? "Premium liberado" : "Versão Premium"}
        </div>
        <div className="premium-text">
          {premium
            ? "Todos os recursos estão disponíveis."
            : "Libere relatórios, metas e visual profissional."}
        </div>
      </div>

      {!premium && (
        <button className="secondary-btn" onClick={onUnlock}>
          Liberar demonstração
        </button>
      )}
    </div>
  );
}

function MiniBarChart({ data }) {
  const max = Math.max(
    1,
    ...data.flatMap((item) => [item.ganhos || 0, item.gastos || 0])
  );

  return (
    <div className="chart-card">
      <div className="section-title">Ganhos x Gastos</div>
      <div className="mini-chart">
        {data.map((item) => (
          <div className="mini-chart-item" key={item.dia}>
            <div className="bars">
              <div
                className="bar ganhos"
                style={{ height: `${(item.ganhos / max) * 120}px` }}
                title={`Ganhos: ${currency(item.ganhos)}`}
              />
              <div
                className="bar gastos"
                style={{ height: `${(item.gastos / max) * 120}px` }}
                title={`Gastos: ${currency(item.gastos)}`}
              />
            </div>
            <span>{item.dia}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("entregafacil_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [premium, setPremium] = useState(() => {
    return localStorage.getItem("entregafacil_premium") === "true";
  });

  const [activeTab, setActiveTab] = useState("home");

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem("entregafacil_vehicles");
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("entregafacil_entries");
    return saved ? JSON.parse(saved) : initialEntries;
  });

  const [metaMensal, setMetaMensal] = useState(() => {
    const saved = localStorage.getItem("entregafacil_meta");
    return saved ? Number(saved) : 5000;
  });

  const [newVehicle, setNewVehicle] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    vehicle: "Fiesta Branco",
    ganho: "",
    gasolina: "",
    manutencao: "",
    km: "",
  });

  useEffect(() => {
    localStorage.setItem("entregafacil_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("entregafacil_premium", premium ? "true" : "false");
  }, [premium]);

  useEffect(() => {
    localStorage.setItem("entregafacil_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("entregafacil_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("entregafacil_meta", String(metaMensal));
  }, [metaMensal]);

  const enrichedEntries = useMemo(() => {
    return entries.map((entry) => ({
      ...entry,
      lucro:
        Number(entry.ganho) -
        Number(entry.gasolina) -
        Number(entry.manutencao),
    }));
  }, [entries]);

  const totals = useMemo(() => {
    const ganhos = enrichedEntries.reduce((acc, item) => acc + item.ganho, 0);
    const gastos = enrichedEntries.reduce(
      (acc, item) => acc + item.gasolina + item.manutencao,
      0
    );
    const lucro = enrichedEntries.reduce((acc, item) => acc + item.lucro, 0);
    const km = enrichedEntries.reduce((acc, item) => acc + item.km, 0);

    return { ganhos, gastos, lucro, km };
  }, [enrichedEntries]);

  const progress = Math.max(
    0,
    Math.min(100, metaMensal ? (totals.lucro / metaMensal) * 100 : 0)
  );

  const chartData = enrichedEntries.slice(0, 6).map((item) => ({
    dia: formatDate(item.date).slice(0, 5),
    ganhos: item.ganho,
    gastos: item.gasolina + item.manutencao,
  }));

  const addEntry = () => {
    const novo = {
      id: Date.now(),
      date: form.date,
      vehicle: form.vehicle,
      ganho: Number(form.ganho || 0),
      gasolina: Number(form.gasolina || 0),
      manutencao: Number(form.manutencao || 0),
      km: Number(form.km || 0),
    };

    setEntries((prev) => [novo, ...prev]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      vehicle: vehicles[0]?.name || "",
      ganho: "",
      gasolina: "",
      manutencao: "",
      km: "",
    });
    setActiveTab("lancamentos");
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const addVehicle = () => {
    if (!newVehicle.trim()) return;
    setVehicles((prev) => [
      ...prev,
      { id: String(Date.now()), name: newVehicle.trim() },
    ]);
    setNewVehicle("");
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="hero-card">
          <div>
            <div className="hero-mini">ENTREGAFÁCIL PRO</div>
            <h1 className="hero-title">Olá, {user.name}</h1>
            <p className="hero-subtitle">
              Controle financeiro premium para entregadores
            </p>
          </div>
          <div className="hero-icon">🚗</div>
        </header>

        <PremiumBox premium={premium} onUnlock={() => setPremium(true)} />

        <nav className="tab-bar">
          <button
            className={activeTab === "home" ? "tab active" : "tab"}
            onClick={() => setActiveTab("home")}
          >
            Início
          </button>
          <button
            className={activeTab === "lancamentos" ? "tab active" : "tab"}
            onClick={() => setActiveTab("lancamentos")}
          >
            Lançar
          </button>
          <button
            className={activeTab === "relatorios" ? "tab active" : "tab"}
            onClick={() => setActiveTab("relatorios")}
          >
            Relatórios
          </button>
          <button
            className={activeTab === "config" ? "tab active" : "tab"}
            onClick={() => setActiveTab("config")}
          >
            Config
          </button>
        </nav>

        {activeTab === "home" && (
          <div className="section">
            <div className="kpi-grid">
              <KpiCard title="Lucro total" value={currency(totals.lucro)} />
              <KpiCard title="KM rodado" value={String(totals.km)} />
              <KpiCard title="Ganhos" value={currency(totals.ganhos)} small />
              <KpiCard title="Gastos" value={currency(totals.gastos)} small />
            </div>

            <div className="panel">
              <div className="section-title">Meta mensal</div>
              <input
                className="input"
                type="number"
                value={metaMensal}
                onChange={(e) => setMetaMensal(Number(e.target.value || 0))}
              />
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="meta-row">
                <span>{currency(totals.lucro)}</span>
                <span>{currency(metaMensal)}</span>
              </div>
            </div>

            <MiniBarChart data={chartData} />
          </div>
        )}

        {activeTab === "lancamentos" && (
          <div className="section">
            <div className="panel">
              <div className="section-title">Novo lançamento</div>

              <label className="label">Data</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <label className="label">Veículo</label>
              <select
                className="input"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.name}>
                    {vehicle.name}
                  </option>
                ))}
              </select>

              <div className="two-col">
                <div>
                  <label className="label">Ganho</label>
                  <input
                    className="input"
                    type="number"
                    value={form.ganho}
                    onChange={(e) => setForm({ ...form, ganho: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Gasolina</label>
                  <input
                    className="input"
                    type="number"
                    value={form.gasolina}
                    onChange={(e) =>
                      setForm({ ...form, gasolina: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="two-col">
                <div>
                  <label className="label">Manutenção</label>
                  <input
                    className="input"
                    type="number"
                    value={form.manutencao}
                    onChange={(e) =>
                      setForm({ ...form, manutencao: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">KM</label>
                  <input
                    className="input"
                    type="number"
                    value={form.km}
                    onChange={(e) => setForm({ ...form, km: e.target.value })}
                  />
                </div>
              </div>

              <button className="primary-btn" onClick={addEntry}>
                Salvar lançamento
              </button>
            </div>

            <div className="panel">
              <div className="section-title">Lançamentos</div>

              {enrichedEntries.length === 0 ? (
                <p className="muted">Nenhum lançamento ainda.</p>
              ) : (
                <div className="entry-list">
                  {enrichedEntries.map((item) => (
                    <div key={item.id} className="entry-card">
                      <div className="entry-top">
                        <div>
                          <div className="entry-date">{formatDate(item.date)}</div>
                          <div className="entry-vehicle">{item.vehicle}</div>
                        </div>
                        <button
                          className="danger-btn"
                          onClick={() => deleteEntry(item.id)}
                        >
                          Excluir
                        </button>
                      </div>

                      <div className="entry-grid">
                        <div className="mini-box">
                          <span>Ganho</span>
                          <strong>{currency(item.ganho)}</strong>
                        </div>
                        <div className="mini-box">
                          <span>Lucro</span>
                          <strong>{currency(item.lucro)}</strong>
                        </div>
                        <div className="mini-box">
                          <span>Gasolina</span>
                          <strong>{currency(item.gasolina)}</strong>
                        </div>
                        <div className="mini-box">
                          <span>KM</span>
                          <strong>{item.km}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "relatorios" && (
          <div className="section">
            {!premium ? (
              <PremiumBox premium={premium} onUnlock={() => setPremium(true)} />
            ) : (
              <>
                <div className="panel">
                  <div className="section-title">Resumo premium</div>
                  <div className="kpi-grid">
                    <KpiCard
                      title="Lucro por KM"
                      value={currency(totals.km ? totals.lucro / totals.km : 0)}
                    />
                    <KpiCard
                      title="Média por lançamento"
                      value={currency(
                        enrichedEntries.length
                          ? totals.lucro / enrichedEntries.length
                          : 0
                      )}
                    />
                  </div>
                </div>

                <div className="panel">
                  <div className="section-title">Resumo por veículo</div>
                  <div className="vehicle-list">
                    {vehicles.map((vehicle) => {
                      const list = enrichedEntries.filter(
                        (e) => e.vehicle === vehicle.name
                      );
                      const lucro = list.reduce((acc, item) => acc + item.lucro, 0);
                      const km = list.reduce((acc, item) => acc + item.km, 0);

                      return (
                        <div key={vehicle.id} className="vehicle-card">
                          <div>
                            <div className="vehicle-name">{vehicle.name}</div>
                            <div className="vehicle-sub">{km} km rodados</div>
                          </div>
                          <div className="vehicle-profit">{currency(lucro)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="section">
            <div className="panel">
              <div className="section-title">Veículos</div>

              <label className="label">Novo veículo</label>
              <input
                className="input"
                value={newVehicle}
                onChange={(e) => setNewVehicle(e.target.value)}
                placeholder="Ex.: Gol Prata"
              />

              <button className="primary-btn" onClick={addVehicle}>
                Adicionar veículo
              </button>

              <div className="vehicle-list config-space">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vehicle-card">
                    <div>
                      <div className="vehicle-name">{vehicle.name}</div>
                      <div className="vehicle-sub">Disponível para lançamentos</div>
                    </div>
                  </div>
                ))}
             
