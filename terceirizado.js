// ================== FIREBASE INIT ==================
const firebaseConfig = {
    apiKey: "AIzaSyB2xi5fCMv3Vz_UpRxMdQqrVn1DDyAh3_k",
    authDomain: "propostas-comerciais-e288c.firebaseapp.com",
    projectId: "propostas-comerciais-e288c",
    storageBucket: "propostas-comerciais-e288c.firebasestorage.app",
    messagingSenderId: "781220916097",
    appId: "1:781220916097:web:9d1d53aa8bb03c520c1680",
    measurementId: "G-JEH5ZKSX89"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// ================== CONSTANTES ==================
const SALARIO_MINIMO = 1621.00;
const HORAS_MENSAL = 220;
const TAXA_ENCARGOS_FISCAIS = 0.1375; // 13.75% fixo sobre subtotal dos insumos e benefícios

const UNIFORMES = [
    { nome: "CALÇA OPERACIONAL", preco: 48.00 },
    { nome: "CAMISETA", preco: 45.00 },
    { nome: "BOTA", preco: 78.00 },
    { nome: "BLUSA DE FRIO", preco: 125.00 },
    { nome: "COLETE", preco: 28.00 }
];

const EPIS = [
    { nome: "Óculos Proteção", preco: 7.00 },
    { nome: "Cinta Elástica P Proteção Lombar", preco: 38.00 },
    { nome: "Luva Vaqueta Tipo Petroleiro", preco: 25.00 },
    { nome: "Protetor auricular Tipo Plug Silicone", preco: 2.00 },
    { nome: "Capacete Avant", preco: 18.00 },
    { nome: "Luvas de limpeza", preco: 10.00 },
    { nome: "GALOCHA", preco: 52.00 }
];

// Benefícios fixos
const BENEFICIOS_FIXOS = [
    { nome: "Vale Refeição", campo: "vr", valorDiario: 0, dias: 0 },
    { nome: "Cesta Básica", campo: "cesta", valorDiario: 0, dias: 0 },
    { nome: "PPR", campo: "ppr", valorDiario: 0, dias: 0 },
    { nome: "Assiduidade", campo: "assiduidade", valorDiario: 0, dias: 0 },
    { nome: "Vale Transporte", campo: "vt", valorDiario: 0, dias: 0 }
];

const SEGURANCA_FIXOS = [
    { nome: "SST (Segurança e Saúde do Trabalho)", campo: "sst", valor: 18.00, depreciacao: 1 },
    { nome: "Seguro de Vida", campo: "seguro_vida", valor: 15.00, depreciacao: 1 }
];

const INSUMOS = [
    { nome: "Tipo", campo: "tipo" },
    { nome: "Uber", campo: "uber" },
    { nome: "Insumos (Materiais de Limpeza)", campo: "insumos" },
    { nome: "Maquinário", campo: "maquinario" }
];

// EXAMES
const EXAMES_ADMISSIONAL = [
    { nome: "Admissional / Demissional / Acuidade", preco: 111.00, obrigatorio: false }
];

const EXAMES_COMPLEMENTARES = [
    { nome: "Hemograma", preco: 20.00 },
    { nome: "Glicemia", preco: 18.00 },
    { nome: "Urina tipo I", preco: 15.00 },
    { nome: "ECG", preco: 55.00 },
    { nome: "EEG", preco: 60.00 },
    { nome: "Coprocultura", preco: 38.00 },
    { nome: "PPF", preco: 32.00 },
    { nome: "VDRL", preco: 35.00 },
    { nome: "Espirometria", preco: 55.00 },
    { nome: "RX Tórax", preco: 75.00 },
    { nome: "RX Lombo Sacra", preco: 68.00 },
    { nome: "Av. Psicossocial", preco: 210.00 },
    { nome: "RX Coluna Cervical", preco: 115.00 },
    { nome: "RX Coluna Dorsal", preco: 115.00 },
    { nome: "Toxicologico", preco: 250.00 },
    { nome: "Gama GT", preco: 19.00 },
    { nome: "Ácido Hipurico", preco: 38.00 },
    { nome: "TGO", preco: 22.00 },
    { nome: "TGP", preco: 22.00 },
    { nome: "Micologico", preco: 25.00 },
    { nome: "Testoreno", preco: 60.00 },
    { nome: "HBSAG", preco: 67.00 },
    { nome: "Cretinina", preco: 19.00 }
];

// Chave para salvar rascunho no localStorage
const DRAFT_KEY = 'proposta_terceirizado_draft';

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('cargos-container');
    const btnAdicionar = document.getElementById('adicionar-cargo');
    const totalGeralEl = document.getElementById('total-geral');
    const clienteInput = document.getElementById('cliente-nome');
    const btnVoltar = document.getElementById('btn-voltar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalOk = document.getElementById('modal-ok');

    function mostrarModal(mensagem) {
        modalMensagem.textContent = mensagem;
        modalOverlay.classList.remove('hidden');
    }

    modalOk.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    btnVoltar.addEventListener('click', () => {
        localStorage.removeItem(DRAFT_KEY);
        window.location.href = 'menu.html';
    });

    clienteInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
        salvarRascunho();
    });

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function calcularTotalGeral() {
        let total = 0;
        document.querySelectorAll('.cargo-item').forEach(item => {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                const totalValor = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                total += totalValor * qtd;
            }
        });
        totalGeralEl.textContent = formatarMoeda(total);
        return total;
    }

    // ========== FUNÇÃO PARA SALVAR RASCUNHO ==========
    function salvarRascunho() {
        try {
            const dados = {
                cliente: clienteInput.value,
                cargos: []
            };
            
            document.querySelectorAll('.cargo-item').forEach(item => {
                const cargo = {
                    nome: item.querySelector('.cargo-nome')?.value || '',
                    quantidade: item.querySelector('.cargo-quantidade')?.value || 1,
                    salario: item.querySelector('.cargo-salario')?.value || '',
                    encargosPercentual: item.querySelector('.encargos-percentual')?.value || '113,00',
                    adicionais: {
                        horasExtras: item.querySelector('.he-check')?.checked || false,
                        noturno: item.querySelector('.an-check')?.checked || false,
                        periculosidade: item.querySelector('.per-check')?.checked || false,
                        insalubridade: item.querySelector('.ins-check')?.checked || false,
                        heHoras: item.querySelector('.he-horas')?.value || 0,
                        anHoras: item.querySelector('.an-horas')?.value || 0
                    },
                    uniformes: {},
                    epis: {},
                    beneficios: {},
                    beneficiosPersonalizados: [],
                    seguranca: {},
                    exames: {},
                    insumos: {},
                    treinamento: 0
                };
                
                // Capturar uniformes
                item.querySelectorAll('.uniformes-box .item-lista').forEach(lista => {
                    const nome = lista.querySelector('.item-nome')?.textContent;
                    const qtdInput = lista.querySelector('.quantidade-uniforme');
                    const depInput = lista.querySelector('.depreciacao-uniforme');
                    if (nome && qtdInput && parseInt(qtdInput.value) > 0) {
                        cargo.uniformes[nome] = {
                            quantidade: parseInt(qtdInput.value),
                            depreciacao: parseInt(depInput?.value) || 1
                        };
                    }
                });
                
                // Capturar EPIs
                item.querySelectorAll('.epis-box .item-lista').forEach(lista => {
                    const nome = lista.querySelector('.item-nome')?.textContent;
                    const qtdInput = lista.querySelector('.quantidade-epi');
                    const depInput = lista.querySelector('.depreciacao-epi');
                    if (nome && qtdInput && parseInt(qtdInput.value) > 0) {
                        cargo.epis[nome] = {
                            quantidade: parseInt(qtdInput.value),
                            depreciacao: parseInt(depInput?.value) || 1
                        };
                    }
                });
                
                // Capturar benefícios fixos
                item.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                    const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    if (campo) {
                        const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                        const dias = parseInt(diasInput?.value) || 0;
                        if (valor > 0 || dias > 0) {
                            cargo.beneficios[campo] = { valorDiario: valor, dias: dias };
                        }
                    }
                });
                
                // Capturar benefícios personalizados
                item.querySelectorAll('.beneficio-custom-card').forEach((card, idx) => {
                    const nomeInput = card.querySelector('.beneficio-custom-nome');
                    const valorInput = card.querySelector('.beneficio-custom-valor');
                    const diasInput = card.querySelector('.beneficio-custom-dias');
                    const nome = nomeInput?.value || '';
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (nome && (valor > 0 || dias > 0)) {
                        cargo.beneficiosPersonalizados.push({ nome, valorDiario: valor, dias });
                    }
                });
                
                // Capturar SST e Seguro
                item.querySelectorAll('.seguranca-item').forEach(card => {
                    const campo = card.querySelector('.seguranca-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.seguranca-valor');
                    const depInput = card.querySelector('.seguranca-depreciacao');
                    if (campo) {
                        const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                        const depreciacao = parseInt(depInput?.value) || 1;
                        if (valor > 0) {
                            cargo.seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                        }
                    }
                });
                
                // Capturar exames
                const examesSection = item.querySelector('.exames-section');
                if (examesSection) {
                    const examesData = { exames: {}, treinamento: 0 };
                    examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                        if (cb.checked) {
                            examesData.exames[cb.dataset.nome] = true;
                        }
                    });
                    const treinamentoInputExames = examesSection.querySelector('.treinamento-valor');
                    if (treinamentoInputExames) {
                        examesData.treinamento = parseFloat(treinamentoInputExames.value.replace(/\./g, '').replace(',', '.')) || 0;
                    }
                    cargo.exames = examesData.exames;
                    cargo.treinamento = examesData.treinamento;
                }
                
                // Capturar insumos
                item.querySelectorAll('.insumo-card').forEach(card => {
                    const campo = card.querySelector('.insumo-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.insumo-valor');
                    if (campo) {
                        const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                        if (valor > 0) {
                            cargo.insumos[campo] = { valor: valor };
                        }
                    }
                });
                
                dados.cargos.push(cargo);
            });
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar rascunho:', e);
        }
    }
    
    // ========== FUNÇÃO PARA CARREGAR RASCUNHO ==========
    function carregarRascunho() {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const dados = JSON.parse(draft);
                if (dados.cliente) clienteInput.value = dados.cliente;
                if (dados.cargos && dados.cargos.length > 0) {
                    container.innerHTML = '';
                    dados.cargos.forEach(c => {
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            c.adicionais || {},
                            c.uniformes || {},
                            c.epis || {},
                            c.beneficios || {},
                            c.seguranca || {},
                            c.exames || {},
                            c.insumos || {},
                            { encargos_fiscais: { porcentagem: 13.75 } },
                            c.treinamento || 0,
                            c.beneficiosPersonalizados || []
                        ));
                    });
                    calcularTotalGeral();
                    return true;
                }
            }
        } catch (e) {
            console.error('Erro ao carregar rascunho:', e);
        }
        return false;
    }

    // ========== FUNÇÃO PARA CRIAR SEÇÃO EXPANSÍVEL ==========
    function criarSecaoExpansivel(titulo, icone, conteudoHtml, iniciarRetraido = true) {
        const section = document.createElement('div');
        section.className = 'expandable-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-title">
                <i class="fas ${icone}"></i>
                <span>${titulo}</span>
            </div>
            <div class="section-summary">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down section-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = conteudoHtml;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = !iniciarRetraido;
        
        if (iniciarRetraido) {
            content.classList.add('collapsed');
            header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
            header.querySelector('.section-toggle').classList.add('fa-chevron-up');
        }
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.section-toggle').classList.add('fa-chevron-down');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.section-toggle').classList.add('fa-chevron-up');
            }
        });
        
        function updateSummary(value) {
            const summaryValue = header.querySelector('.summary-value');
            if (summaryValue) {
                summaryValue.textContent = formatarMoeda(value);
            }
        }
        
        return { section, updateSummary, content };
    }

    // ========== FUNÇÕES AUXILIARES ==========
    function criarItemListaComDepreciacao(item, tipo) {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-nome">${item.nome}</span>
                <span class="item-preco">${formatarMoeda(item.preco)}</span>
            </div>
            <div class="item-inputs">
                <div class="item-input">
                    <input type="number" min="0" step="1" value="0" class="quantidade-${tipo}" data-preco="${item.preco}">
                    <span>un.</span>
                </div>
                <div class="item-input">
                    <input type="number" min="1" step="1" value="1" class="depreciacao-${tipo}" data-preco="${item.preco}">
                    <span>depreciação (meses)</span>
                </div>
            </div>
            <div class="item-totals">
                <span class="item-total">Total: R$ 0,00</span>
                <span class="item-mensal">Mensal: R$ 0,00</span>
            </div>
        `;
        
        const quantidadeInput = div.querySelector(`.quantidade-${tipo}`);
        const depreciacaoInput = div.querySelector(`.depreciacao-${tipo}`);
        const totalSpan = div.querySelector('.item-total');
        const mensalSpan = div.querySelector('.item-mensal');
        
        function atualizar() {
            const qtd = parseInt(quantidadeInput.value) || 0;
            const depreciacao = parseInt(depreciacaoInput.value) || 1;
            const total = qtd * item.preco;
            const mensal = total / depreciacao;
            totalSpan.textContent = `Total: ${formatarMoeda(total)}`;
            mensalSpan.textContent = `Mensal: ${formatarMoeda(mensal)}`;
            return { total, mensal };
        }
        
        quantidadeInput.addEventListener('input', atualizar);
        depreciacaoInput.addEventListener('input', atualizar);
        atualizar();
        
        return { div, atualizar, getQuantidade: () => parseInt(quantidadeInput.value) || 0, getDepreciacao: () => parseInt(depreciacaoInput.value) || 1, getMensal: () => {
            const qtd = parseInt(quantidadeInput.value) || 0;
            const depreciacao = parseInt(depreciacaoInput.value) || 1;
            return (qtd * item.preco) / depreciacao;
        } };
    }

    function criarUniformesEpisSection(cargoItem, dadosUniformes = {}, dadosEpis = {}) {
        const section = document.createElement('div');
        section.className = 'expandable-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-title">
                <i class="fas fa-tshirt"></i>
                <span>Uniformes e EPIs</span>
            </div>
            <div class="section-summary">
                <span class="summary-label">Subtotal Mensal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down section-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = `
            <div class="uniformes-epis-container">
                <div class="uniformes-box">
                    <div class="box-header">
                        <h4><i class="fas fa-shirt"></i> Uniformes</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu uniformes-menu"></div>
                    <div class="uniformes-total">Total Mensal Uniformes: <span>R$ 0,00</span></div>
                </div>
                <div class="epis-box">
                    <div class="box-header">
                        <h4><i class="fas fa-hard-hat"></i> EPIs</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu epis-menu"></div>
                    <div class="epis-total">Total Mensal EPIs: <span>R$ 0,00</span></div>
                </div>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
        header.querySelector('.section-toggle').classList.add('fa-chevron-up');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.section-toggle').classList.add('fa-chevron-down');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.section-toggle').classList.add('fa-chevron-up');
            }
        });
        
        const uniformesBox = content.querySelector('.uniformes-box');
        const episBox = content.querySelector('.epis-box');
        const uniformesMenu = content.querySelector('.uniformes-menu');
        const episMenu = content.querySelector('.epis-menu');
        const uniformesTotalSpan = content.querySelector('.uniformes-total span');
        const episTotalSpan = content.querySelector('.epis-total span');
        
        const uniformesItems = [];
        const episItems = [];
        
        UNIFORMES.forEach(u => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal } = criarItemListaComDepreciacao(u, 'uniforme');
            const quantidadeInput = div.querySelector('.quantidade-uniforme');
            const depreciacaoInput = div.querySelector('.depreciacao-uniforme');
            if (dadosUniformes && dadosUniformes[u.nome]) {
                quantidadeInput.value = dadosUniformes[u.nome].quantidade || 0;
                depreciacaoInput.value = dadosUniformes[u.nome].depreciacao || 1;
                atualizar();
            }
            uniformesMenu.appendChild(div);
            uniformesItems.push({ 
                atualizar, 
                getQuantidade, 
                getDepreciacao,
                getMensal,
                getPreco: () => u.preco,
                getNome: () => u.nome,
                div
            });
        });
        
        EPIS.forEach(e => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal } = criarItemListaComDepreciacao(e, 'epi');
            const quantidadeInput = div.querySelector('.quantidade-epi');
            const depreciacaoInput = div.querySelector('.depreciacao-epi');
            if (dadosEpis && dadosEpis[e.nome]) {
                quantidadeInput.value = dadosEpis[e.nome].quantidade || 0;
                depreciacaoInput.value = dadosEpis[e.nome].depreciacao || 1;
                atualizar();
            }
            episMenu.appendChild(div);
            episItems.push({ 
                atualizar, 
                getQuantidade, 
                getDepreciacao,
                getMensal,
                getPreco: () => e.preco,
                getNome: () => e.nome,
                div
            });
        });
        
        function calcularTotalUniformeMensal() {
            let total = 0;
            uniformesItems.forEach(item => {
                total += item.getMensal();
            });
            uniformesTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function calcularTotalEpiMensal() {
            let total = 0;
            episItems.forEach(item => {
                total += item.getMensal();
            });
            episTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function atualizarTotais() {
            const totalUniforme = calcularTotalUniformeMensal();
            const totalEpi = calcularTotalEpiMensal();
            const totalGeral = totalUniforme + totalEpi;
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            return { totalUniforme, totalEpi, totalGeral };
        }
        
        uniformesItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    atualizarTotais();
                    if (cargoItem && cargoItem.dispatchEvent) {
                        cargoItem.dispatchEvent(new Event('recalcular'));
                    }
                    salvarRascunho();
                });
            });
        });
        
        episItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    atualizarTotais();
                    if (cargoItem && cargoItem.dispatchEvent) {
                        cargoItem.dispatchEvent(new Event('recalcular'));
                    }
                    salvarRascunho();
                });
            });
        });
        
        const uniformesHeader = uniformesBox.querySelector('.box-header');
        const episHeader = episBox.querySelector('.box-header');
        const uniformesMenuEl = uniformesMenu;
        const episMenuEl = episMenu;
        
        function toggleDropdown(headerEl, menu) {
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                    if (m.previousElementSibling) m.previousElementSibling.classList.remove('open');
                }
            });
            if (!isOpen) {
                menu.classList.add('open');
                headerEl.classList.add('open');
                menu.style.zIndex = '10000';
            } else {
                menu.classList.remove('open');
                headerEl.classList.remove('open');
                menu.style.zIndex = '';
            }
        }
        
        uniformesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(uniformesHeader, uniformesMenuEl);
        });
        episHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(episHeader, episMenuEl);
        });
        
        document.addEventListener('click', function(e) {
            if (!section.contains(e.target)) {
                document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
                    menu.classList.remove('open');
                    if (menu.previousElementSibling) menu.previousElementSibling.classList.remove('open');
                    menu.style.zIndex = '';
                });
            }
        });
        
        uniformesMenuEl.addEventListener('click', (e) => e.stopPropagation());
        episMenuEl.addEventListener('click', (e) => e.stopPropagation());
        
        atualizarTotais();
        
        return { 
            section, 
            atualizarTotais, 
            getDados: () => {
                const uniformes = {};
                uniformesItems.forEach(item => {
                    const qtd = item.getQuantidade();
                    if (qtd > 0) {
                        uniformes[item.getNome()] = {
                            quantidade: qtd,
                            depreciacao: item.getDepreciacao()
                        };
                    }
                });
                const epis = {};
                episItems.forEach(item => {
                    const qtd = item.getQuantidade();
                    if (qtd > 0) {
                        epis[item.getNome()] = {
                            quantidade: qtd,
                            depreciacao: item.getDepreciacao()
                        };
                    }
                });
                return { uniformes, epis };
            } 
        };
    }

    // Benefícios com nomes fixos e botão para adicionar customizados
    function criarBeneficiosSection(cargoItem, dadosBeneficios = {}, dadosBeneficiosPersonalizados = []) {
        const conteudoHtml = `
            <div class="beneficios-fixos">
                <h4 style="color: #c10404; margin-bottom: 0.8rem; font-size: 0.85rem;">Benefícios Fixos</h4>
                <div class="beneficios-fixos-grid"></div>
            </div>
            <div class="beneficios-custom">
                <h4 style="color: #c10404; margin-bottom: 0.8rem; font-size: 0.85rem; margin-top: 1rem;">Benefícios Personalizados</h4>
                <div class="beneficios-custom-grid"></div>
                <button type="button" class="btn-add-beneficio" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.5rem; border-radius: 30px; width: 100%; margin-top: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar Benefício
                </button>
            </div>
        `;
        const { section, updateSummary, content } = criarSecaoExpansivel('Benefícios', 'fa-gift', conteudoHtml, true);
        const fixosGrid = content.querySelector('.beneficios-fixos-grid');
        const customGrid = content.querySelector('.beneficios-custom-grid');
        const btnAdicionar = content.querySelector('.btn-add-beneficio');
        
        let customBeneficios = [...dadosBeneficiosPersonalizados];
        
        // Criar benefícios fixos
        BENEFICIOS_FIXOS.forEach(b => {
            const card = document.createElement('div');
            card.className = 'beneficio-fixo-card';
            card.style.cssText = 'background: linear-gradient(135deg, #141414 0%, #0d0d0d 100%); border: 1px solid #2a2a2a; border-radius: 20px; padding: 0.8rem 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;';
            const valorDiario = dadosBeneficios[b.campo]?.valorDiario ?? 0;
            const dias = dadosBeneficios[b.campo]?.dias ?? 0;
            card.innerHTML = `
                <div class="beneficio-nome" style="font-size: 0.9rem; font-weight: 600; color: #c10404; min-width: 120px;">${b.nome}</div>
                <div class="beneficio-campos" style="display: flex; gap: 1rem; flex: 1; justify-content: flex-start; align-items: center;">
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">R$ / dia</label>
                        <input type="text" class="beneficio-valor" data-campo="${b.campo}" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">Dias</label>
                        <input type="number" class="beneficio-dias" data-campo="${b.campo}" placeholder="0" value="${dias}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                </div>
                <div class="beneficio-total" style="font-size: 0.85rem; font-weight: 600; color: #c10404; text-align: right; min-width: 100px;">Total: R$ 0,00</div>
            `;
            fixosGrid.appendChild(card);
        });
        
        // Função para criar um benefício personalizado
        function criarBeneficioCustomizado(beneficio = null) {
            const card = document.createElement('div');
            card.className = 'beneficio-custom-card';
            card.style.cssText = 'background: linear-gradient(135deg, #141414 0%, #0d0d0d 100%); border: 1px solid #2a2a2a; border-radius: 20px; padding: 0.8rem 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;';
            const nome = beneficio?.nome || '';
            const valorDiario = beneficio?.valorDiario || 0;
            const dias = beneficio?.dias || 0;
            card.innerHTML = `
                <div class="beneficio-nome" style="min-width: 150px;">
                    <input type="text" class="beneficio-custom-nome" placeholder="Nome do benefício" value="${nome}" style="background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.4rem 0.8rem; color: #c10404; font-weight: 600; width: 100%;">
                </div>
                <div class="beneficio-campos" style="display: flex; gap: 1rem; flex: 1; justify-content: flex-start; align-items: center;">
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">R$ / dia</label>
                        <input type="text" class="beneficio-custom-valor" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">Dias</label>
                        <input type="number" class="beneficio-custom-dias" placeholder="0" value="${dias}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                </div>
                <div class="beneficio-total" style="font-size: 0.85rem; font-weight: 600; color: #c10404; text-align: right; min-width: 100px;">Total: R$ 0,00</div>
                <button type="button" class="btn-remover-beneficio" style="background: transparent; border: none; color: #c10404; cursor: pointer; font-size: 1rem; padding: 0.5rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            const btnRemover = card.querySelector('.btn-remover-beneficio');
            btnRemover.addEventListener('click', () => {
                card.remove();
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
            
            return card;
        }
        
        // Adicionar benefícios personalizados existentes
        customBeneficios.forEach(b => {
            customGrid.appendChild(criarBeneficioCustomizado(b));
        });
        
        // Botão para adicionar novo benefício personalizado
        btnAdicionar.addEventListener('click', () => {
            customGrid.appendChild(criarBeneficioCustomizado());
            calcularTotal();
            salvarRascunho();
        });
        
        function calcularTotal() {
            let total = 0;
            
            // Benefícios fixos
            fixosGrid.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let dias = parseInt(diasInput.value) || 0;
                const subtotal = valor * dias;
                total += subtotal;
                const totalSpan = card.querySelector('.beneficio-total');
                totalSpan.textContent = `Total: ${formatarMoeda(subtotal)}`;
            });
            
            // Benefícios personalizados
            customGrid.querySelectorAll('.beneficio-custom-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-custom-valor');
                const diasInput = card.querySelector('.beneficio-custom-dias');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let dias = parseInt(diasInput.value) || 0;
                const subtotal = valor * dias;
                total += subtotal;
                const totalSpan = card.querySelector('.beneficio-total');
                totalSpan.textContent = `Total: ${formatarMoeda(subtotal)}`;
            });
            
            updateSummary(total);
            return total;
        }
        
        // Event listeners para benefícios fixos
        fixosGrid.querySelectorAll('.beneficio-valor, .beneficio-dias').forEach(input => {
            input.addEventListener('input', function(e) {
                if (e.target.classList.contains('beneficio-valor')) {
                    let valor = e.target.value.replace(/\D/g, '');
                    e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                }
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        // Event listeners para benefícios personalizados (delegação)
        customGrid.addEventListener('input', function(e) {
            if (e.target.classList.contains('beneficio-custom-valor')) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            } else if (e.target.classList.contains('beneficio-custom-dias')) {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            } else if (e.target.classList.contains('beneficio-custom-nome')) {
                salvarRascunho();
            }
        });
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const beneficios = {};
            fixosGrid.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                const campo = card.querySelector('.beneficio-valor').dataset.campo;
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (valor > 0 || dias > 0) {
                    beneficios[campo] = { valorDiario: valor, dias: dias };
                }
            });
            
            const beneficiosPersonalizados = [];
            customGrid.querySelectorAll('.beneficio-custom-card').forEach(card => {
                const nomeInput = card.querySelector('.beneficio-custom-nome');
                const valorInput = card.querySelector('.beneficio-custom-valor');
                const diasInput = card.querySelector('.beneficio-custom-dias');
                const nome = nomeInput.value.trim();
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (nome && (valor > 0 || dias > 0)) {
                    beneficiosPersonalizados.push({ nome, valorDiario: valor, dias: dias });
                }
            });
            
            return { beneficios, beneficiosPersonalizados };
        } };
    }

    function criarSegurancaSection(cargoItem, dadosSeguranca = {}) {
        const conteudoHtml = `<div class="seguranca-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Segurança e Seguro', 'fa-shield-alt', conteudoHtml, true);
        const grid = content.querySelector('.seguranca-grid');
        
        SEGURANCA_FIXOS.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seguranca-item';
            const valorUnitario = dadosSeguranca[s.campo]?.valor ?? s.valor;
            const depreciacao = dadosSeguranca[s.campo]?.depreciacao ?? s.depreciacao;
            card.innerHTML = `
                <div class="seguranca-nome">${s.nome}</div>
                <div class="seguranca-campos">
                    <div class="seguranca-campo">
                        <label>Valor (R$)</label>
                        <input type="text" class="seguranca-valor" data-campo="${s.campo}" placeholder="0,00" value="${valorUnitario.toFixed(2).replace('.', ',')}">
                    </div>
                    <div class="seguranca-campo">
                        <label>Depreciação (meses)</label>
                        <input type="number" class="seguranca-depreciacao" data-campo="${s.campo}" placeholder="0" value="${depreciacao}" min="1" step="1">
                    </div>
                </div>
                <div class="seguranca-total">
                    <div>Total: R$ 0,00</div>
                    <div class="seguranca-mensal">Mensal: R$ 0,00</div>
                </div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let totalMensal = 0;
            let totalGeral = 0;
            grid.querySelectorAll('.seguranca-item').forEach(card => {
                const valorInput = card.querySelector('.seguranca-valor');
                const depreciacaoInput = card.querySelector('.seguranca-depreciacao');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let depreciacao = parseInt(depreciacaoInput.value) || 1;
                const totalMensalItem = valor / depreciacao;
                totalMensal += totalMensalItem;
                totalGeral += valor;
                const totalSpan = card.querySelector('.seguranca-total');
                totalSpan.innerHTML = `
                    <div>Total: ${formatarMoeda(valor)}</div>
                    <div class="seguranca-mensal">Mensal: ${formatarMoeda(totalMensalItem)}</div>
                `;
            });
            updateSummary(totalMensal);
            return { totalMensal, totalGeral };
        }
        
        grid.querySelectorAll('.seguranca-valor, .seguranca-depreciacao').forEach(input => {
            input.addEventListener('input', function(e) {
                if (e.target.classList.contains('seguranca-valor')) {
                    let valor = e.target.value.replace(/\D/g, '');
                    e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                }
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        calcularTotal();
        
        return { section, calcularTotal: () => calcularTotal().totalMensal, getDados: () => {
            const seguranca = {};
            grid.querySelectorAll('.seguranca-item').forEach(card => {
                const campo = card.querySelector('.seguranca-valor').dataset.campo;
                const valorInput = card.querySelector('.seguranca-valor');
                const depreciacaoInput = card.querySelector('.seguranca-depreciacao');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const depreciacao = parseInt(depreciacaoInput.value) || 1;
                if (valor > 0) {
                    seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                }
            });
            return seguranca;
        } };
    }

    function criarExamesSection(cargoItem, dadosExames = {}, treinamentoValor = 0) {
        const section = document.createElement('div');
        section.className = 'exames-section';
        
        const header = document.createElement('div');
        header.className = 'exames-header';
        header.innerHTML = `
            <div class="exames-title">
                <i class="fas fa-stethoscope"></i>
                <span>Exames e Treinamentos</span>
            </div>
            <div class="exames-summary">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down exames-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'exames-content';
        content.innerHTML = `
            <div class="exames-grid">
                <div class="exames-box">
                    <div class="box-header">
                        <h4><i class="fas fa-notes-medical"></i> Exames</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu exames-menu"></div>
                    <div class="exames-total">Total Exames: <span>R$ 0,00</span></div>
                </div>
                <div class="treinamento-box">
                    <h4><i class="fas fa-chalkboard-user"></i> NR / Ordem de Serviços / Treinamentos</h4>
                    <div class="treinamento-input">
                        <span>R$</span>
                        <input type="text" class="treinamento-valor" placeholder="0,00" value="${treinamentoValor.toFixed(2).replace('.', ',')}">
                    </div>
                </div>
            </div>
            <div class="exames-resumo">
                Total da seção: <span class="total-secao">R$ 0,00</span>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        header.querySelector('.exames-toggle').classList.remove('fa-chevron-down');
        header.querySelector('.exames-toggle').classList.add('fa-chevron-up');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-down');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-up');
            }
        });
        
        const examesBox = content.querySelector('.exames-box');
        const examesMenu = content.querySelector('.exames-menu');
        const examesTotalSpan = content.querySelector('.exames-total span');
        const treinamentoInput = content.querySelector('.treinamento-valor');
        const totalSecaoSpan = content.querySelector('.total-secao');
        
        const examesItems = [];
        
        // Adicionar exame Admissional/Demissional/Acuidade
        EXAMES_ADMISSIONAL.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames && dadosExames[e.nome] === true;
            itemDiv.innerHTML = `
                <div class="exames-item-nome">${e.nome}</div>
                <div class="exames-item-checkbox">
                    <span class="exames-item-preco">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''}>
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                obrigatorio: false
            });
        });
        
        // Adicionar exames complementares
        EXAMES_COMPLEMENTARES.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames && dadosExames[e.nome] === true;
            itemDiv.innerHTML = `
                <div class="exames-item-nome">${e.nome}</div>
                <div class="exames-item-checkbox">
                    <span class="exames-item-preco">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''}>
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                obrigatorio: false
            });
        });
        
        function calcularTotalExames() {
            let totalExames = 0;
            examesItems.forEach(item => {
                if (item.checkbox.checked) {
                    totalExames += item.preco;
                }
            });
            examesTotalSpan.textContent = formatarMoeda(totalExames);
            return totalExames;
        }
        
        function calcularTotal() {
            const totalExames = calcularTotalExames();
            let totalTreinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            const totalGeral = totalExames + totalTreinamento;
            totalSecaoSpan.textContent = formatarMoeda(totalGeral);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            return totalGeral;
        }
        
        // Event listeners
        examesItems.forEach(item => {
            item.checkbox.addEventListener('change', () => {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-exames'));
                }
            });
        });
        
        treinamentoInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '0,00';
            calcularTotal();
            salvarRascunho();
            if (cargoItem && cargoItem.dispatchEvent) {
                cargoItem.dispatchEvent(new Event('recalcular-exames'));
            }
        });
        
        // Dropdown toggle
        const examesHeader = examesBox.querySelector('.box-header');
        const examesMenuEl = examesMenu;
        
        function toggleDropdown(headerEl, menu) {
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.exames-box .dropdown-menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                    if (m.previousElementSibling) m.previousElementSibling.classList.remove('open');
                }
            });
            if (!isOpen) {
                menu.classList.add('open');
                headerEl.classList.add('open');
                menu.style.zIndex = '10000';
            } else {
                menu.classList.remove('open');
                headerEl.classList.remove('open');
                menu.style.zIndex = '';
            }
        }
        
        examesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(examesHeader, examesMenuEl);
        });
        
        document.addEventListener('click', function(e) {
            if (!section.contains(e.target)) {
                document.querySelectorAll('.exames-box .dropdown-menu.open').forEach(menu => {
                    menu.classList.remove('open');
                    if (menu.previousElementSibling) menu.previousElementSibling.classList.remove('open');
                    menu.style.zIndex = '';
                });
            }
        });
        
        examesMenuEl.addEventListener('click', (e) => e.stopPropagation());
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const exames = {};
            examesItems.forEach(item => {
                if (item.checkbox.checked) {
                    exames[item.nome] = true;
                }
            });
            const treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            return { exames, treinamento };
        } };
    }

    function criarInsumosSection(cargoItem, dadosInsumos = {}) {
        const conteudoHtml = `<div class="insumos-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Insumos', 'fa-boxes', conteudoHtml, true);
        const grid = content.querySelector('.insumos-grid');
        
        INSUMOS.forEach(i => {
            const card = document.createElement('div');
            card.className = 'insumo-card';
            const valor = dadosInsumos[i.campo]?.valor ?? 0;
            card.innerHTML = `
                <div class="insumo-nome">${i.nome}</div>
                <div class="insumo-campo">
                    <label>Valor (R$)</label>
                    <input type="text" class="insumo-valor" data-campo="${i.campo}" placeholder="0,00" value="${valor.toFixed(2).replace('.', ',')}">
                </div>
                <div class="insumo-total">R$ 0,00</div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let total = 0;
            grid.querySelectorAll('.insumo-card').forEach(card => {
                const valorInput = card.querySelector('.insumo-valor');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                total += valor;
                const totalSpan = card.querySelector('.insumo-total');
                totalSpan.textContent = formatarMoeda(valor);
            });
            updateSummary(total);
            return total;
        }
        
        grid.querySelectorAll('.insumo-valor').forEach(input => {
            input.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const insumos = {};
            grid.querySelectorAll('.insumo-card').forEach(card => {
                const campo = card.querySelector('.insumo-valor').dataset.campo;
                const valorInput = card.querySelector('.insumo-valor');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                if (valor > 0) {
                    insumos[campo] = { valor: valor };
                }
            });
            return insumos;
        } };
    }

    function criarDespesasSection(cargoItem, dadosDespesas = {}) {
        const section = document.createElement('div');
        section.className = 'despesas-section';
        
        const header = document.createElement('div');
        header.className = 'despesas-header';
        header.innerHTML = `
            <div class="despesas-title">
                <i class="fas fa-chart-line"></i>
                <span>Despesas</span>
            </div>
            <div class="despesas-summary">
                <span class="summary-label">Total Encargos Fiscais:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down despesas-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'despesas-content';
        content.innerHTML = `
            <div class="despesas-grid">
                <div class="despesa-card">
                    <div class="despesa-nome">Encargos Fiscais (Benefícios)</div>
                    <div class="despesa-campos">
                        <div class="despesa-campo">
                            <label>Taxa</label>
                            <input type="text" class="despesa-taxa" value="13,75%" disabled>
                        </div>
                    </div>
                    <div class="despesa-valor">R$ 0,00</div>
                    <div class="despesa-calculo"></div>
                </div>
            </div>
            <div class="despesas-total">
                <span>Total Encargos Fiscais:</span>
                <span>R$ 0,00</span>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        header.querySelector('.despesas-toggle').classList.remove('fa-chevron-down');
        header.querySelector('.despesas-toggle').classList.add('fa-chevron-up');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.despesas-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.despesas-toggle').classList.add('fa-chevron-down');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.despesas-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.despesas-toggle').classList.add('fa-chevron-up');
            }
        });
        
        const totalSpan = content.querySelector('.despesas-total span:last-child');
        const valorSpan = content.querySelector('.despesa-valor');
        const calculoSpan = content.querySelector('.despesa-calculo');
        
        function calcularDespesas(subtotalInsumosBeneficios) {
            const taxa = TAXA_ENCARGOS_FISCAIS;
            const valorEncargos = subtotalInsumosBeneficios * taxa;
            
            valorSpan.textContent = formatarMoeda(valorEncargos);
            calculoSpan.textContent = `(${formatarMoeda(subtotalInsumosBeneficios)} × ${(taxa * 100).toFixed(2)}%)`;
            totalSpan.textContent = formatarMoeda(valorEncargos);
            header.querySelector('.summary-value').textContent = formatarMoeda(valorEncargos);
            
            return valorEncargos;
        }
        
        return { section, calcularDespesas, getDados: () => {
            return { encargos_fiscais: { porcentagem: TAXA_ENCARGOS_FISCAIS * 100 } };
        } };
    }

    // ========== CRIAÇÃO DO CARGO ==========
    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, dadosAdicionais = {}, dadosUniformes = {}, dadosEpis = {}, dadosBeneficios = {}, dadosSeguranca = {}, dadosExames = {}, dadosInsumos = {}, dadosDespesas = {}, treinamentoValor = 0, beneficiosPersonalizados = []) {
        const item = document.createElement('div');
        item.className = 'cargo-item';
        
        // Header do cargo
        const header = document.createElement('div');
        header.className = 'cargo-header';
        header.innerHTML = `
            <div class="cargo-titulo">
                <i class="fas fa-briefcase"></i>
                <span>Cargo</span>
            </div>
            <button type="button" class="btn-remover" title="Remover cargo">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        item.appendChild(header);
        
        // Linha de campos básicos
        const linha = document.createElement('div');
        linha.className = 'cargo-linha';
        linha.innerHTML = `
            <div class="campo-pequeno">
                <label><i class="fas fa-briefcase"></i> Cargo</label>
                <input type="text" class="input-moderno cargo-nome" placeholder="Ex: Assistente" value="${cargo}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-hashtag"></i> Quant.</label>
                <input type="number" class="input-moderno cargo-quantidade" min="1" value="${quantidade}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-dollar-sign"></i> Salário (R$)</label>
                <input type="text" class="input-moderno cargo-salario" placeholder="0,00" value="${salario > 0 ? salario.toFixed(2).replace('.', ',') : ''}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-percent"></i> Encargos</label>
                <div class="campo-encargos">
                    <input type="text" class="input-moderno encargos-percentual" placeholder="113,00" value="113,00" style="width: 80px; text-align: center;">
                    <span>%</span>
                </div>
            </div>
        `;
        item.appendChild(linha);
        
        // Seção Adicionais
        const adicionaisHtml = `
            <div class="adicionais-grid">
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="he-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Horas Extras</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo he-conteudo hidden">
                        <div class="adicional-campo">
                            <span class="input-symbol"><i class="fas fa-clock"></i></span>
                            <input type="number" class="input-moderno he-horas" placeholder="Horas/mês" min="0" step="1">
                        </div>
                        <div class="adicional-valor he-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="an-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Ad. Noturno</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo an-conteudo hidden">
                        <div class="adicional-campo">
                            <span class="input-symbol"><i class="fas fa-moon"></i></span>
                            <input type="number" class="input-moderno an-horas" placeholder="Horas noturnas" min="0" step="1">
                        </div>
                        <div class="adicional-valor an-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="per-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Periculosidade</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo per-conteudo hidden">
                        <div class="adicional-valor per-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="ins-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Insalubridade</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo ins-conteudo hidden">
                        <div class="adicional-valor ins-resultado"></div>
                    </div>
                </div>
            </div>
        `;
        
        const { section: adicionaisSection, updateSummary: updateAdicionaisSummary, content: adicionaisContent } = criarSecaoExpansivel('Adicionais', 'fa-bolt', adicionaisHtml, true);
        item.appendChild(adicionaisSection);
        
        // Seção Uniformes e EPIs
        const { section: uniformesSection, atualizarTotais: atualizarUniformesTotais, getDados: getUniformesDados } = criarUniformesEpisSection(item, dadosUniformes, dadosEpis);
        item.appendChild(uniformesSection);
        
        // Seção Benefícios
        const { section: beneficiosSection, calcularTotal: calcularBeneficios, getDados: getBeneficiosDados } = criarBeneficiosSection(item, dadosBeneficios, beneficiosPersonalizados);
        item.appendChild(beneficiosSection);
        
        // Seção Segurança
        const { section: segurancaSection, calcularTotal: calcularSeguranca, getDados: getSegurancaDados } = criarSegurancaSection(item, dadosSeguranca);
        item.appendChild(segurancaSection);
        
        // Seção Exames e Treinamentos
        const { section: examesSection, calcularTotal: calcularExames, getDados: getExamesDados } = criarExamesSection(item, dadosExames, treinamentoValor);
        item.appendChild(examesSection);
        
        // Seção Insumos
        const { section: insumosSection, calcularTotal: calcularInsumos, getDados: getInsumosDados } = criarInsumosSection(item, dadosInsumos);
        item.appendChild(insumosSection);
        
        // Seção Despesas (Encargos Fiscais)
        const { section: despesasSection, calcularDespesas, getDados: getDespesasDados } = criarDespesasSection(item, dadosDespesas);
        item.appendChild(despesasSection);
        
        // Resultados
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);
        
        // Armazenar referências para uso nas funções
        item.__getUniformesDados = getUniformesDados;
        item.__getBeneficiosDados = getBeneficiosDados;
        item.__getSegurancaDados = getSegurancaDados;
        item.__getExamesDados = getExamesDados;
        item.__getInsumosDados = getInsumosDados;
        item.__getDespesasDados = getDespesasDados;
        
        function atualizarResultados() {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const valorHora = salario / HORAS_MENSAL;
            
            // Obter porcentagem de encargos do campo (valor em %)
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            let taxaEncargos = parseFloat(encargosPercentualInput.value.replace(/\./g, '').replace(',', '.')) || 113.00;
            taxaEncargos = taxaEncargos / 100; // Converter para decimal
            
            let totalAdicionais = 0;
            
            // Horas Extras
            const heCheck = adicionaisContent.querySelector('.he-check');
            const heConteudo = adicionaisContent.querySelector('.he-conteudo');
            const heResultado = adicionaisContent.querySelector('.he-resultado');
            if (heCheck && heCheck.checked) {
                const horas = parseFloat(adicionaisContent.querySelector('.he-horas')?.value) || 0;
                if (horas > 0) {
                    const valorHoraExtra = valorHora * 1.5 * horas;
                    const dsr = (valorHoraExtra / 25) * 5;
                    const encargosHE = (valorHoraExtra + dsr) * taxaEncargos;
                    const totalHE = valorHoraExtra + dsr + encargosHE;
                    if (heResultado) heResultado.innerHTML = `<span class="valor-label">Total Horas Extras</span><span class="valor-number">${formatarMoeda(totalHE)}</span>`;
                    totalAdicionais += totalHE;
                } else {
                    if (heResultado) heResultado.innerHTML = '';
                }
            } else {
                if (heResultado) heResultado.innerHTML = '';
            }
            if (heConteudo) heConteudo.classList.toggle('hidden', !(heCheck && heCheck.checked));
            
            // Adicional Noturno
            const anCheck = adicionaisContent.querySelector('.an-check');
            const anConteudo = adicionaisContent.querySelector('.an-conteudo');
            const anResultado = adicionaisContent.querySelector('.an-resultado');
            if (anCheck && anCheck.checked) {
                const horasNoturnas = parseFloat(adicionaisContent.querySelector('.an-horas')?.value) || 0;
                if (horasNoturnas > 0) {
                    const valorAdicionalNoturno = valorHora * 0.2 * horasNoturnas;
                    const encargosAN = valorAdicionalNoturno * taxaEncargos;
                    const totalAN = valorAdicionalNoturno + encargosAN;
                    if (anResultado) anResultado.innerHTML = `<span class="valor-label">Total Ad. Noturno</span><span class="valor-number">${formatarMoeda(totalAN)}</span>`;
                    totalAdicionais += totalAN;
                } else {
                    if (anResultado) anResultado.innerHTML = '';
                }
            } else {
                if (anResultado) anResultado.innerHTML = '';
            }
            if (anConteudo) anConteudo.classList.toggle('hidden', !(anCheck && anCheck.checked));
            
            // Periculosidade
            const perCheck = adicionaisContent.querySelector('.per-check');
            const perConteudo = adicionaisContent.querySelector('.per-conteudo');
            const perResultado = adicionaisContent.querySelector('.per-resultado');
            if (perCheck && perCheck.checked) {
                const periculosidade = salario * 0.3;
                const encargosPer = periculosidade * taxaEncargos;
                const totalPer = periculosidade + encargosPer;
                if (perResultado) perResultado.innerHTML = `<span class="valor-label">Total Periculosidade</span><span class="valor-number">${formatarMoeda(totalPer)}</span>`;
                totalAdicionais += totalPer;
            } else {
                if (perResultado) perResultado.innerHTML = '';
            }
            if (perConteudo) perConteudo.classList.toggle('hidden', !(perCheck && perCheck.checked));
            
            // Insalubridade
            const insCheck = adicionaisContent.querySelector('.ins-check');
            const insConteudo = adicionaisContent.querySelector('.ins-conteudo');
            const insResultado = adicionaisContent.querySelector('.ins-resultado');
            if (insCheck && insCheck.checked) {
                const insalubridade = SALARIO_MINIMO * 0.2;
                const encargosIns = insalubridade * taxaEncargos;
                const totalIns = insalubridade + encargosIns;
                if (insResultado) insResultado.innerHTML = `<span class="valor-label">Total Insalubridade</span><span class="valor-number">${formatarMoeda(totalIns)}</span>`;
                totalAdicionais += totalIns;
            } else {
                if (insResultado) insResultado.innerHTML = '';
            }
            if (insConteudo) insConteudo.classList.toggle('hidden', !(insCheck && insCheck.checked));
            
            updateAdicionaisSummary(totalAdicionais);
            
            // Uniformes e EPIs (já são valores mensais por causa da depreciação)
            const uniformesData = atualizarUniformesTotais();
            const totalUniformeEpi = uniformesData?.totalGeral || 0;
            
            // Benefícios
            const totalBeneficios = calcularBeneficios();
            
            // Segurança (valor mensal)
            const totalSeguranca = calcularSeguranca();
            
            // Exames e Treinamentos
            const totalExames = calcularExames();
            
            // Insumos
            const totalInsumos = calcularInsumos();
            
            // ========== CÁLCULOS TERCEIRIZADO ==========
            // SUB TOTAL SALARIO + ENCARGOS
            const valorEncargos = salario * taxaEncargos;
            const subtotalSalarioEncargos = salario + valorEncargos + totalAdicionais;
            
            // SUB TOTAL DOS INSUMOS E BENEFICIOS (todos já são valores mensais)
            const subtotalInsumosBeneficios = totalUniformeEpi + totalBeneficios + totalSeguranca + totalExames + totalInsumos;
            
            // Calcular Encargos Fiscais (13,75% sobre subtotalInsumosBeneficios)
            const despesasResult = calcularDespesas(subtotalInsumosBeneficios);
            
            // Total final da vaga
            const totalFinalVaga = subtotalSalarioEncargos + subtotalInsumosBeneficios + despesasResult;
            
            // Atualizar o campo de porcentagem de encargos
            encargosPercentualInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                atualizarResultados();
                salvarRascunho();
            });
            
            let resultadosHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Encargos (${(taxaEncargos * 100).toFixed(2)}%)</span>
                    <span class="valor">${formatarMoeda(valorEncargos)}</span>
                </div>
            `;
            if (totalAdicionais > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-plus-circle"></i> Adicionais (c/ encargos)</span>
                        <span class="valor">${formatarMoeda(totalAdicionais)}</span>
                    </div>
                `;
            }
            resultadosHTML += `
                <div class="resultado-bloco subtotal-cargo">
                    <span class="rotulo"><i class="fas fa-file-invoice"></i> SUB TOTAL SALARIO + ENCARGOS</span>
                    <span class="valor">${formatarMoeda(subtotalSalarioEncargos)}</span>
                </div>
            `;
            
            if (totalUniformeEpi > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-tshirt"></i> Uniformes/EPIs</span>
                        <span class="valor">${formatarMoeda(totalUniformeEpi)}</span>
                    </div>
                `;
            }
            if (totalBeneficios > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-gift"></i> Benefícios</span>
                        <span class="valor">${formatarMoeda(totalBeneficios)}</span>
                    </div>
                `;
            }
            if (totalSeguranca > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-shield-alt"></i> SST + Seguro</span>
                        <span class="valor">${formatarMoeda(totalSeguranca)}</span>
                    </div>
                `;
            }
            if (totalExames > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-stethoscope"></i> Exames e Treinamentos</span>
                        <span class="valor">${formatarMoeda(totalExames)}</span>
                    </div>
                `;
            }
            if (totalInsumos > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-boxes"></i> Insumos</span>
                        <span class="valor">${formatarMoeda(totalInsumos)}</span>
                    </div>
                `;
            }
            resultadosHTML += `
                <div class="resultado-bloco subtotal-insumos">
                    <span class="rotulo"><i class="fas fa-boxes"></i> SUB TOTAL DOS INSUMOS E BENEFICIOS</span>
                    <span class="valor">${formatarMoeda(subtotalInsumosBeneficios)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-chart-line"></i> Encargos Fiscais (Benefícios)</span>
                    <span class="valor">${formatarMoeda(despesasResult)}</span>
                </div>
                <div class="resultado-bloco total-prestacao">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Total da vaga</span>
                    <span class="valor" style="color: #c10404; font-size: 1.2rem;">${formatarMoeda(totalFinalVaga)}</span>
                </div>
            `;
            resultadosDiv.innerHTML = resultadosHTML;
            calcularTotalGeral();
        }
        
        // Event listeners
        item.querySelector('.cargo-nome').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-quantidade').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
            atualizarResultados();
            salvarRascunho();
        });
        
        adicionaisContent.querySelectorAll('.he-check, .an-check, .per-check, .ins-check').forEach(chk => {
            chk.addEventListener('change', () => { atualizarResultados(); salvarRascunho(); });
        });
        adicionaisContent.querySelectorAll('.he-horas, .an-horas').forEach(input => {
            input.addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        });
        
        item.addEventListener('recalcular', atualizarResultados);
        item.addEventListener('recalcular-despesas', atualizarResultados);
        item.addEventListener('recalcular-exames', atualizarResultados);
        
        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });
        
        // Preencher dados adicionais se existirem
        if (dadosAdicionais) {
            if (dadosAdicionais.horasExtras && adicionaisContent.querySelector('.he-check')) adicionaisContent.querySelector('.he-check').checked = true;
            if (dadosAdicionais.noturno && adicionaisContent.querySelector('.an-check')) adicionaisContent.querySelector('.an-check').checked = true;
            if (dadosAdicionais.periculosidade && adicionaisContent.querySelector('.per-check')) adicionaisContent.querySelector('.per-check').checked = true;
            if (dadosAdicionais.insalubridade && adicionaisContent.querySelector('.ins-check')) adicionaisContent.querySelector('.ins-check').checked = true;
            if (dadosAdicionais.heHoras && adicionaisContent.querySelector('.he-horas')) adicionaisContent.querySelector('.he-horas').value = dadosAdicionais.heHoras;
            if (dadosAdicionais.anHoras && adicionaisContent.querySelector('.an-horas')) adicionaisContent.querySelector('.an-horas').value = dadosAdicionais.anHoras;
        }
        
        // Preencher porcentagem de encargos
        if (dadosAdicionais && dadosAdicionais.encargosPercentual) {
            const encargosInput = item.querySelector('.encargos-percentual');
            if (encargosInput) {
                encargosInput.value = dadosAdicionais.encargosPercentual.toFixed(2).replace('.', ',');
            }
        }
        
        atualizarResultados();
        return item;
    }
    
    // ========== CARREGAR PROPOSTA EXISTENTE ==========
    async function carregarPropostaExistente() {
        const urlParams = new URLSearchParams(window.location.search);
        const propostaId = urlParams.get('id');
        const vendedorParam = urlParams.get('vendedor');
        
        if (vendedorParam) {
            document.getElementById('vendedor-nome').textContent = vendedorParam;
        }
        
        if (propostaId) {
            try {
                const doc = await db.collection('propostas').doc(propostaId).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (!vendedorParam) {
                        document.getElementById('vendedor-nome').textContent = data.vendedor || 'Não informado';
                    }
                    clienteInput.value = data.cliente || '';
                    container.innerHTML = '';
                    if (data.cargos && data.cargos.length > 0) {
                        data.cargos.forEach(c => {
                            container.appendChild(criarCargoItem(
                                c.nome,
                                c.quantidade,
                                c.salario,
                                c.adicionais || {},
                                c.uniformes || {},
                                c.epis || {},
                                c.beneficios || {},
                                c.seguranca || {},
                                c.exames || {},
                                c.insumos || {},
                                c.despesas || {},
                                c.treinamento || 0,
                                c.beneficiosPersonalizados || []
                            ));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
            }
        }
    }
    
    await carregarPropostaExistente();
    
    // Botão adicionar cargo
    btnAdicionar.addEventListener('click', function() {
        const novoCargo = criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []);
        container.appendChild(novoCargo);
        calcularTotalGeral();
        salvarRascunho();
    });
    
    // ========== TEMA CLARO/ESCURO ==========
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_terceirizado');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        if (temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
        }
        
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('tema_terceirizado', isLight ? 'light' : 'dark');
                
                if (iconTema) {
                    if (isLight) {
                        iconTema.classList.remove('fa-moon');
                        iconTema.classList.add('fa-sun');
                    } else {
                        iconTema.classList.remove('fa-sun');
                        iconTema.classList.add('fa-moon');
                    }
                }
            });
        }
    }
    
    // ========== COMPARTILHAR LINK ==========
    function initCompartilhar() {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
        const modalShare = document.getElementById('modal-share');
        const shareLinkInput = document.getElementById('share-link');
        const btnCopiarLink = document.getElementById('btn-copiar-link');
        const modalShareOk = document.getElementById('modal-share-ok');
        
        if (!btnCompartilhar) return;
        
        btnCompartilhar.addEventListener('click', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const propostaId = urlParams.get('id');
            
            if (!propostaId) {
                mostrarModal('Salve a proposta primeiro antes de compartilhar.');
                return;
            }
            
            const linkVisualizacao = `${window.location.origin}${window.location.pathname}?id=${propostaId}&visualizacao=true`;
            if (shareLinkInput) shareLinkInput.value = linkVisualizacao;
            if (modalShare) modalShare.classList.remove('hidden');
        });
        
        if (btnCopiarLink && shareLinkInput) {
            btnCopiarLink.addEventListener('click', () => {
                shareLinkInput.select();
                document.execCommand('copy');
                mostrarModal('Link copiado para a área de transferência!');
            });
        }
        
        if (modalShareOk && modalShare) {
            modalShareOk.addEventListener('click', () => modalShare.classList.add('hidden'));
            modalShare.addEventListener('click', (e) => {
                if (e.target === modalShare) modalShare.classList.add('hidden');
            });
        }
    }
    
    // ========== GERAR PDF PROFISSIONAL - VERSÃO SIMPLIFICADA E CORRIGIDA ==========
    function gerarPDFProfissional() {
        // Coletar dados do cliente
        const clienteNome = clienteInput.value || 'Não informado';
        const vendedorNome = document.getElementById('vendedor-nome').textContent;
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        
        // Criar o conteúdo HTML do PDF
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Proposta Terceirizado</title>
            <style>
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #c10404;
                }
                .header h1 {
                    color: #c10404;
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    color: #666;
                    margin: 5px 0 0;
                    font-size: 12px;
                }
                .info-cliente {
                    background: #f9f9f9;
                    padding: 12px 15px;
                    border-radius: 6px;
                    margin-bottom: 25px;
                    border: 1px solid #e0e0e0;
                }
                .info-cliente table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .info-cliente td {
                    padding: 5px 0;
                }
                .info-cliente td:first-child {
                    width: 100px;
                    font-weight: bold;
                }
                .cargo-box {
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    page-break-inside: avoid;
                }
                .cargo-header {
                    background: #f5f5f5;
                    padding: 10px 15px;
                    border-bottom: 1px solid #ddd;
                }
                .cargo-header h2 {
                    color: #c10404;
                    margin: 0;
                    font-size: 18px;
                }
                .cargo-header p {
                    margin: 5px 0 0;
                    color: #666;
                    font-size: 12px;
                }
                .cargo-content {
                    padding: 15px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 13px;
                }
                td {
                    padding: 6px 10px;
                    border: 1px solid #e0e0e0;
                }
                .bg-gray {
                    background: #f9f9f9;
                }
                .bg-light {
                    background: #f0f0f0;
                }
                .bg-dark {
                    background: #e8e8e8;
                }
                h3 {
                    color: #c10404;
                    font-size: 14px;
                    margin: 10px 0 5px;
                }
                ul {
                    margin: 0 0 10px 20px;
                    font-size: 12px;
                }
                .total-box {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 20px;
                    text-align: center;
                    border: 1px solid #e0e0e0;
                }
                .total-box p {
                    margin: 0;
                }
                .total-value {
                    font-size: 28px;
                    font-weight: bold;
                    color: #c10404;
                    margin-top: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                    font-size: 10px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Prompt Serviços</h1>
                <p>Proposta Comercial - Contrato Terceirizado</p>
                <p style="font-size: 10px;">Documento gerado em ${dataAtual} às ${horaAtual}</p>
            </div>
            
            <div class="info-cliente">
                <table>
                    <tr><td>Cliente:</td><td>${clienteNome}</td></tr>
                    <tr><td>Vendedor:</td><td>${vendedorNome}</td></tr>
                    <tr><td>Data:</td><td>${dataAtual}</td></tr>
                </table>
            </div>
        `;
        
        // Coletar dados de cada cargo
        let cargoIndex = 0;
        document.querySelectorAll('.cargo-item').forEach((cargo) => {
            cargoIndex++;
            
            const cargoNome = cargo.querySelector('.cargo-nome')?.value || 'Cargo sem nome';
            const quantidade = parseInt(cargo.querySelector('.cargo-quantidade')?.value) || 1;
            const salarioInput = cargo.querySelector('.cargo-salario')?.value || '0';
            const salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            
            // Encargos
            const encargosPercentualInput = cargo.querySelector('.encargos-percentual')?.value || '113,00';
            const encargosPercentual = parseFloat(encargosPercentualInput.replace(/\./g, '').replace(',', '.')) || 113;
            const taxaEncargos = encargosPercentual / 100;
            const valorEncargos = salario * taxaEncargos;
            
            // Adicionais
            let totalAdicionais = 0;
            let adicionaisLista = [];
            
            const heCheck = cargo.querySelector('.he-check')?.checked;
            const anCheck = cargo.querySelector('.an-check')?.checked;
            const perCheck = cargo.querySelector('.per-check')?.checked;
            const insCheck = cargo.querySelector('.ins-check')?.checked;
            
            if (heCheck) {
                const horas = parseFloat(cargo.querySelector('.he-horas')?.value) || 0;
                if (horas > 0) {
                    const valorHora = salario / 220;
                    const valorHoraExtra = valorHora * 1.5 * horas;
                    const dsr = (valorHoraExtra / 25) * 5;
                    const encargosHE = (valorHoraExtra + dsr) * taxaEncargos;
                    const totalHE = valorHoraExtra + dsr + encargosHE;
                    totalAdicionais += totalHE;
                    adicionaisLista.push(`Horas Extras: ${horas}h/mês - R$ ${totalHE.toFixed(2).replace('.', ',')}`);
                }
            }
            if (anCheck) {
                const horasNoturnas = parseFloat(cargo.querySelector('.an-horas')?.value) || 0;
                if (horasNoturnas > 0) {
                    const valorHora = salario / 220;
                    const valorAdicionalNoturno = valorHora * 0.2 * horasNoturnas;
                    const encargosAN = valorAdicionalNoturno * taxaEncargos;
                    const totalAN = valorAdicionalNoturno + encargosAN;
                    totalAdicionais += totalAN;
                    adicionaisLista.push(`Adicional Noturno: ${horasNoturnas}h/mês - R$ ${totalAN.toFixed(2).replace('.', ',')}`);
                }
            }
            if (perCheck) {
                const periculosidade = salario * 0.3;
                const encargosPer = periculosidade * taxaEncargos;
                const totalPer = periculosidade + encargosPer;
                totalAdicionais += totalPer;
                adicionaisLista.push(`Periculosidade (30%) - R$ ${totalPer.toFixed(2).replace('.', ',')}`);
            }
            if (insCheck) {
                const insalubridade = 1621 * 0.2;
                const encargosIns = insalubridade * taxaEncargos;
                const totalIns = insalubridade + encargosIns;
                totalAdicionais += totalIns;
                adicionaisLista.push(`Insalubridade (20% do SM) - R$ ${totalIns.toFixed(2).replace('.', ',')}`);
            }
            
            const subtotalSalarioEncargos = salario + valorEncargos + totalAdicionais;
            
            // Uniformes
            let uniformesLista = [];
            let totalUniformes = 0;
            cargo.querySelectorAll('.uniformes-box .item-lista').forEach(item => {
                const nome = item.querySelector('.item-nome')?.textContent;
                const qtd = parseInt(item.querySelector('.quantidade-uniforme')?.value) || 0;
                const depreciacao = parseInt(item.querySelector('.depreciacao-uniforme')?.value) || 1;
                const precoTexto = item.querySelector('.item-preco')?.textContent || 'R$ 0,00';
                const preco = parseFloat(precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                if (qtd > 0) {
                    const total = (qtd * preco) / depreciacao;
                    totalUniformes += total;
                    uniformesLista.push(`${nome}: ${qtd} un. (depreciação ${depreciacao} meses) - R$ ${total.toFixed(2).replace('.', ',')}/mês`);
                }
            });
            
            // EPIs
            let episLista = [];
            let totalEpis = 0;
            cargo.querySelectorAll('.epis-box .item-lista').forEach(item => {
                const nome = item.querySelector('.item-nome')?.textContent;
                const qtd = parseInt(item.querySelector('.quantidade-epi')?.value) || 0;
                const depreciacao = parseInt(item.querySelector('.depreciacao-epi')?.value) || 1;
                const precoTexto = item.querySelector('.item-preco')?.textContent || 'R$ 0,00';
                const preco = parseFloat(precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                if (qtd > 0) {
                    const total = (qtd * preco) / depreciacao;
                    totalEpis += total;
                    episLista.push(`${nome}: ${qtd} un. (depreciação ${depreciacao} meses) - R$ ${total.toFixed(2).replace('.', ',')}/mês`);
                }
            });
            
            // Benefícios
            let beneficiosLista = [];
            let totalBeneficios = 0;
            cargo.querySelectorAll('.beneficio-fixo-card, .beneficio-custom-card').forEach(card => {
                let nome = '';
                let valor = 0;
                let dias = 0;
                
                if (card.classList.contains('beneficio-fixo-card')) {
                    nome = card.querySelector('.beneficio-nome')?.textContent || '';
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    valor = parseFloat(valorInput?.value?.replace(/\./g, '').replace(',', '.') || 0);
                    dias = parseInt(diasInput?.value) || 0;
                } else {
                    nome = card.querySelector('.beneficio-custom-nome')?.value || '';
                    const valorInput = card.querySelector('.beneficio-custom-valor');
                    const diasInput = card.querySelector('.beneficio-custom-dias');
                    valor = parseFloat(valorInput?.value?.replace(/\./g, '').replace(',', '.') || 0);
                    dias = parseInt(diasInput?.value) || 0;
                }
                
                if (nome && valor > 0 && dias > 0) {
                    const subtotal = valor * dias;
                    totalBeneficios += subtotal;
                    beneficiosLista.push(`${nome}: R$ ${valor.toFixed(2).replace('.', ',')}/dia × ${dias} dias = R$ ${subtotal.toFixed(2).replace('.', ',')}`);
                }
            });
            
            // Segurança
            let segurancaLista = [];
            let totalSeguranca = 0;
            cargo.querySelectorAll('.seguranca-item').forEach(item => {
                const nome = item.querySelector('.seguranca-nome')?.textContent;
                const valorInput = item.querySelector('.seguranca-valor');
                const depreciacaoInput = item.querySelector('.seguranca-depreciacao');
                const valor = parseFloat(valorInput?.value?.replace(/\./g, '').replace(',', '.') || 0);
                const depreciacao = parseInt(depreciacaoInput?.value) || 1;
                if (valor > 0) {
                    const mensal = valor / depreciacao;
                    totalSeguranca += mensal;
                    segurancaLista.push(`${nome}: R$ ${valor.toFixed(2).replace('.', ',')} (depreciação ${depreciacao} meses) = R$ ${mensal.toFixed(2).replace('.', ',')}/mês`);
                }
            });
            
            // Exames
            let examesLista = [];
            let totalExames = 0;
            cargo.querySelectorAll('.exame-checkbox:checked').forEach(cb => {
                const nome = cb.dataset.nome;
                const preco = parseFloat(cb.dataset.preco);
                if (nome && preco) {
                    totalExames += preco;
                    examesLista.push(`${nome}: R$ ${preco.toFixed(2).replace('.', ',')}`);
                }
            });
            const treinamentoInput = cargo.querySelector('.treinamento-valor');
            const treinamento = parseFloat(treinamentoInput?.value?.replace(/\./g, '').replace(',', '.') || 0);
            if (treinamento > 0) {
                totalExames += treinamento;
                examesLista.push(`Treinamentos: R$ ${treinamento.toFixed(2).replace('.', ',')}`);
            }
            
            // Insumos
            let insumosLista = [];
            let totalInsumos = 0;
            cargo.querySelectorAll('.insumo-card').forEach(card => {
                const nome = card.querySelector('.insumo-nome')?.textContent;
                const valorInput = card.querySelector('.insumo-valor');
                const valor = parseFloat(valorInput?.value?.replace(/\./g, '').replace(',', '.') || 0);
                if (valor > 0) {
                    totalInsumos += valor;
                    insumosLista.push(`${nome}: R$ ${valor.toFixed(2).replace('.', ',')}`);
                }
            });
            
            // Totais
            const subtotalInsumosBeneficios = totalUniformes + totalEpis + totalBeneficios + totalSeguranca + totalExames + totalInsumos;
            const encargosFiscais = subtotalInsumosBeneficios * 0.1375;
            const totalVaga = subtotalSalarioEncargos + subtotalInsumosBeneficios + encargosFiscais;
            const totalVagas = totalVaga * quantidade;
            
            // Adicionar cargo ao HTML
            htmlContent += `
            <div class="cargo-box">
                <div class="cargo-header">
                    <h2>${cargoIndex}. ${cargoNome}</h2>
                    <p>Quantidade: ${quantidade} vaga(s)</p>
                </div>
                <div class="cargo-content">
                    <table>
                        <tr class="bg-gray"><td><strong>Salário Base</strong></td><td style="text-align:right">R$ ${salario.toFixed(2).replace('.', ',')}</td></tr>
                        <tr><td><strong>Encargos (${encargosPercentual.toFixed(2)}%)</strong></td><td style="text-align:right">R$ ${valorEncargos.toFixed(2).replace('.', ',')}</td></tr>
                        ${totalAdicionais > 0 ? `<tr class="bg-gray"><td><strong>Adicionais</strong></td><td style="text-align:right">R$ ${totalAdicionais.toFixed(2).replace('.', ',')}</td></tr>` : ''}
                        <tr class="bg-light"><td><strong>SUB TOTAL SALARIO + ENCARGOS</strong></td><td style="text-align:right;font-weight:bold">R$ ${subtotalSalarioEncargos.toFixed(2).replace('.', ',')}</td></tr>
                    </table>
            `;
            
            if (uniformesLista.length > 0) {
                htmlContent += `<h3>Uniformes</h3><ul>${uniformesLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (episLista.length > 0) {
                htmlContent += `<h3>EPIs</h3><ul>${episLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (beneficiosLista.length > 0) {
                htmlContent += `<h3>Benefícios</h3><ul>${beneficiosLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (segurancaLista.length > 0) {
                htmlContent += `<h3>Segurança e Seguro</h3><ul>${segurancaLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (examesLista.length > 0) {
                htmlContent += `<h3>Exames e Treinamentos</h3><ul>${examesLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (insumosLista.length > 0) {
                htmlContent += `<h3>Insumos</h3><ul>${insumosLista.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            
            htmlContent += `
                    <table>
                        <tr class="bg-gray"><td><strong>SUB TOTAL INSUMOS E BENEFÍCIOS</strong></td><td style="text-align:right">R$ ${subtotalInsumosBeneficios.toFixed(2).replace('.', ',')}</td></tr>
                        <tr><td><strong>Encargos Fiscais (13,75%)</strong></td><td style="text-align:right">R$ ${encargosFiscais.toFixed(2).replace('.', ',')}</td></tr>
                        <tr class="bg-light"><td><strong>Total por vaga</strong></td><td style="text-align:right;font-weight:bold">R$ ${totalVaga.toFixed(2).replace('.', ',')}</td></tr>
                        <tr class="bg-dark"><td><strong>Total (${quantidade} vaga(s))</strong></td><td style="text-align:right;font-weight:bold;color:#c10404">R$ ${totalVagas.toFixed(2).replace('.', ',')}</td></tr>
                    </table>
                </div>
            </div>
            `;
        });
        
        // Calcular total geral
        let totalGeral = 0;
        document.querySelectorAll('.cargo-item').forEach(item => {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                const totalValor = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                totalGeral += totalValor * qtd;
            }
        });
        
        // Fechar HTML
        htmlContent += `
            <div class="total-box">
                <p><strong>TOTAL DA PROPOSTA</strong></p>
                <div class="total-value">R$ ${totalGeral.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="footer">
                <p>Prompt Serviços - CNPJ: XX.XXX.XXX/0001-XX</p>
                <p>Este documento é uma proposta comercial e tem validade de 30 dias.</p>
            </div>
        </body>
        </html>
        `;
        
        // Criar um blob e gerar o PDF
        const opt = {
            margin: [0.4, 0.4, 0.4, 0.4],
            filename: `Proposta_Terceirizado_${clienteInput.value || 'SemCliente'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff', logging: false, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        // Usar um elemento temporário para gerar o PDF
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.innerHTML = htmlContent;
        document.body.appendChild(tempContainer);
        
        html2pdf().set(opt).from(tempContainer).save().then(() => {
            document.body.removeChild(tempContainer);
        }).catch((error) => {
            console.error('Erro ao gerar PDF:', error);
            document.body.removeChild(tempContainer);
            alert('Erro ao gerar PDF. Tente novamente.');
        });
    }
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            // Modo visualização - desabilitar TODAS as edições
            
            // Desabilitar todos os inputs e selects
            document.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.7';
                el.style.cursor = 'not-allowed';
                el.style.pointerEvents = 'none';
            });
            
            // Desabilitar checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.disabled = true;
                cb.style.pointerEvents = 'none';
            });
            
            // Esconder todos os botões de ação
            document.querySelectorAll('.btn-add, #btn-gerar-pdf, #btn-salvar, .btn-remover, .btn-tema, .btn-compartilhar, .btn-add-beneficio, .btn-remover-beneficio').forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            // Esconder botão adicionar cargo
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            // Esconder botão voltar
            const btnVoltar = document.getElementById('btn-voltar');
            if (btnVoltar) btnVoltar.style.display = 'none';
            
            // Esconder botões de expansão (deixar tudo expandido)
            document.querySelectorAll('.section-toggle, .despesas-toggle, .exames-toggle').forEach(toggle => {
                if (toggle) toggle.style.display = 'none';
            });
            
            // Expandir todas as seções para visualização
            document.querySelectorAll('.section-content.collapsed, .despesas-content.collapsed, .exames-content.collapsed').forEach(content => {
                if (content) content.classList.remove('collapsed');
            });
            
            // Desabilitar dropdowns
            document.querySelectorAll('.box-header').forEach(header => {
                header.style.pointerEvents = 'none';
                header.style.cursor = 'default';
            });
            
            // Adicionar aviso de visualização no topo
            const aviso = document.createElement('div');
            aviso.className = 'aviso-visualizacao';
            aviso.innerHTML = `
                <div style="background: #c10404; color: #fff; text-align: center; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-eye"></i> <strong>Modo de visualização</strong> - Esta proposta é apenas para leitura
                </div>
            `;
            const containerDiv = document.querySelector('.container');
            if (containerDiv) {
                if (!containerDiv.querySelector('.aviso-visualizacao')) {
                    containerDiv.insertBefore(aviso, containerDiv.firstChild);
                }
            }
            
            // Desabilitar clique nos cards de benefícios personalizados
            document.querySelectorAll('.btn-remover-beneficio').forEach(btn => {
                btn.style.display = 'none';
            });
            
            // Desabilitar adicionar benefício
            const btnAddBeneficio = document.querySelector('.btn-add-beneficio');
            if (btnAddBeneficio) btnAddBeneficio.style.display = 'none';
        }
    }
    
    // ========== SALVAR PROPOSTA ==========
    document.getElementById('btn-salvar').addEventListener('click', async function() {
        const vendedor = document.getElementById('vendedor-nome').textContent;
        const cliente = clienteInput.value || 'SEM CLIENTE';
        const urlParams = new URLSearchParams(window.location.search);
        const propostaId = urlParams.get('id');
        
        const cargos = [];
        document.querySelectorAll('.cargo-item').forEach(item => {
            const nome = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            const salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            const encargosPercentual = parseFloat(encargosPercentualInput?.value.replace(/\./g, '').replace(',', '.')) || 113.00;
            
            const adicionaisSection = item.querySelector('.expandable-section:first-child .section-content');
            const heCheck = adicionaisSection?.querySelector('.he-check');
            const anCheck = adicionaisSection?.querySelector('.an-check');
            const perCheck = adicionaisSection?.querySelector('.per-check');
            const insCheck = adicionaisSection?.querySelector('.ins-check');
            const heHoras = parseFloat(adicionaisSection?.querySelector('.he-horas')?.value) || 0;
            const anHoras = parseFloat(adicionaisSection?.querySelector('.an-horas')?.value) || 0;
            
            const uniformesSection = item.querySelectorAll('.expandable-section')[1];
            let uniformes = {}, epis = {};
            if (uniformesSection && uniformesSection.__getUniformesDados) {
                const dados = uniformesSection.__getUniformesDados();
                uniformes = dados.uniformes || {};
                epis = dados.epis || {};
            } else {
                const uniformesBox = item.querySelector('.uniformes-box');
                if (uniformesBox) {
                    uniformesBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nomeItem = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-uniforme');
                        const depInput = lista.querySelector('.depreciacao-uniforme');
                        if (nomeItem && qtdInput && parseInt(qtdInput.value) > 0) {
                            uniformes[nomeItem] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
                const episBox = item.querySelector('.epis-box');
                if (episBox) {
                    episBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nomeItem = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-epi');
                        const depInput = lista.querySelector('.depreciacao-epi');
                        if (nomeItem && qtdInput && parseInt(qtdInput.value) > 0) {
                            epis[nomeItem] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
            }
            
            const beneficiosSection = item.querySelectorAll('.expandable-section')[2];
            let beneficios = {};
            let beneficiosPersonalizados = [];
            if (beneficiosSection && beneficiosSection.__getBeneficiosDados) {
                const dados = beneficiosSection.__getBeneficiosDados();
                beneficios = dados.beneficios || {};
                beneficiosPersonalizados = dados.beneficiosPersonalizados || [];
            } else {
                item.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                    const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (valor > 0 || dias > 0) {
                        beneficios[campo] = { valorDiario: valor, dias: dias };
                    }
                });
                item.querySelectorAll('.beneficio-custom-card').forEach(card => {
                    const nomeInput = card.querySelector('.beneficio-custom-nome');
                    const valorInput = card.querySelector('.beneficio-custom-valor');
                    const diasInput = card.querySelector('.beneficio-custom-dias');
                    const nome = nomeInput?.value.trim() || '';
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (nome && (valor > 0 || dias > 0)) {
                        beneficiosPersonalizados.push({ nome, valorDiario: valor, dias: dias });
                    }
                });
            }
            
            const segurancaSection = item.querySelectorAll('.expandable-section')[3];
            let seguranca = {};
            if (segurancaSection && segurancaSection.__getSegurancaDados) {
                seguranca = segurancaSection.__getSegurancaDados();
            } else {
                item.querySelectorAll('.seguranca-item').forEach(card => {
                    const campo = card.querySelector('.seguranca-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.seguranca-valor');
                    const depInput = card.querySelector('.seguranca-depreciacao');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const depreciacao = parseInt(depInput?.value) || 1;
                    if (valor > 0) {
                        seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                    }
                });
            }
            
            const examesSection = item.querySelectorAll('.expandable-section')[4];
            let exames = {};
            let treinamento = 0;
            if (examesSection && examesSection.__getExamesDados) {
                const dados = examesSection.__getExamesDados();
                exames = dados.exames || {};
                treinamento = dados.treinamento || 0;
            } else if (examesSection) {
                const examesData = { exames: {}, treinamento: 0 };
                examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                    if (cb.checked) {
                        examesData.exames[cb.dataset.nome] = true;
                    }
                });
                const treinamentoInputExames = examesSection.querySelector('.treinamento-valor');
                if (treinamentoInputExames) {
                    examesData.treinamento = parseFloat(treinamentoInputExames.value.replace(/\./g, '').replace(',', '.')) || 0;
                }
                exames = examesData.exames;
                treinamento = examesData.treinamento;
            }
            
            const insumosSection = item.querySelectorAll('.expandable-section')[5];
            let insumos = {};
            if (insumosSection && insumosSection.__getInsumosDados) {
                insumos = insumosSection.__getInsumosDados();
            } else {
                item.querySelectorAll('.insumo-card').forEach(card => {
                    const campo = card.querySelector('.insumo-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.insumo-valor');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    if (valor > 0) {
                        insumos[campo] = { valor: valor };
                    }
                });
            }
            
            const despesasSection = item.querySelector('.despesas-section');
            let despesas = {};
            if (despesasSection && despesasSection.__getDespesasDados) {
                despesas = despesasSection.__getDespesasDados();
            }
            
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            const totalVaga = totalVagaElem ? parseFloat(totalVagaElem.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0 : 0;
            
            cargos.push({
                nome,
                quantidade: qtd,
                salario,
                adicionais: {
                    horasExtras: heCheck?.checked || false,
                    noturno: anCheck?.checked || false,
                    periculosidade: perCheck?.checked || false,
                    insalubridade: insCheck?.checked || false,
                    heHoras: heHoras,
                    anHoras: anHoras,
                    encargosPercentual: encargosPercentual
                },
                uniformes,
                epis,
                beneficios,
                beneficiosPersonalizados,
                seguranca,
                exames,
                treinamento,
                insumos,
                despesas,
                totalVaga
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'terceirizado',
            cargos,
            totalGeral
        };
        
        try {
            if (propostaId) {
                await db.collection('propostas').doc(propostaId).update(proposta);
                mostrarModal('Proposta atualizada com sucesso!');
                localStorage.removeItem(DRAFT_KEY);
            } else {
                const docRef = await db.collection('propostas').add(proposta);
                mostrarModal('Proposta salva com sucesso!');
                window.history.replaceState(null, '', `?id=${docRef.id}`);
                localStorage.removeItem(DRAFT_KEY);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarModal('Erro ao salvar proposta.');
        }
    });
    
    // ========== INICIALIZAR FUNCIONALIDADES ==========
    initTema();
    initCompartilhar();
    checkVisualizacao();
    
    // Substituir o evento do botão gerar PDF
    const btnGerarPDF = document.getElementById('btn-gerar-pdf');
    if (btnGerarPDF) {
        btnGerarPDF.addEventListener('click', gerarPDFProfissional);
    }
});