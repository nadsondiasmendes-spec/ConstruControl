import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Package, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Briefcase, 
  TrendingUp, 
  Calculator, 
  AlertTriangle, 
  Database, 
  CheckCircle, 
  Layers,
  FileText,
  User,
  Calendar,
  Sparkles,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Wallet,
  Home
} from 'lucide-react';

// Chaves para inicialização de dados simulados padrão (focando em Caixa Geral)
const INITIAL_WORKS = [
  { id: '1', nome: 'Residencial Bella Vista', cliente: 'Carlos Silva', tipo: 'Construção para Venda', percentAdm: 0, status: 'Finalizada e Vendida', valorVenda: 450000, valorDisponibilizado: 0, valorRecebido: 150000 },
  { id: '2', nome: 'Edifício San Lorenzo', cliente: 'MCMV Incorporações', tipo: 'Minha Casa, Minha Vida', percentAdm: 0, status: 'Em Andamento', valorVenda: 0, valorDisponibilizado: 320000, valorRecebido: 50000 },
  { id: '3', nome: 'Reforma Casa Lagoa', cliente: 'Mariana Costa', tipo: 'Administração de Obra', percentAdm: 12, status: 'Em Andamento', valorVenda: 0, valorDisponibilizado: 0, valorRecebido: 10000 }
];

const INITIAL_STOCK = [
  { id: 's1', item: 'Saco de Cimento Mauá 50kg', quant: 120, quantMinima: 30, precoUnit: 42.50 },
  { id: 's2', item: 'Tijolo Cerâmico 8 Furos (Milheiro)', quant: 15, quantMinima: 5, precoUnit: 850.00 },
  { id: 's3', item: 'Vergalhão CA-50 3/8"', quant: 85, quantMinima: 20, precoUnit: 58.00 },
  { id: 's4', item: 'Fio Flexível 2,5mm (Rolo 100m)', quant: 8, quantMinima: 10, precoUnit: 145.00 }
];

const INITIAL_EXPENSES = [
  // Despesas diretas de Obras
  { id: 'e1', obraId: '1', data: '2026-06-15', descricao: 'Materiais básicos para alvenaria', tipo: 'Materiais Internos', valor: 110000, detalhe: 'Compra direta de cimento e tijolos estruturais' },
  { id: 'e2', obraId: '2', data: '2026-06-18', descricao: 'Aluguel de Betoneira 15 dias', tipo: 'Aluguel de Ferramentas/Maquinários', valor: 650, detalhe: 'Maquinário LocaMax' },
  { id: 'e3', obraId: '3', data: '2026-06-20', descricao: 'Pagamento Equipe Fundação', tipo: 'Mão de Obra', valor: 2850, detalhe: '2 Pedreiros (R$150/dia) e 3 Ajudantes (R$120/dia) por 5 dias' },
  // Despesas Gerais / Administrativas (Não vinculadas a obras específicas)
  { id: 'e5', obraId: 'caixa_geral', data: '2026-06-21', descricao: 'Pró-labore Mensal do Sócio', tipo: 'Retirada de Pró-labore', valor: 5000, detalhe: 'Retirada mensal pró-labore de diretoria' },
  { id: 'e6', obraId: 'caixa_geral', data: '2026-06-22', descricao: 'Aluguel de escritório administrativo', tipo: 'Administrativo / Escritório', valor: 1200, detalhe: 'Escritório central Salinas' }
];

const INITIAL_RECEIPTS = [
  // Aporte inicial de caixa da empresa (sem obra)
  { id: 'r0', obraId: 'caixa_geral', data: '2026-06-01', valor: 180000, descricao: 'Aporte Inicial de Capital do Sócio para Giro' },
  // Entradas de Obras
  { id: 'r1', obraId: '2', data: '2026-06-10', valor: 50000, descricao: 'Liberação da 1ª Medição Caixa' },
  { id: 'r2', obraId: '2', data: '2026-06-22', valor: 45000, descricao: 'Medição da Fundação aprovada' },
  { id: 'r3', obraId: '3', data: '2026-06-05', valor: 8000, descricao: 'Sinal de início da Taxa de Administração' },
  // Entrada parcelada da venda da Obra 1 (Sinal de R$150k já está no valorRecebido da obra, mais parcelas abaixo)
  { id: 'r4', obraId: '1', data: '2026-06-18', valor: 200000, descricao: 'Segunda parcela do pagamento da venda' },
  { id: 'r5', obraId: '1', data: '2026-06-22', valor: 100000, descricao: 'Última parcela - Quitação total do imóvel' }
];

export default function App() {
  // --- Estados do Sistema ---
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'obras', 'financeiro', 'estoque', 'config'
  const [financeSubTab, setFinanceSubTab] = useState('saidas'); // 'saidas' (Despesas), 'entradas' (Recebimentos)
  
  const [obras, setObras] = useState(() => {
    const local = localStorage.getItem('obras_data');
    return local ? JSON.parse(local) : INITIAL_WORKS;
  });
  const [estoque, setEstoque] = useState(() => {
    const local = localStorage.getItem('estoque_data');
    return local ? JSON.parse(local) : INITIAL_STOCK;
  });
  const [despesas, setDespesas] = useState(() => {
    const local = localStorage.getItem('despesas_data');
    return local ? JSON.parse(local) : INITIAL_EXPENSES;
  });
  const [recebimentos, setRecebimentos] = useState(() => {
    const local = localStorage.getItem('recebimentos_data');
    return local ? JSON.parse(local) : INITIAL_RECEIPTS;
  });

  // --- Modais e Formulários de Edição ---
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);

  // Estados de Cadastro/Edição de Obra
  const [editingObraId, setEditingObraId] = useState(null);
  const [obraNome, setObraNome] = useState('');
  const [obraCliente, setObraCliente] = useState('');
  const [obraTipo, setObraTipo] = useState('Construção para Venda');
  const [obraPercentAdm, setObraPercentAdm] = useState(0);
  const [obraValorDisponibilizado, setObraValorDisponibilizado] = useState(0); // MCMV total
  const [obraValorVenda, setObraValorVenda] = useState(0); // Construção para Venda preço final
  const [obraValorRecebido, setObraValorRecebido] = useState(0); // Sinal / Aporte inicial

  const [obraStatus, setObraStatus] = useState('Em Andamento');

  // Estados de Cadastro/Edição de Estoque
  const [editingEstoqueId, setEditingEstoqueId] = useState(null);
  const [stockItemName, setStockItemName] = useState('');
  const [stockItemQuant, setStockItemQuant] = useState(0);
  const [stockItemMin, setStockItemMin] = useState(0);
  const [stockItemPreco, setStockItemPreco] = useState(0);

  // Estados de Cadastro/Edição de Despesas
  const [editingDespesaId, setEditingDespesaId] = useState(null);
  const [despesaObraId, setDespesaObraId] = useState('');
  const [despesaData, setDespesaData] = useState(new Date().toISOString().split('T')[0]);
  const [despesaDescricao, setDespesaDescricao] = useState('');
  const [despesaTipo, setDespesaTipo] = useState('Materiais Internos');
  const [despesaValorManual, setDespesaValorManual] = useState(0);
  
  // Detalhes específicos de Despesa de Estoque
  const [selectedStockItemId, setSelectedStockItemId] = useState('');
  const [stockUseQuantity, setStockUseQuantity] = useState(1);

  // Detalhes de Mão de Obra (Calculadora de Diárias)
  const [qtdPedreiro, setQtdPedreiro] = useState(1);
  const [diariaPedreiro, setDiariaPedreiro] = useState(180);
  const [qtdAjudante, setQtdAjudante] = useState(1);
  const [diariaAjudante, setDiariaAjudante] = useState(120);
  const [diasTrabalhados, setDiasTrabalhados] = useState(1);

  // Detalhes de Documentação
  const [docTipoSugerido, setDocTipoSugerido] = useState('Alvará');

  // Estados de Lançamento de Recebimentos
  const [editingReceiptId, setEditingReceiptId] = useState(null);
  const [receiptObraId, setReceiptObraId] = useState('');
  const [receiptData, setReceiptData] = useState(new Date().toISOString().split('T')[0]);
  const [receiptValor, setReceiptValor] = useState(0);
  const [receiptDescricao, setReceiptDescricao] = useState('');

  // Filtro de Obra Ativa no Financeiro
  const [selectedObraFilter, setSelectedObraFilter] = useState('todas');
const getClienteId = () => {
  const host = window.location.hostname;
  
  // Aqui você define qual ID pertence a qual domínio/URL
  if (host.includes("cliente1-obra.vercel.app")) return "ID_DA_PLANILHA_DO_CLIENTE_1";
  if (host.includes("cliente2-obra.vercel.app")) return "ID_DA_PLANILHA_DO_CLIENTE_2";
  if (host.includes("cliente3-obra.vercel.app")) return "ID_DA_PLANILHA_DO_CLIENTE_3";
  if (host.includes("cliente4-obra.vercel.app")) return "ID_DA_PLANILHA_DO_CLIENTE_4";
  if (host.includes("localhost")) return "ID_DA_SUA_PLANILHA_DE_TESTE";
  
  return null; // Caso não encontre nenhum (ambiente de dev local)
};

const syncToSheets = async (tabela, dados) => {
  const clienteId = getClienteId(); // Agora ele busca pela URL
  const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw1x3eJZi0C2kUP6yCwWDXNLbJ3ArBXnwyU5UPYU9MvJW9J1gThEztmCDE8nCoYsPhq/exec";

  if (!clienteId) {
    console.warn("Ambiente não identificado, sincronização ignorada.");
    return;
  }

  try {
    await fetch(URL_WEB_APP, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        clienteId: clienteId, 
        tabela: tabela, 
        dados: dados 
      })
    });
  } catch (erro) {
    console.error("Erro na sincronização:", erro);
  }
};
  // Salvar no localStorage sempre que mudar
 useEffect(() => {
  localStorage.setItem('obras_data', JSON.stringify(obras));
  syncToSheets('obras', obras); // <--- ADICIONE ESTA LINHA
}, [obras]);

  useEffect(() => {
  localStorage.setItem('estoque_data', JSON.stringify(estoque));
  syncToSheets('estoque', estoque); // <--- ADICIONE ESTA LINHA
}, [estoque]);

  useEffect(() => {
  localStorage.setItem('despesas_data', JSON.stringify(despesas));
  syncToSheets('despesas', despesas); // <--- ADICIONE ESTA LINHA
}, [despesas]);

 useEffect(() => {
  localStorage.setItem('recebimentos_data', JSON.stringify(recebimentos));
  syncToSheets('recebimentos', recebimentos); // <--- ADICIONE ESTA LINHA
}, [recebimentos]);

  // --- Cálculos Financeiros Gerais por Obra ---
  const calcularMetricasDeObra = (obraId) => {
    const obra = obras.find(o => o.id === obraId);
    if (!obra) return { recebido: 0, custo: 0, lucro: 0, faltaReceber: 0, percentRecebido: 0, quitada: false };

    // Despesas vinculadas a esta obra
    const despesasDaObra = despesas.filter(d => d.obraId === obraId);
    const custoTotal = despesasDaObra.reduce((acc, d) => acc + d.valor, 0);

    // Recebimentos vinculados a esta obra
    const recebimentosDaObra = recebimentos.filter(r => r.obraId === obraId);
    const totalRecebimentosLancados = recebimentosDaObra.reduce((acc, r) => acc + r.valor, 0);

    // Total recebido real (Valor inicial/Sinal + parcelas de recebimento lançadas)
    const recebidoTotal = (obra.valorRecebido || 0) + totalRecebimentosLancados;

    let lucro = 0;
    let faltaReceber = 0;
    let percentRecebido = 0;
    let quitada = false;

    if (obra.tipo === 'Construção para Venda') {
      if (obra.status === 'Finalizada e Vendida') {
        // Lucro final esperado
        lucro = (obra.valorVenda || 0) - custoTotal;
        // Quanto resta receber do valor total da venda
        faltaReceber = Math.max(0, (obra.valorVenda || 0) - recebidoTotal);
        percentRecebido = obra.valorVenda > 0 ? (recebidoTotal / obra.valorVenda) * 100 : 0;
        quitada = faltaReceber <= 0;
      } else {
        // Enquanto em andamento, o lucro é temporariamente negativo (investimento de capital)
        lucro = -custoTotal;
        faltaReceber = 0;
        percentRecebido = 0;
      }
    } else if (obra.tipo === 'Minha Casa, Minha Vida') {
      lucro = recebidoTotal - custoTotal;
      faltaReceber = Math.max(0, (obra.valorDisponibilizado || 0) - recebidoTotal);
      percentRecebido = obra.valorDisponibilizado > 0 ? (recebidoTotal / obra.valorDisponibilizado) * 100 : 0;
      quitada = faltaReceber <= 0;
    } else {
      // Administração de obra (recebe as taxas administrativas sobre o custo da obra)
      lucro = recebidoTotal - custoTotal;
      faltaReceber = 0;
      percentRecebido = 0;
    }

    return {
      recebido: recebidoTotal,
      custo: custoTotal,
      lucro,
      faltaReceber,
      percentRecebido,
      quitada
    };
  };

  // --- Balanço do Caixa Geral da Empresa ---
  const calcularCaixaEmpresa = () => {
    // 1. Entradas Reais (Apenas o dinheiro que de fato entrou em caixa através de lançamentos ou sinal)
    const totalRecebidosLancados = recebimentos.reduce((acc, r) => acc + r.valor, 0);
    const totalSinalAportadoObras = obras.reduce((acc, o) => acc + (o.valorRecebido || 0), 0);
    
    // Faturamento bruto real arrecadado
    const faturamentoBruto = totalRecebidosLancados + totalSinalAportadoObras;

    // 2. Saídas Reais (Todas as despesas)
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);

    // Saldo atual em conta
    const saldoCaixaAtual = faturamentoBruto - totalDespesas;

    // Detalhando despesas
    const despesasApenasDeObras = despesas.filter(d => d.obraId !== 'caixa_geral').reduce((acc, d) => acc + d.valor, 0);
    const despesasApenasDeGeral = despesas.filter(d => d.obraId === 'caixa_geral').reduce((acc, d) => acc + d.valor, 0);

    return {
      saldoCaixaAtual,
      faturamentoBruto,
      totalDespesas,
      despesasApenasDeObras,
      despesasApenasDeGeral
    };
  };

  // --- Ações de Obra ---
  const handleSaveObra = (e) => {
    e.preventDefault();
    if (editingObraId) {
      setObras(prev => prev.map(o => o.id === editingObraId ? {
        ...o,
        nome: obraNome,
        cliente: obraCliente,
        tipo: obraTipo,
        percentAdm: obraTipo === 'Administração de Obra' ? Number(obraPercentAdm) : 0,
        valorDisponibilizado: obraTipo === 'Minha Casa, Minha Vida' ? Number(obraValorDisponibilizado) : 0,
        valorVenda: obraTipo === 'Construção para Venda' && obraStatus === 'Finalizada e Vendida' ? Number(obraValorVenda) : 0,
        valorRecebido: Number(obraValorRecebido), // Sinal / Aporte inicial
        status: obraStatus
      } : o));
    } else {
      const novaObra = {
        id: Date.now().toString(),
        nome: obraNome,
        cliente: obraCliente,
        tipo: obraTipo,
        percentAdm: obraTipo === 'Administração de Obra' ? Number(obraPercentAdm) : 0,
        valorDisponibilizado: obraTipo === 'Minha Casa, Minha Vida' ? Number(obraValorDisponibilizado) : 0,
        valorVenda: obraTipo === 'Construção para Venda' && obraStatus === 'Finalizada e Vendida' ? Number(obraValorVenda) : 0,
        valorRecebido: Number(obraValorRecebido), // Sinal / Aporte inicial
        status: obraStatus
      };
      setObras(prev => [...prev, novaObra]);
    }
    closeObraModal();
  };

  const openEditObra = (obra) => {
    setEditingObraId(obra.id);
    setObraNome(obra.nome);
    setObraCliente(obra.cliente);
    setObraTipo(obra.tipo);
    setObraPercentAdm(obra.percentAdm || 0);
    setObraValorDisponibilizado(obra.valorDisponibilizado || 0);
    setObraValorVenda(obra.valorVenda || 0);
    setObraValorRecebido(obra.valorRecebido || 0);
    setObraStatus(obra.status || 'Em Andamento');
    setIsObraModalOpen(true);
  };

  const handleDeleteObra = (id) => {
    if(window.confirm("Deseja realmente remover esta obra? Todas as despesas e recebimentos vinculados também serão excluídos.")) {
      setObras(prev => prev.filter(o => o.id !== id));
      setDespesas(prev => prev.filter(d => d.obraId !== id));
      setRecebimentos(prev => prev.filter(r => r.obraId !== id));
    }
  };

  const closeObraModal = () => {
    setEditingObraId(null);
    setObraNome('');
    setObraCliente('');
    setObraTipo('Construção para Venda');
    setObraPercentAdm(0);
    setObraValorDisponibilizado(0);
    setObraValorVenda(0);
    setObraValorRecebido(0);
    setObraStatus('Em Andamento');
    setIsObraModalOpen(false);
  };

  // --- Ações de Estoque ---
  const handleSaveEstoque = (e) => {
    e.preventDefault();
    if (editingEstoqueId) {
      setEstoque(prev => prev.map(s => s.id === editingEstoqueId ? {
        ...s,
        item: stockItemName,
        quant: Number(stockItemQuant),
        quantMinima: Number(stockItemMin),
        precoUnit: Number(stockItemPreco)
      } : s));
    } else {
      const novoItem = {
        id: 's_' + Date.now().toString(),
        item: stockItemName,
        quant: Number(stockItemQuant),
        quantMinima: Number(stockItemMin),
        precoUnit: Number(stockItemPreco)
      };
      setEstoque(prev => [...prev, novoItem]);
    }
    closeEstoqueModal();
  };

  const openEditEstoque = (item) => {
    setEditingEstoqueId(item.id);
    setStockItemName(item.item);
    setStockItemQuant(item.quant);
    setStockItemMin(item.quantMinima);
    setStockItemPreco(item.precoUnit);
    setIsEstoqueModalOpen(true);
  };

  const handleDeleteEstoque = (id) => {
    if(window.confirm("Tem certeza que deseja excluir este item de estoque?")) {
      setEstoque(prev => prev.filter(s => s.id !== id));
    }
  };

  const closeEstoqueModal = () => {
    setEditingEstoqueId(null);
    setStockItemName('');
    setStockItemQuant(0);
    setStockItemMin(0);
    setStockItemPreco(0);
    setIsEstoqueModalOpen(false);
  };

  // --- Ações de Despesas / Lançamentos (Saídas) ---
  const handleSaveDespesa = (e) => {
    e.preventDefault();
    if (!despesaObraId) {
      alert("Selecione a obra de origem ou escolha 'Sem Obra (Despesa Geral)'.");
      return;
    }

    let finalValor = 0;
    let finalDetalhe = '';

    if (despesaTipo === 'Material de Estoque' && despesaObraId !== 'caixa_geral') {
      const selectedItem = estoque.find(s => s.id === selectedStockItemId);
      if (!selectedItem) {
        alert("Por favor, selecione um item do estoque.");
        return;
      }
      if (selectedItem.quant < stockUseQuantity) {
        alert(`Quantidade indisponível no estoque. Saldo atual: ${selectedItem.quant}`);
        return;
      }
      finalValor = selectedItem.precoUnit * stockUseQuantity;
      finalDetalhe = `Retirada de Almoxarifado: ${stockUseQuantity} un de [${selectedItem.item}]`;
      
      // Deduzir do estoque físico
      setEstoque(prev => prev.map(s => s.id === selectedStockItemId ? { ...s, quant: s.quant - stockUseQuantity } : s));

    } else if (despesaTipo === 'Mão de Obra' && despesaObraId !== 'caixa_geral') {
      const custoPedreiros = qtdPedreiro * diariaPedreiro * diasTrabalhados;
      const custoAjudantes = qtdAjudante * diariaAjudante * diasTrabalhados;
      finalValor = custoPedreiros + custoAjudantes;
      finalDetalhe = `Diárias: ${qtdPedreiro} Pedreiro(s) e ${qtdAjudante} Ajudante(s) por ${diasTrabalhados} dias`;

    } else if (despesaTipo === 'Documentação' && despesaObraId !== 'caixa_geral') {
      finalValor = Number(despesaValorManual);
      finalDetalhe = `Custos com documento de ${docTipoSugerido} - ${despesaDescricao}`;

    } else {
      // Para despesas gerais de empresa ou compras diretas
      finalValor = Number(despesaValorManual);
      finalDetalhe = despesaDescricao;
    }

    if (editingDespesaId) {
      setDespesas(prev => prev.map(d => d.id === editingDespesaId ? {
        ...d,
        obraId: despesaObraId,
        data: despesaData,
        descricao: despesaDescricao || despesaTipo,
        tipo: despesaObraId === 'caixa_geral' ? despesaTipo : despesaTipo,
        valor: finalValor,
        detalhe: finalDetalhe
      } : d));
    } else {
      const novaDespesa = {
        id: 'e_' + Date.now().toString(),
        obraId: despesaObraId,
        data: despesaData,
        descricao: despesaDescricao || despesaTipo,
        tipo: despesaTipo,
        valor: finalValor,
        detalhe: finalDetalhe
      };
      setDespesas(prev => [...prev, novaDespesa]);
    }
    closeDespesaModal();
  };

  const openEditDespesa = (despesa) => {
    setEditingDespesaId(despesa.id);
    setDespesaObraId(despesa.obraId);
    setDespesaData(despesa.data);
    setDespesaDescricao(despesa.descricao);
    setDespesaTipo(despesa.tipo);
    setDespesaValorManual(despesa.valor);
    setIsDespesaModalOpen(true);
  };

  const handleDeleteDespesa = (id) => {
    if(window.confirm("Deseja realmente remover este lançamento de despesa?")) {
      setDespesas(prev => prev.filter(d => d.id !== id));
    }
  };

  const closeDespesaModal = () => {
    setEditingDespesaId(null);
    setDespesaObraId('');
    setDespesaData(new Date().toISOString().split('T')[0]);
    setDespesaDescricao('');
    setDespesaTipo('Materiais Internos');
    setDespesaValorManual(0);
    setSelectedStockItemId('');
    setStockUseQuantity(1);
    setQtdPedreiro(1);
    setDiariaPedreiro(180);
    setQtdAjudante(1);
    setDiariaAjudante(120);
    setDiasTrabalhados(1);
    setIsDespesaModalOpen(false);
  };

  // --- Ações de Recebimentos / Medições (Entradas) ---
  const handleSaveReceipt = (e) => {
    e.preventDefault();
    if (!receiptObraId) {
      alert("Selecione o destino do recurso.");
      return;
    }

    // Validação extra para evitar estourar o limite de recebimento em vendas/MCMV
    if (receiptObraId !== 'caixa_geral') {
      const met = calcularMetricasDeObra(receiptObraId);
      const obra = obras.find(o => o.id === receiptObraId);
      
      if (obra && obra.tipo === 'Construção para Venda' && obra.status === 'Finalizada e Vendida') {
        const valorMaximoPermitido = met.faltaReceber;
        if (Number(receiptValor) > valorMaximoPermitido && !editingReceiptId) {
          alert(`Valor excede o saldo restante a receber da venda. Limite restante do comprador: R$ ${valorMaximoPermitido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          return;
        }
      }
    }

    if (editingReceiptId) {
      setRecebimentos(prev => prev.map(r => r.id === editingReceiptId ? {
        ...r,
        obraId: receiptObraId,
        data: receiptData,
        valor: Number(receiptValor),
        descricao: receiptDescricao
      } : r));
    } else {
      const novoRecebimento = {
        id: 'r_' + Date.now().toString(),
        obraId: receiptObraId,
        data: receiptData,
        valor: Number(receiptValor),
        descricao: receiptDescricao
      };
      setRecebimentos(prev => [...prev, novoRecebimento]);
    }
    closeReceiptModal();
  };

  const openEditReceipt = (receipt) => {
    setEditingReceiptId(receipt.id);
    setReceiptObraId(receipt.obraId);
    setReceiptData(receipt.data);
    setReceiptValor(receipt.valor);
    setReceiptDescricao(receipt.descricao);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteReceipt = (id) => {
    if(window.confirm("Deseja realmente remover este recebimento?")) {
      setRecebimentos(prev => prev.filter(r => r.id !== id));
    }
  };

  const closeReceiptModal = () => {
    setEditingReceiptId(null);
    setReceiptObraId('');
    setReceiptData(new Date().toISOString().split('T')[0]);
    setReceiptValor(0);
    setReceiptDescricao('');
    setIsReceiptModalOpen(false);
  };

  // --- Função para Zerar Banco de Dados ---
  const handleClearAllData = () => {
    if (window.confirm("⚠️ ATENÇÃO: Isso irá apagar PERMANENTEMENTE todos os dados de testes de Obras, Lançamentos, Estoque e Recebimentos cadastrados localmente no seu navegador para que você comece do zero! Deseja prosseguir?")) {
      setObras([]);
      setEstoque([]);
      setDespesas([]);
      setRecebimentos([]);
      localStorage.removeItem('obras_data');
      localStorage.removeItem('estoque_data');
      localStorage.removeItem('despesas_data');
      localStorage.removeItem('recebimentos_data');
      alert("Banco de dados local limpo com sucesso! Agora você pode começar sua gestão real.");
    }
  };

  const globalCaixa = calcularCaixaEmpresa();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* --- SIDEBAR LATERAL DE NAVEGAÇÃO --- */}
      <aside className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800/60">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-wide text-white">ConstruControl</h1>
              <span className="text-xs text-slate-400 font-medium">Gestor de Obras & Caixa</span>
            </div>
          </div>

          {/* Links das Abas */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Painel Financeiro
            </button>

            <button
              onClick={() => setActiveTab('obras')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === 'obras'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Obras ({obras.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('financeiro');
                setFinanceSubTab('saidas');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === 'financeiro'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Financeiro / Caixa
            </button>

            <button
              onClick={() => setActiveTab('estoque')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === 'estoque'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Package className="w-5 h-5" />
              Almoxarifado / Estoque
            </button>
          </nav>
        </div>

        {/* Footer Sidebar / Config */}
        <div className="pt-4 border-t border-slate-800/60 mt-6 md:mt-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              activeTab === 'config'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configuração & Limpeza
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
        
        {/* Top Header Barra de Status */}
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Caixa Corporativo Ativo
            </span>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            Salinas, MG • {new Date().toLocaleDateString('pt-BR')}
          </div>
        </header>

        {/* Conteúdo Dinâmico por Aba */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {/* ================= ABA 1: DASHBOARD / PAINEL FINANCEIRO ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Painel Financeiro Corporativo</h2>
                  <p className="text-slate-400 text-sm">Controle unificado do fluxo de caixa e lucros das suas obras e retiradas de pró-labore.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => { setIsObraModalOpen(true); }}
                    className="flex items-center gap-2 bg-amber-500 text-slate-950 hover:bg-amber-400 transition font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Obra
                  </button>
                  <button 
                    onClick={() => { setIsDespesaModalOpen(true); }}
                    className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition font-semibold px-4 py-2 rounded-lg text-sm border border-slate-700"
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-400" /> Registrar Saída (Gasto)
                  </button>
                  <button 
                    onClick={() => { setIsReceiptModalOpen(true); }}
                    className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition font-semibold px-4 py-2 rounded-lg text-sm border border-slate-700"
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Registrar Entrada (Giro)
                  </button>
                </div>
              </div>

              {/* Alerta de Caixa Crítico */}
              {globalCaixa.saldoCaixaAtual < 10000 && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <strong className="block font-bold">Atenção ao Fluxo de Caixa:</strong>
                    Seu caixa atual está abaixo do limite de segurança operacional. Considere realizar aportes de capital ou faturar novas medições de obras.
                  </div>
                </div>
              )}

              {/* --- TRÊS CARDS FINANCEIROS PRINCIPAIS --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Saldo de Caixa Real da Empresa */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Wallet className="w-16 h-16 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> CAIXA DISPONÍVEL (EM CONTA)
                  </span>
                  <div className={`text-3xl font-extrabold ${globalCaixa.saldoCaixaAtual >= 0 ? 'text-white' : 'text-rose-500'}`}>
                    R$ {globalCaixa.saldoCaixaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Recurso disponível para compras, diárias e retiradas.
                  </p>
                </div>

                {/* 2. Total de Saídas (Custos Totais) */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <DollarSign className="w-16 h-16 text-rose-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> TOTAL DE GASTOS ACUMULADOS
                  </span>
                  <div className="text-3xl font-extrabold text-white">
                    R$ {globalCaixa.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    R$ {globalCaixa.despesasApenasDeObras.toLocaleString('pt-BR')} em obras | R$ {globalCaixa.despesasApenasDeGeral.toLocaleString('pt-BR')} administrativos/pró-labore.
                  </p>
                </div>

                {/* 3. Faturamento Bruto da Empresa */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <ArrowUpRight className="w-16 h-16 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ENTRADAS TOTAIS (FATURAMENTO)
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    R$ {globalCaixa.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Soma de aportes, vendas de imóveis e medições bancárias.
                  </p>
                </div>

              </div>

              {/* Duas colunas: Resumo de Obras e Despesas Administrativas (Pró-labore) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Tabela de Obras (Esquerda - 2/3) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" /> Situação Financeira das Obras
                    </h3>
                    <button 
                      onClick={() => setActiveTab('obras')} 
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      Ver detalhes →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                          <th className="py-2 px-3">Obra / Cliente</th>
                          <th className="py-2 px-3">Modalidade</th>
                          <th className="py-2 px-3 text-right">Custos Diretos</th>
                          <th className="py-2 px-3 text-right">Faturamento Arrecadado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-xs">
                        {obras.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-slate-500">
                              Nenhuma obra cadastrada.
                            </td>
                          </tr>
                        ) : (
                          obras.map(obra => {
                            const met = calcularMetricasDeObra(obra.id);
                            return (
                              <tr key={obra.id} className="hover:bg-slate-900/60 transition-all">
                                <td className="py-3 px-3 font-semibold text-white">
                                  {obra.nome}
                                  <span className="block text-[10px] font-normal text-slate-400">Cliente: {obra.cliente}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    obra.tipo === 'Construção para Venda' ? 'bg-indigo-500/10 text-indigo-400' :
                                    obra.tipo === 'Minha Casa, Minha Vida' ? 'bg-teal-500/10 text-teal-400' :
                                    'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {obra.tipo}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-rose-400">
                                  R$ {met.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-emerald-400">
                                  <span>Recebido: R$ {met.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Retiradas e Pró-labore (Direita - 1/3) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold text-white mb-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-rose-400" /> Pró-labore & Custos de Caixa
                    </h3>
                    <p className="text-slate-500 text-[11px] mb-4">Retiradas e gastos administrativos gerais da empresa.</p>
                    
                    <div className="space-y-3">
                      {despesas.filter(d => d.obraId === 'caixa_geral').slice(0, 4).map(ret => (
                        <div key={ret.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-slate-100 block">{ret.descricao}</span>
                            <span className="text-[10px] text-slate-400">{new Date(ret.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <span className="text-xs font-bold text-rose-400">R$ {ret.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {despesas.filter(d => d.obraId === 'caixa_geral').length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-6">Nenhum pró-labore ou despesa de escritório lançada ainda.</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDespesaObraId('caixa_geral');
                      setDespesaTipo('Retirada de Pró-labore');
                      setIsDespesaModalOpen(true);
                    }}
                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" /> Lançar Nova Retirada / Pró-labore
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ================= ABA 2: GERENCIADOR DE OBRAS ================= */}
          {activeTab === 'obras' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Obras em Andamento</h2>
                  <p className="text-slate-400 text-sm">Controle de custos diretos de construção, limites financeiros e andamento do ciclo de vendas.</p>
                </div>
                <button 
                  onClick={() => { setIsObraModalOpen(true); }}
                  className="flex items-center gap-2 bg-amber-500 text-slate-950 hover:bg-amber-400 transition font-bold px-4 py-2 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Nova Obra
                </button>
              </div>

              {/* Cards de Obras */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {obras.length === 0 ? (
                  <div className="col-span-full bg-slate-950 border border-slate-800 p-12 text-center rounded-2xl">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-300">Nenhuma obra cadastrada</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-4">Adicione suas obras de produção para começar.</p>
                    <button 
                      onClick={() => setIsObraModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-sm"
                    >
                      Criar Obra
                    </button>
                  </div>
                ) : (
                  obras.map(obra => {
                    const met = calcularMetricasDeObra(obra.id);
                    return (
                      <div key={obra.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
                        
                        {/* Linha decorativa de Status superior */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                          obra.status === 'Finalizada e Vendida' 
                            ? (met.quitada ? 'bg-emerald-500' : 'bg-indigo-500') 
                            : obra.status === 'Finalizada' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}></div>

                        <div className="pt-2">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold self-start ${
                                obra.tipo === 'Construção para Venda' ? 'bg-indigo-500/10 text-indigo-400' :
                                obra.tipo === 'Minha Casa, Minha Vida' ? 'bg-teal-500/10 text-teal-400' :
                                'bg-amber-500/10 text-amber-400'
                              }`}>
                                {obra.tipo} {obra.tipo === 'Administração de Obra' && `(Taxa: ${obra.percentAdm}%)`}
                              </span>
                              <span className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
                                obra.status === 'Finalizada e Vendida' 
                                  ? (met.quitada ? 'text-emerald-400' : 'text-indigo-400') 
                                  : obra.status === 'Finalizada' ? 'text-blue-400' : 'text-amber-400'
                              }`}>
                                Status: {obra.status || 'Em Andamento'}
                                {obra.status === 'Finalizada e Vendida' && (
                                  <strong className="text-[9px] uppercase px-1.5 py-0.2 bg-slate-900 border rounded font-extrabold ml-1">
                                    {met.quitada ? 'Quitada' : 'Em Recebimento'}
                                  </strong>
                                )}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openEditObra(obra)}
                                className="p-1 hover:text-amber-400 text-slate-500 transition"
                                title="Editar Obra"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteObra(obra.id)}
                                className="p-1 hover:text-rose-500 text-slate-500 transition"
                                title="Excluir Obra"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-white line-clamp-1">{obra.nome}</h3>
                          <p className="text-slate-400 text-xs mb-3">Cliente: {obra.cliente}</p>

                          {/* Se for Construção para Venda e estiver vendida, destaca as parcelas de recebimento */}
                          {obra.tipo === 'Construção para Venda' && (
                            <div className="space-y-2 mt-2">
                              {obra.status === 'Finalizada e Vendida' ? (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Preço de Venda:</span>
                                    <span className="text-emerald-400 font-bold">R$ {obra.valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Total Arrecadado:</span>
                                    <span className="text-slate-200 font-bold">R$ {met.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  </div>

                                  {/* Barra de Progresso de Recebimento de Venda */}
                                  <div className="space-y-1 pt-1">
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                      <span>Progresso de Quitação</span>
                                      <span>{met.percentRecebido.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                      <div className={`h-full rounded-full transition-all duration-300 ${met.quitada ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, met.percentRecebido)}%` }}></div>
                                    </div>
                                  </div>

                                  <div className="flex justify-between text-xs pt-1 border-t border-slate-800/60 font-medium">
                                    <span className="text-amber-400">Falta Receber do Comprador:</span>
                                    <span className="text-amber-400 font-bold">R$ {met.faltaReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center mb-3">
                                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">PREVISÃO DE VENDA FUTURA</span>
                                  <span className="text-sm font-bold text-slate-300">Sob negociação pós-conclusão</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Se for Minha Casa Minha Vida, mostra as medições bancárias */}
                          {obra.tipo === 'Minha Casa, Minha Vida' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Teto Contratado Caixa:</span>
                                <span className="text-slate-200 font-bold">R$ {obra.valorDisponibilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Medições Recebidas:</span>
                                <span className="text-emerald-400 font-bold">R$ {met.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              
                              {/* Barra de Progresso de Recebimento */}
                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>Medições Liberadas</span>
                                  <span>{met.percentRecebido.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-teal-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, met.percentRecebido)}%` }}></div>
                                </div>
                              </div>

                              <div className="flex justify-between text-xs pt-1 border-t border-slate-800/60 font-medium">
                                <span className="text-amber-400">Restante no Banco:</span>
                                <span className="text-amber-400 font-bold">R$ {met.faltaReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 border-t border-slate-800/60 py-3 my-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Custos Diretos da Obra:</span>
                              <span className="font-semibold text-rose-400">
                                R$ {met.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Faturado/Arrecadado:</span>
                              <span className="font-semibold text-slate-200">
                                R$ {met.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-medium">Lucro / Retorno Comercial:</span>
                            <span className={`text-base font-extrabold ${met.lucro >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              R$ {met.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Ações rápidas no rodapé do Card */}
                          <div className="flex gap-2 mt-4 pt-1">
                            
                            {/* Mostra botão de recebimento apenas se não estiver 100% quitada ou se for obra sob demanda */}
                            {!met.quitada && (obra.tipo === 'Minha Casa, Minha Vida' || (obra.tipo === 'Construção para Venda' && obra.status === 'Finalizada e Vendida') || obra.tipo === 'Administração de Obra') ? (
                              <button
                                onClick={() => {
                                  setReceiptObraId(obra.id);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded border border-emerald-500/20 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                {obra.tipo === 'Construção para Venda' ? 'Receber Parcela' : 'Entrada (Medição)'}
                              </button>
                            ) : met.quitada ? (
                              <div className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[11px] font-bold flex items-center justify-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Quitada
                              </div>
                            ) : null}

                            <button
                              onClick={() => {
                                setDespesaObraId(obra.id);
                                setIsDespesaModalOpen(true);
                              }}
                              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded border border-rose-500/20 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <ArrowDownRight className="w-3.5 h-3.5" /> Gasto da Obra
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= ABA 3: FINANCEIRO & FLUXO DE CAIXA ================= */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              
              {/* Título & Toggle de Entradas/Saídas */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Financeiro & Caixa da Empresa</h2>
                  <p className="text-slate-400 text-sm">Registre diárias, materiais de estoque, taxas corporativas, retiradas ou os aportes de sócios.</p>
                </div>
                
                {/* Switch de Entradas / Saídas */}
                <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFinanceSubTab('saidas')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      financeSubTab === 'saidas'
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Saídas (Despesas / Pró-labore)
                  </button>
                  <button
                    onClick={() => setFinanceSubTab('entradas')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      financeSubTab === 'entradas'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Entradas (Medições / Aportes)
                  </button>
                </div>
              </div>

              {/* Botões rápidos de Lançamento e Filtros */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">Filtrar por Destino:</span>
                  <select 
                    value={selectedObraFilter}
                    onChange={(e) => setSelectedObraFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="todas">Todos os lançamentos</option>
                    <option value="caixa_geral">Apenas Caixa Geral (Pró-labore / Escritório / Aporte)</option>
                    {obras.map(o => (
                      <option key={o.id} value={o.id}>{o.nome}</option>
                    ))}
                  </select>
                </div>

                {financeSubTab === 'saidas' ? (
                  <button 
                    onClick={() => { setIsDespesaModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white transition font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" /> Nova Despesa / Retirada
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsReceiptModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" /> Registrar Entrada / Aporte
                  </button>
                )}
              </div>

              {/* LISTAGEM FINANCEIRA - ABAS DINÂMICAS */}
              {financeSubTab === 'saidas' ? (
                /* --- TABELA DE SAÍDAS (DESPESAS) --- */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Registro de Despesas e Retiradas
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                          <th className="py-3 px-4">Destino / Obra</th>
                          <th className="py-3 px-4">Data</th>
                          <th className="py-3 px-4">Tipo de Gasto</th>
                          <th className="py-3 px-4">Detalhes / Descrição</th>
                          <th className="py-3 px-4 text-right">Valor Total</th>
                          <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-sm">
                        {(() => {
                          const filtered = selectedObraFilter === 'todas' 
                            ? despesas 
                            : despesas.filter(d => d.obraId === selectedObraFilter);
                          
                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-500">
                                  Nenhuma despesa ou retirada lançada para o filtro atual.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map(despesa => {
                            const obraRelacionada = despesa.obraId === 'caixa_geral' 
                              ? { nome: 'Caixa Geral (Empresa)' }
                              : obras.find(o => o.id === despesa.obraId);
                            
                            return (
                              <tr key={despesa.id} className="hover:bg-slate-900/40 transition">
                                <td className="py-3 px-4 font-semibold text-slate-200">
                                  {obraRelacionada ? obraRelacionada.nome : 'Obra Inexistente'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                                  {new Date(despesa.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    despesa.tipo === 'Material de Estoque' ? 'bg-amber-500/10 text-amber-400' :
                                    despesa.tipo === 'Mão de Obra' ? 'bg-sky-500/10 text-sky-400' :
                                    despesa.tipo === 'Documentação' ? 'bg-purple-500/10 text-purple-400' :
                                    despesa.tipo === 'Retirada de Pró-labore' ? 'bg-rose-500/10 text-rose-400 font-bold' :
                                    despesa.tipo === 'Administrativo / Escritório' ? 'bg-indigo-500/10 text-indigo-400' :
                                    'bg-emerald-500/10 text-emerald-400'
                                  }`}>
                                    {despesa.tipo}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={despesa.detalhe || despesa.descricao}>
                                  {despesa.detalhe || despesa.descricao}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-rose-400 whitespace-nowrap">
                                  R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <button 
                                      onClick={() => openEditDespesa(despesa)}
                                      className="p-1 hover:text-amber-400 text-slate-500 transition"
                                      title="Editar Lançamento"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDespesa(despesa.id)}
                                      className="p-1 hover:text-rose-500 text-slate-500 transition"
                                      title="Excluir Lançamento"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* --- TABELA DE ENTRADAS (RECEBIMENTOS) --- */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Registro de Recebimentos e Medições
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                          <th className="py-3 px-4">Destino do Crédito</th>
                          <th className="py-3 px-4">Data</th>
                          <th className="py-3 px-4">Descrição / Origem</th>
                          <th className="py-3 px-4 text-right">Valor Recebido</th>
                          <th className="py-3 px-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-sm">
                        {(() => {
                          const filtered = selectedObraFilter === 'todas' 
                            ? recebimentos 
                            : recebimentos.filter(r => r.obraId === selectedObraFilter);
                          
                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan="5" className="py-8 text-center text-slate-500">
                                  Nenhum recebimento ou aporte lançado para a seleção atual.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map(receipt => {
                            const obraRelacionada = receipt.obraId === 'caixa_geral'
                              ? { nome: 'Caixa Geral (Empresa)' }
                              : obras.find(o => o.id === receipt.obraId);

                            return (
                              <tr key={receipt.id} className="hover:bg-slate-900/40 transition">
                                <td className="py-3 px-4 font-semibold text-slate-200">
                                  {obraRelacionada ? obraRelacionada.nome : 'Obra Inexistente'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                                  {new Date(receipt.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                  {receipt.descricao}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                                  R$ {receipt.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <button 
                                      onClick={() => openEditReceipt(receipt)}
                                      className="p-1 hover:text-amber-400 text-slate-500 transition"
                                      title="Editar Recebimento"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteReceipt(receipt.id)}
                                      className="p-1 hover:text-rose-500 text-slate-500 transition"
                                      title="Excluir Recebimento"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================= ABA 4: ALMOXARIFADO / ESTOQUE ================= */}
          {activeTab === 'estoque' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Almoxarifado & Controle de Estoque</h2>
                  <p className="text-slate-400 text-sm">Controle materiais comprados e aloque-os nas despesas de cada obra de forma inteligente.</p>
                </div>
                <button 
                  onClick={() => { setIsEstoqueModalOpen(true); }}
                  className="flex items-center gap-2 bg-amber-500 text-slate-950 hover:bg-amber-400 transition font-bold px-4 py-2 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Novo Item de Estoque
                </button>
              </div>

              {/* Informações Rápidas de Estoque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase">TOTAL DE ITENS NO ESTOQUE</span>
                    <span className="text-2xl font-bold text-white">
                      {estoque.reduce((acc, s) => acc + s.quant, 0)} <span className="text-sm font-normal text-slate-400">unidades</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase">VALOR MONETÁRIO EM ESTOQUE</span>
                    <span className="text-2xl font-bold text-indigo-400">
                      R$ {estoque.reduce((acc, s) => acc + (s.quant * s.precoUnit), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

              {/* Tabela de Estoque */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                        <th className="py-3 px-4">Item / Material</th>
                        <th className="py-3 px-4 text-center">Quantidade Atual</th>
                        <th className="py-3 px-4 text-center">Quantidade Mínima</th>
                        <th className="py-3 px-4 text-right">Preço Unitário de Custo</th>
                        <th className="py-3 px-4 text-right">Valor Total Estimado</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {estoque.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">
                            Sem itens no almoxarifado. Clique em "Novo Item de Estoque" para cadastrar.
                          </td>
                        </tr>
                      ) : (
                        estoque.map(item => {
                          const estoqueBaixo = item.quant <= item.quantMinima;
                          return (
                            <tr key={item.id} className="hover:bg-slate-900/40 transition">
                              <td className="py-3 px-4 font-semibold text-slate-200">
                                <div className="flex items-center gap-2">
                                  {item.item}
                                  {estoqueBaixo && (
                                    <span className="flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[10px] px-1.5 py-0.5 rounded border border-rose-500/20 font-bold uppercase animate-pulse">
                                      <AlertTriangle className="w-3 h-3" /> Reabastecer
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-slate-100">
                                {item.quant}
                              </td>
                              <td className="py-3 px-4 text-center text-slate-400">
                                {item.quantMinima}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-300">
                                R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-amber-400">
                                R$ {(item.quant * item.precoUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button 
                                    onClick={() => openEditEstoque(item)}
                                    className="p-1 hover:text-amber-400 text-slate-500 transition"
                                    title="Editar Item"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEstoque(item.id)}
                                    className="p-1 hover:text-rose-500 text-slate-500 transition"
                                    title="Excluir Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= ABA 5: CONFIGURAÇÕES & LIMPEZA ================= */}
          {activeTab === 'config' && (
  <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Configurações & Reset de Dados</h2>
                <p className="text-slate-400 text-sm">Controle de sincronização offline e ambiente de produção limpo.</p>
              </div>

              {/* Zona Vermelha: Limpar Banco de Testes */}
              <div className="bg-slate-950 border border-rose-950/40 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg animate-pulse">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Zerar Ambiente de Teste (Novo Começo)</h3>
                    <p className="text-xs text-slate-400">Apague instantaneamente todos os dados simulados e de demonstração do painel para começar o seu gerenciamento real sem registros antigos.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <button 
                    onClick={handleClearAllData}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition shadow-lg shadow-rose-900/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Limpar Todo o Banco de Dados
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL: CADASTRAR/EDITAR OBRA ================= */}
      {isObraModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                {editingObraId ? 'Editar Dados da Obra' : 'Cadastrar Nova Obra'}
              </h3>
              <button onClick={closeObraModal} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveObra} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome / Identificação da Obra</label>
                <input 
                  type="text" 
                  value={obraNome}
                  onChange={(e) => setObraNome(e.target.value)}
                  placeholder="Ex: Residencial Bella Vista - Lote 5"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Cliente / Investidor</label>
                <input 
                  type="text" 
                  value={obraCliente}
                  onChange={(e) => setObraCliente(e.target.value)}
                  placeholder="Ex: Roberto Carlos"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Modalidade</label>
                  <select 
                    value={obraTipo}
                    onChange={(e) => setObraTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Construção para Venda">Construção para Venda</option>
                    <option value="Minha Casa, Minha Vida">Minha Casa, Minha Vida</option>
                    <option value="Administração de Obra">Administração de Obra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status da Obra</label>
                  <select 
                    value={obraStatus}
                    onChange={(e) => setObraStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Finalizada">Finalizada</option>
                    {obraTipo === 'Construção para Venda' && (
                      <option value="Finalizada e Vendida">Finalizada e Vendida</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Se for Construção para Venda + Finalizada e Vendida */}
              {obraTipo === 'Construção para Venda' && obraStatus === 'Finalizada e Vendida' && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-emerald-400 uppercase">VALOR REAL DE VENDA DO IMÓVEL (R$)</label>
                  <input 
                    type="number" 
                    value={obraValorVenda}
                    onChange={(e) => setObraValorVenda(Number(e.target.value))}
                    placeholder="Ex: 450000"
                    required
                    min="0"
                    className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block">O lucro desta obra passará a ser calculado como: Valor de Venda - Custo Total Acumulado das Construções.</span>
                </div>
              )}

              {/* Se for Minha Casa Minha Vida */}
              {obraTipo === 'Minha Casa, Minha Vida' && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor Contratado do Financiamento (R$)</label>
                    <input 
                      type="number" 
                      value={obraValorDisponibilizado}
                      onChange={(e) => setObraValorDisponibilizado(Number(e.target.value))}
                      placeholder="Ex: 320000"
                      required
                      min="0"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Limite total aprovado para as liberações de medição.</span>
                  </div>
                </div>
              )}

              {/* Exibe % se for ADM de Obra */}
              {obraTipo === 'Administração de Obra' && (
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-400 uppercase mb-1">% de Taxa de Administração Cobrada</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={obraPercentAdm}
                      onChange={(e) => setObraPercentAdm(Number(e.target.value))}
                      placeholder="Ex: 12"
                      required
                      min="0"
                      max="100"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 pr-8"
                    />
                    <span className="absolute right-3 top-2 text-sm text-slate-400 font-bold">%</span>
                  </div>
                </div>
              )}

              {/* Campo para Sinal / Entrada Inicial de qualquer modalidade */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  {obraTipo === 'Construção para Venda' ? 'Valor de Entrada / Sinal Recebido (R$)' : 'Aporte Inicial Recebido (R$)'}
                </label>
                <input 
                  type="number" 
                  value={obraValorRecebido}
                  onChange={(e) => setObraValorRecebido(Number(e.target.value))}
                  placeholder="Ex: 150000"
                  required
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Primeira parcela em mãos. Recebimentos futuros de parcelas ou medições serão faturados pela aba Financeiro.</span>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-4 justify-end">
                <button 
                  type="button"
                  onClick={closeObraModal}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  Salvar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR/EDITAR DESPESA ================= */}
      {isDespesaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                {editingDespesaId ? 'Editar Gasto' : 'Lançar Nova Despesa'}
              </h3>
              <button onClick={closeDespesaModal} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveDespesa} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Vincular Destino do Recurso</label>
                  <select 
                    value={despesaObraId}
                    onChange={(e) => {
                      setDespesaObraId(e.target.value);
                      if (e.target.value === 'caixa_geral') {
                        setDespesaTipo('Retirada de Pró-labore');
                      }
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Selecione o Destino --</option>
                    <option value="caixa_geral" className="text-rose-400 font-bold">-- Sem Obra (Despesa Geral / Pró-labore) --</option>
                    {obras.map(o => (
                      <option key={o.id} value={o.id}>{o.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data do Lançamento</label>
                  <input 
                    type="date" 
                    value={despesaData}
                    onChange={(e) => setDespesaData(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Origem do Gasto (Tipo)</label>
                {despesaObraId === 'caixa_geral' ? (
                  <select 
                    value={despesaTipo}
                    onChange={(e) => setDespesaTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Retirada de Pró-labore">Retirada de Pró-labore (Retorno Pessoal)</option>
                    <option value="Administrativo / Escritório">Administrativo / Escritório (Contador, Internet)</option>
                    <option value="Combustível & Frota Geral">Combustível & Frota Geral (Gasolina Salinas)</option>
                    <option value="Outros Gastos de Caixa">Outros Gastos de Caixa Corporativo</option>
                  </select>
                ) : (
                  <select 
                    value={despesaTipo}
                    onChange={(e) => setDespesaTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Materiais Internos">Materiais Internos (Compra Direta)</option>
                    <option value="Material de Estoque">Material de Estoque (Almoxarifado)</option>
                    <option value="Aluguel de Ferramentas/Maquinários">Aluguel de Ferramentas/Maquinários</option>
                    <option value="Documentação">Documentação (Taxas, ART, Alvarás)</option>
                    <option value="Mão de Obra">Mão de Obra (Diárias de Equipe)</option>
                  </select>
                )}
              </div>

              {/* --- FLUXO DE COMPOSIÇÃO: MATERIAL DO ESTOQUE (Apenas se tiver obra) --- */}
              {despesaTipo === 'Material de Estoque' && despesaObraId !== 'caixa_geral' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase mb-1">
                    <Package className="w-4 h-4" /> Selecione o Insumo do Almoxarifado
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase mb-1">Material Cadastrado</label>
                    <select 
                      value={selectedStockItemId}
                      onChange={(e) => {
                        setSelectedStockItemId(e.target.value);
                      }}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-100"
                    >
                      <option value="">-- Selecione o Material --</option>
                      {estoque.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.item} (Saldo: {item.quant} un | R$ {item.precoUnit.toFixed(2)}/un)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase mb-1">Quantidade a Retirar</label>
                    <input 
                      type="number" 
                      value={stockUseQuantity}
                      onChange={(e) => setStockUseQuantity(Math.max(1, Number(e.target.value)))}
                      min="1"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-100"
                    />
                  </div>

                  {selectedStockItemId && (
                    <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-800/60">
                      <span>Custo Total a ser Lançado:</span>
                      <strong className="text-white text-sm">
                        R$ {((estoque.find(s => s.id === selectedStockItemId)?.precoUnit || 0) * stockUseQuantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* --- FLUXO DE COMPOSIÇÃO: MÃO DE OBRA (DIÁRIAS) --- */}
              {despesaTipo === 'Mão de Obra' && despesaObraId !== 'caixa_geral' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase mb-2">
                    <Calculator className="w-4 h-4" /> Calculadora de Diárias de Produção
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-0.5">Quant. Pedreiros</label>
                      <input 
                        type="number" 
                        value={qtdPedreiro} 
                        onChange={(e) => setQtdPedreiro(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-0.5">Valor Diária Pedreiro (R$)</label>
                      <input 
                        type="number" 
                        value={diariaPedreiro} 
                        onChange={(e) => setDiariaPedreiro(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-0.5">Quant. Ajudantes</label>
                      <input 
                        type="number" 
                        value={qtdAjudante} 
                        onChange={(e) => setQtdAjudante(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-0.5">Valor Diária Ajudante (R$)</label>
                      <input 
                        type="number" 
                        value={diariaAjudante} 
                        onChange={(e) => setDiariaAjudante(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-0.5">Dias Trabalhados (Aceita decimais como 1.5)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={diasTrabalhados} 
                      onChange={(e) => setDiasTrabalhados(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white"
                    />
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Calculado:</span>
                    <strong className="text-sky-400 text-base">
                      R$ {((qtdPedreiro * diariaPedreiro * diasTrabalhados) + (qtdAjudante * diariaAjudante * diasTrabalhados)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              )}

              {/* --- FLUXO DE COMPOSIÇÃO: DOCUMENTAÇÃO --- */}
              {despesaTipo === 'Documentação' && despesaObraId !== 'caixa_geral' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase mb-1">
                    <FileText className="w-4 h-4" /> Despesas de Regularização / Cartório
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase mb-1">Tipo de Documentação</label>
                    <select 
                      value={docTipoSugerido}
                      onChange={(e) => setDocTipoSugerido(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Alvará">Alvará de Construção</option>
                      <option value="ART / RRT">ART (Anotação de Responsabilidade Técnica)</option>
                      <option value="Habite-se">Habite-se</option>
                      <option value="Taxa de Incêndio / Bombeiros">Taxa de Incêndio / Bombeiros</option>
                      <option value="Escritura / Cartório">Escritura / Cartório de Registro</option>
                      <option value="Outro">Outro Documento Personalizado</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Descrição geral da despesa */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição / Finalidade do Gasto</label>
                <input 
                  type="text" 
                  value={despesaDescricao}
                  onChange={(e) => setDespesaDescricao(e.target.value)}
                  placeholder="Ex: Pagamento pró-labore de Junho, compra de parafusos, taxas CREA"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Valor Manual para Tipos que não são Auto-calculados */}
              {(despesaTipo !== 'Material de Estoque' && despesaTipo !== 'Mão de Obra') || despesaObraId === 'caixa_geral' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor Total Pago (R$)</label>
                  <input 
                    type="number" 
                    value={despesaValorManual}
                    onChange={(e) => setDespesaValorManual(Number(e.target.value))}
                    placeholder="Ex: 5000"
                    min="1"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : null}

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-4 justify-end">
                <button 
                  type="button"
                  onClick={closeDespesaModal}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR RECEBIMENTO (ENTRADA) ================= */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                {editingReceiptId ? 'Editar Entrada de Recurso' : 'Registrar Novo Recebimento'}
              </h3>
              <button onClick={closeReceiptModal} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Destino da Entrada</label>
                <select 
                  value={receiptObraId}
                  onChange={(e) => setReceiptObraId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Selecione o Destino --</option>
                  <option value="caixa_geral" className="text-emerald-400 font-bold">-- Sem Obra (Aporte do Sócio / Giro Geral) --</option>
                  {obras.map(o => {
                    const met = calcularMetricasDeObra(o.id);
                    // Obras quitadas não aparecem para seleção de novos recebimentos
                    const isFullyPaid = (o.tipo === 'Minha Casa, Minha Vida' && met.faltaReceber <= 0) || (o.tipo === 'Construção para Venda' && o.status === 'Finalizada e Vendida' && met.faltaReceber <= 0);
                    if (isFullyPaid) return null;
                    return (
                      <option key={o.id} value={o.id}>{o.nome} (Falta Receber: R$ {met.faltaReceber.toLocaleString('pt-BR')})</option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data do Crédito</label>
                  <input 
                    type="date" 
                    value={receiptData}
                    onChange={(e) => setReceiptData(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor Creditado (R$)</label>
                  <input 
                    type="number" 
                    value={receiptValor}
                    onChange={(e) => setReceiptValor(Number(e.target.value))}
                    placeholder="Ex: 50000"
                    required
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição / Justificativa</label>
                <input 
                  type="text" 
                  value={receiptDescricao}
                  onChange={(e) => setReceiptDescricao(e.target.value)}
                  placeholder="Ex: Parcela 02 do pagamento do comprador"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-4 justify-end">
                <button 
                  type="button"
                  onClick={closeReceiptModal}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  Confirmar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CADASTRAR/EDITAR ITEM DE ESTOQUE ================= */}
      {isEstoqueModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                {editingEstoqueId ? 'Editar Item de Estoque' : 'Cadastrar Material Almoxarifado'}
              </h3>
              <button onClick={closeEstoqueModal} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveEstoque} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome / Descrição do Material</label>
                <input 
                  type="text" 
                  value={stockItemName}
                  onChange={(e) => setStockItemName(e.target.value)}
                  placeholder="Ex: Saco de Cimento CP-II 50kg"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Qtd Atual em Estoque</label>
                  <input 
                    type="number" 
                    value={stockItemQuant}
                    onChange={(e) => setStockItemQuant(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Alerta Mínimo (Qtd)</label>
                  <input 
                    type="number" 
                    value={stockItemMin}
                    onChange={(e) => setStockItemMin(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço Unitário de Custo (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={stockItemPreco}
                  onChange={(e) => setStockItemPreco(Number(e.target.value))}
                  placeholder="Ex: 42.50"
                  required
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-4 justify-end">
                <button 
                  type="button"
                  onClick={closeEstoqueModal}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}