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
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// ================== CONSTANTES ==================
const SALARIO_MINIMO = 1621.00;
const HORAS_MENSAL = 220;
const TAXA_ENCARGOS_PADRAO = 0.5583; // 55.83% padrão

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

const BENEFICIOS = [
    { nome: "Vale Refeição", campo: "vr" },
    { nome: "Café", campo: "cafe" },
    { nome: "PLR", campo: "plr" },
    { nome: "Auxílio Saúde", campo: "saude" },
    { nome: "Vale Transporte", campo: "vt" }
];

const SEGURANCA = [
    { nome: "SST (Segurança e Saúde do Trabalho)", campo: "sst" },
    { nome: "Seguro de Vida", campo: "seguro_vida" }
];

const INSUMOS = [
    { nome: "Rádios / Bastão de Ronda", campo: "radio" },
    { nome: "Insumos (Materiais de Limpeza)", campo: "insumos" },
    { nome: "Maquinário", campo: "maquinario" }
];

const DESPESAS = [
    { nome: "Taxa Adm (Sob salário + encargos)", campo: "taxa_adm", porcentagem: 0 },
    { nome: "Encargos fiscais (Sob valor bruto)", campo: "encargos_fiscais", porcentagem: 0 }
];

const EXAMES_OBRIGATORIOS = [
    { nome: "Clínico", preco: 55.00, obrigatorio: true },
    { nome: "Audiometria", preco: 28.00, obrigatorio: true },
    { nome: "Acuidade", preco: 28.00, obrigatorio: true }
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

const TAXA_EXAMES = 0.1375;

const DRAFT_KEY = 'proposta_temporario_draft';

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
                    encargosPercentual: item.querySelector('.encargos-percentual')?.value || '55,83',
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
                    seguranca: {},
                    insumos: {},
                    despesas: {},
                    exames: {},
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
                
                // Capturar benefícios
                item.querySelectorAll('.beneficio-card').forEach(card => {
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
                
                // Capturar despesas
                const despesasSection = item.querySelector('.despesas-section');
                if (despesasSection) {
                    despesasSection.querySelectorAll('.despesa-card').forEach(card => {
                        const campo = card.querySelector('.despesa-porcentagem')?.dataset.campo;
                        const porcentagemInput = card.querySelector('.despesa-porcentagem');
                        if (campo) {
                            const porcentagem = parseFloat(porcentagemInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                            if (porcentagem > 0) {
                                cargo.despesas[campo] = { porcentagem: porcentagem };
                            }
                        }
                    });
                }
                
                // Capturar exames (JÁ ESTÁ CORRETO, mas vamos garantir)
                const examesSection = item.querySelector('.exames-section');
                if (examesSection) {
                    const examesObj = {};
                    examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                        if (cb.checked) {
                            examesObj[cb.dataset.nome] = true;
                        }
                    });
                    cargo.exames = examesObj; // Isso já está correto
                    
                    const treinamentoInput = examesSection.querySelector('.treinamento-valor');
                    if (treinamentoInput) {
                        cargo.treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    }
                }
                
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
                        // Garantir que exames seja um objeto
                        let examesObj = c.exames || {};
                        
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            c.adicionais || {},
                            c.uniformes || {},
                            c.epis || {},
                            c.beneficios || {},
                            c.seguranca || {},
                            c.insumos || {},
                            c.despesas || {},
                            examesObj, // Passa o objeto diretamente
                            c.treinamento || 0,
                            parseFloat(c.adicionais?.encargosPercentual?.replace(/\./g, '').replace(',', '.')) || 55.83
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

    function criarBeneficiosSection(dadosBeneficios = {}) {
        const conteudoHtml = `<div class="beneficios-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Benefícios', 'fa-gift', conteudoHtml, true);
        const grid = content.querySelector('.beneficios-grid');
        
        BENEFICIOS.forEach(b => {
            const card = document.createElement('div');
            card.className = 'beneficio-card';
            const valorDiario = dadosBeneficios[b.campo]?.valorDiario ?? 0;
            const dias = dadosBeneficios[b.campo]?.dias ?? 0;
            card.innerHTML = `
                <div class="beneficio-nome">${b.nome}</div>
                <div class="beneficio-campos">
                    <div class="beneficio-campo">
                        <label>R$ / dia</label>
                        <input type="text" class="beneficio-valor" data-campo="${b.campo}" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}">
                    </div>
                    <div class="beneficio-campo">
                        <label>Dias</label>
                        <input type="number" class="beneficio-dias" data-campo="${b.campo}" placeholder="0" value="${dias}">
                    </div>
                </div>
                <div class="beneficio-total">Total: R$ 0,00</div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let total = 0;
            grid.querySelectorAll('.beneficio-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
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
        
        grid.querySelectorAll('.beneficio-valor, .beneficio-dias').forEach(input => {
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
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const beneficios = {};
            grid.querySelectorAll('.beneficio-card').forEach(card => {
                const campo = card.querySelector('.beneficio-valor').dataset.campo;
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (valor > 0 || dias > 0) {
                    beneficios[campo] = { valorDiario: valor, dias: dias };
                }
            });
            return beneficios;
        } };
    }

    function criarSegurancaSection(cargoItem, dadosSeguranca = {}) {
        const conteudoHtml = `<div class="seguranca-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Segurança e Seguro', 'fa-shield-alt', conteudoHtml, true);
        const grid = content.querySelector('.seguranca-grid');
        
        SEGURANCA.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seguranca-item';
            const valorUnitario = dadosSeguranca[s.campo]?.valor ?? 0;
            const depreciacao = dadosSeguranca[s.campo]?.depreciacao ?? 0;
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
                <span class="summary-label">Subtotal da prestação:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down despesas-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'despesas-content';
        content.innerHTML = `
            <div class="despesas-grid"></div>
            <div class="despesas-total">
                <span>Subtotal da prestação de serviço:</span>
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
        
        const grid = content.querySelector('.despesas-grid');
        const totalSpan = content.querySelector('.despesas-total span:last-child');
        
        const despesasItems = [];
        
        DESPESAS.forEach(d => {
            const card = document.createElement('div');
            card.className = 'despesa-card';
            const porcentagem = dadosDespesas[d.campo]?.porcentagem ?? 0;
            card.innerHTML = `
                <div class="despesa-nome">${d.nome}</div>
                <div class="despesa-campos">
                    <div class="despesa-campo">
                        <label>%</label>
                        <input type="text" class="despesa-porcentagem" data-campo="${d.campo}" placeholder="0,00" value="${porcentagem.toFixed(2).replace('.', ',')}">
                    </div>
                </div>
                <div class="despesa-valor">R$ 0,00</div>
                <div class="despesa-calculo"></div>
            `;
            grid.appendChild(card);
            despesasItems.push({
                card,
                campo: d.campo,
                porcentagemInput: card.querySelector('.despesa-porcentagem'),
                valorSpan: card.querySelector('.despesa-valor'),
                calculoSpan: card.querySelector('.despesa-calculo')
            });
        });
        
        function calcularDespesas(subtotalCargo, salario, encargosValor) {
            let taxaAdm = 0;
            let encargosFiscais = 0;
            
            despesasItems.forEach(item => {
                const porcentagem = parseFloat(item.porcentagemInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                
                if (item.campo === 'taxa_adm') {
                    const base = salario + encargosValor;
                    taxaAdm = base * (porcentagem / 100);
                    item.valorSpan.textContent = formatarMoeda(taxaAdm);
                    item.calculoSpan.textContent = `(${formatarMoeda(base)} × ${porcentagem}%)`;
                } else if (item.campo === 'encargos_fiscais') {
                    const base = subtotalCargo + taxaAdm;
                    encargosFiscais = base * (porcentagem / 100);
                    item.valorSpan.textContent = formatarMoeda(encargosFiscais);
                    item.calculoSpan.textContent = `(${formatarMoeda(base)} × ${porcentagem}%)`;
                }
            });
            
            const totalPrestacao = subtotalCargo + taxaAdm + encargosFiscais;
            totalSpan.textContent = formatarMoeda(totalPrestacao);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalPrestacao);
            
            return { taxaAdm, encargosFiscais, totalPrestacao };
        }
        
        despesasItems.forEach(item => {
            item.porcentagemInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-despesas'));
                }
                salvarRascunho();
            });
        });
        
        return { section, calcularDespesas, getDados: () => {
            const despesas = {};
            despesasItems.forEach(item => {
                const porcentagem = parseFloat(item.porcentagemInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                if (porcentagem > 0) {
                    despesas[item.campo] = { porcentagem: porcentagem };
                }
            });
            return despesas;
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
        
        // Adicionar exames obrigatórios
        EXAMES_OBRIGATORIOS.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames[e.nome] === true;
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
                obrigatorio: true
            });
        });
        
        // Adicionar exames complementares
        EXAMES_COMPLEMENTARES.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames.exames?.[e.nome] || false;
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
            const taxa = totalExames * TAXA_EXAMES;
            const totalComTaxa = totalExames + taxa;
            examesTotalSpan.textContent = formatarMoeda(totalComTaxa);
            return totalComTaxa;
        }
        
        function calcularTotal() {
            const totalExames = calcularTotalExames();
            let totalTreinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            const totalGeral = totalExames + totalTreinamento;
            totalSecaoSpan.textContent = formatarMoeda(totalGeral);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            return totalGeral;
        }
        
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
        
         return { 
            section, 
            calcularTotal, 
            getDados: () => {
                const exames = {};
                examesItems.forEach(item => {
                    if (item.checkbox.checked) {
                        exames[item.nome] = true;
                    }
                });
                const treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                return { exames, treinamento };
            } 
        };
    }


    // ========== CRIAÇÃO DO CARGO ==========
    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, dadosAdicionais = {}, dadosUniformes = {}, dadosEpis = {}, dadosBeneficios = {}, dadosSeguranca = {}, dadosInsumos = {}, dadosDespesas = {}, dadosExames = {}, treinamentoValor = 0, encargosPercentual = 55.83) {
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
                    <input type="text" class="input-moderno encargos-percentual" placeholder="55,83" value="${encargosPercentual.toFixed(2).replace('.', ',')}" style="width: 80px; text-align: center;">
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
        const { section: beneficiosSection, calcularTotal: calcularBeneficios, getDados: getBeneficiosDados } = criarBeneficiosSection(dadosBeneficios);
        item.appendChild(beneficiosSection);
        
        // Seção Segurança
        const { section: segurancaSection, calcularTotal: calcularSeguranca, getDados: getSegurancaDados } = criarSegurancaSection(item, dadosSeguranca);
        item.appendChild(segurancaSection);
        
        // Seção Insumos
        const { section: insumosSection, calcularTotal: calcularInsumos, getDados: getInsumosDados } = criarInsumosSection(item, dadosInsumos);
        item.appendChild(insumosSection);
        
        // Seção Despesas
        const { section: despesasSection, calcularDespesas, getDados: getDespesasDados } = criarDespesasSection(item, dadosDespesas);
        item.appendChild(despesasSection);
        
        // Seção Exames e Treinamentos
        const { section: examesSection, calcularTotal: calcularExames, getDados: getExamesDados } = criarExamesSection(item, dadosExames, treinamentoValor);
        item.appendChild(examesSection);
        
        // Resultados
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);
        
        // Armazenar referências
        item.__getUniformesDados = getUniformesDados;
        item.__getBeneficiosDados = getBeneficiosDados;
        item.__getSegurancaDados = getSegurancaDados;
        item.__getInsumosDados = getInsumosDados;
        item.__getDespesasDados = getDespesasDados;
        item.__getExamesDados = getExamesDados;
        
        function atualizarResultados() {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const valorHora = salario / HORAS_MENSAL;
            
            // Obter porcentagem de encargos do campo
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            let taxaEncargos = parseFloat(encargosPercentualInput.value.replace(/\./g, '').replace(',', '.')) || 55.83;
            taxaEncargos = taxaEncargos / 100;
            
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
            
            // Uniformes e EPIs
            const uniformesData = atualizarUniformesTotais();
            const totalUniformeEpi = uniformesData?.totalGeral || 0;
            
            // Benefícios
            const totalBeneficios = calcularBeneficios();
            
            // Segurança
            const totalSeguranca = calcularSeguranca();
            
            // Insumos
            const totalInsumos = calcularInsumos();
            
            const valorEncargos = salario * taxaEncargos;
            const subtotalSalarioEncargos = salario + valorEncargos + totalAdicionais;
            
            // Subtotal dos insumos e benefícios
            const subtotalInsumosBeneficios = totalUniformeEpi + totalBeneficios + totalSeguranca + totalInsumos;
            
            // Calcular despesas
            const despesasResult = calcularDespesas(subtotalSalarioEncargos, salario, valorEncargos);
            
            // Calcular exames
            const totalExames = calcularExames();
            
            const totalFinalVaga = despesasResult.totalPrestacao + totalExames;
            
            // Atualizar evento do campo de encargos
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
                        <span class="rotulo"><i class="fas fa-plus-circle"></i> Adicionais</span>
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
                    <span class="rotulo"><i class="fas fa-chart-line"></i> Taxa Adm</span>
                    <span class="valor">${formatarMoeda(despesasResult.taxaAdm)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-file-invoice-dollar"></i> Encargos Fiscais</span>
                    <span class="valor">${formatarMoeda(despesasResult.encargosFiscais)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-stethoscope"></i> Exames e Treinamentos</span>
                    <span class="valor">${formatarMoeda(totalExames)}</span>
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
        
        // Preencher dados adicionais
        if (dadosAdicionais) {
            if (dadosAdicionais.horasExtras && adicionaisContent.querySelector('.he-check')) adicionaisContent.querySelector('.he-check').checked = true;
            if (dadosAdicionais.noturno && adicionaisContent.querySelector('.an-check')) adicionaisContent.querySelector('.an-check').checked = true;
            if (dadosAdicionais.periculosidade && adicionaisContent.querySelector('.per-check')) adicionaisContent.querySelector('.per-check').checked = true;
            if (dadosAdicionais.insalubridade && adicionaisContent.querySelector('.ins-check')) adicionaisContent.querySelector('.ins-check').checked = true;
            if (dadosAdicionais.heHoras && adicionaisContent.querySelector('.he-horas')) adicionaisContent.querySelector('.he-horas').value = dadosAdicionais.heHoras;
            if (dadosAdicionais.anHoras && adicionaisContent.querySelector('.an-horas')) adicionaisContent.querySelector('.an-horas').value = dadosAdicionais.anHoras;
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
                            // Garantir que exames seja um objeto
                            let examesObj = {};
                            if (c.exames) {
                                if (Array.isArray(c.exames)) {
                                    // Se for array, converte para objeto
                                    c.exames.forEach(nomeExame => {
                                        examesObj[nomeExame] = true;
                                    });
                                } else {
                                    // Já é objeto
                                    examesObj = c.exames;
                                }
                            }
                            
                            container.appendChild(criarCargoItem(
                                c.nome,
                                c.quantidade,
                                c.salario,
                                c.adicionais || {},
                                c.uniformes || {},
                                c.epis || {},
                                c.beneficios || {},
                                c.seguranca || {},
                                c.insumos || {},
                                c.despesas || {},
                                examesObj,
                                c.treinamento || 0,
                                c.adicionais?.encargosPercentual || 55.83
                            ));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
            }
        }
    }
    
    await carregarPropostaExistente();
    
    // Botão adicionar cargo
    btnAdicionar.addEventListener('click', function() {
        const novoCargo = criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83);
        container.appendChild(novoCargo);
        calcularTotalGeral();
        salvarRascunho();
    });
    
    // ========== TEMA CLARO/ESCURO ==========
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_temporario');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        // Se NÃO houver tema salvo, ou se o tema salvo for 'light', aplica o tema claro
        if (!temaSalvo || temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
            // Salvar como 'light' se não houver tema salvo
            if (!temaSalvo) {
                localStorage.setItem('tema_temporario', 'light');
            }
        } else if (temaSalvo === 'dark') {
            // Apenas se o tema salvo for 'dark', aplica o tema escuro
            document.body.classList.remove('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-sun');
                iconTema.classList.add('fa-moon');
            }
        }
        
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('tema_temporario', isLight ? 'light' : 'dark');
                
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
    
    // ========== GERAR PDF PROFISSIONAL ==========
    function gerarPDFProfissional() {
        const elemento = document.querySelector('.container').cloneNode(true);
        
        const botoesRemover = elemento.querySelectorAll('.btn-add, #btn-gerar-pdf, #btn-salvar, .btn-remover, .btn-voltar, .btn-tema, .btn-compartilhar');
        botoesRemover.forEach(btn => btn.remove());
        
        elemento.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                const span = document.createElement('span');
                span.textContent = input.checked ? '✓' : '✗';
                span.style.color = input.checked ? '#c10404' : '#666';
                span.style.fontSize = '1.2rem';
                input.parentNode.replaceChild(span, input);
            } else {
                const span = document.createElement('span');
                span.textContent = input.value;
                span.className = 'valor-texto';
                span.style.color = '#333';
                span.style.fontWeight = '500';
                input.parentNode.replaceChild(span, input);
            }
        });
        
        elemento.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove());
        
        elemento.querySelectorAll('.section-content.collapsed, .despesas-content.collapsed, .exames-content.collapsed').forEach(content => {
            content.classList.remove('collapsed');
        });
        
        const headerProfissional = document.createElement('div');
        headerProfissional.className = 'pdf-header';
        headerProfissional.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #c10404;">
                <img src="logo.png" alt="Prompt Serviços" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 0.5rem;">
                <h2 style="color: #c10404; margin: 0;">Prompt Serviços</h2>
                <p style="color: #666; margin: 0;">Proposta Comercial - Contrato Temporário</p>
                <p style="color: #888; font-size: 0.8rem; margin-top: 0.3rem;">Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        `;
        elemento.insertBefore(headerProfissional, elemento.firstChild);
        
        const footer = document.createElement('div');
        footer.className = 'pdf-footer';
        footer.innerHTML = `
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.7rem; color: #888;">
                <p>Prompt Serviços - CNPJ: XX.XXX.XXX/0001-XX</p>
                <p>Este documento é uma proposta comercial e tem validade de 30 dias.</p>
            </div>
        `;
        elemento.appendChild(footer);
        
        const style = document.createElement('style');
        style.innerHTML = `
            .container { background: #ffffff !important; color: #333333 !important; padding: 1.5rem !important; font-family: 'Inter', 'Segoe UI', sans-serif !important; }
            .cargo-item { background: #fafafa !important; border: 1px solid #e0e0e0 !important; margin-bottom: 1rem !important; border-radius: 12px !important; page-break-inside: avoid !important; }
            .cargo-header { background: #f0f0f0 !important; padding: 0.8rem !important; border-radius: 12px 12px 0 0 !important; }
            .cargo-titulo { color: #c10404 !important; }
            .input-moderno, .taxa-fixa { background: #f5f5f5 !important; border: 1px solid #ddd !important; color: #333 !important; }
            .section-header { background: #f0f0f0 !important; border-bottom: 1px solid #e0e0e0 !important; }
            .section-title { color: #c10404 !important; }
            .cargo-resultados { background: #fafafa !important; border: 1px solid #e0e0e0 !important; }
            .resumo-final { background: #fafafa !important; border: 2px solid #c10404 !important; }
            .resumo-item strong { color: #c10404 !important; }
            .beneficio-card, .seguranca-item, .insumo-card, .despesa-card { background: #ffffff !important; border: 1px solid #e0e0e0 !important; }
            .uniformes-box, .epis-box, .exames-box { background: #ffffff !important; border: 1px solid #e0e0e0 !important; }
            .box-header { background: #f5f5f5 !important; }
            .dropdown-menu { display: none !important; }
            .btn-remover, .btn-add, .btn { display: none !important; }
            .section-toggle, .despesas-toggle, .exames-toggle { display: none !important; }
            .section-content { display: block !important; }
            .valor-texto { color: #333 !important; font-weight: 500 !important; }
        `;
        elemento.appendChild(style);
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `Proposta_Temporario_${clienteInput.value || 'SemCliente'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff', logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(elemento).save();
    }
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            // Modo visualização - desabilitar TODAS as edições
            document.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.7';
                el.style.cursor = 'not-allowed';
                el.style.pointerEvents = 'none';
            });
            
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.disabled = true;
                cb.style.pointerEvents = 'none';
            });
            
            // Esconder botões de ação (mas manter o botão de tema)
            document.querySelectorAll('.btn-add, #btn-gerar-pdf, #btn-salvar, .btn-remover, .btn-compartilhar').forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            // NÃO esconder o botão de tema - o cliente pode mudar o tema
            // O botão de tema permanece visível
            
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            // Não esconder o botão voltar para que o cliente possa voltar ao menu
            // const btnVoltar = document.getElementById('btn-voltar');
            // if (btnVoltar) btnVoltar.style.display = 'none';
            
            document.querySelectorAll('.section-toggle, .despesas-toggle, .exames-toggle').forEach(toggle => {
                if (toggle) toggle.style.display = 'none';
            });
            
            document.querySelectorAll('.section-content.collapsed, .despesas-content.collapsed, .exames-content.collapsed').forEach(content => {
                if (content) content.classList.remove('collapsed');
            });
            
            document.querySelectorAll('.box-header').forEach(header => {
                header.style.pointerEvents = 'none';
                header.style.cursor = 'default';
            });
            
            // Adicionar aviso de visualização
            const aviso = document.createElement('div');
            aviso.className = 'aviso-visualizacao';
            aviso.innerHTML = `
                <div style="background: #c10404; color: #fff; text-align: center; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-eye"></i> <strong>Modo de visualização</strong> - Esta proposta é apenas para leitura
                </div>
            `;
            const containerDiv = document.querySelector('.container');
            if (containerDiv && !containerDiv.querySelector('.aviso-visualizacao')) {
                containerDiv.insertBefore(aviso, containerDiv.firstChild);
            }
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
            const encargosPercentual = parseFloat(encargosPercentualInput?.value.replace(/\./g, '').replace(',', '.')) || 55.83;
            
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
            if (beneficiosSection && beneficiosSection.__getBeneficiosDados) {
                beneficios = beneficiosSection.__getBeneficiosDados();
            } else {
                item.querySelectorAll('.beneficio-card').forEach(card => {
                    const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (valor > 0 || dias > 0) {
                        beneficios[campo] = { valorDiario: valor, dias: dias };
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
            
            const insumosSection = item.querySelectorAll('.expandable-section')[4];
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
            } else if (despesasSection) {
                despesasSection.querySelectorAll('.despesa-card').forEach(card => {
                    const campo = card.querySelector('.despesa-porcentagem')?.dataset.campo;
                    const porcentagemInput = card.querySelector('.despesa-porcentagem');
                    const porcentagem = parseFloat(porcentagemInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    if (porcentagem > 0) {
                        despesas[campo] = { porcentagem: porcentagem };
                    }
                });
            }
            
            const examesSection = item.querySelector('.exames-section');
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
                seguranca,
                insumos,
                despesas,
                exames,
                treinamento,
                totalVaga
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'temporario',
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
    
    const btnGerarPDF = document.getElementById('btn-gerar-pdf');
    if (btnGerarPDF) {
        btnGerarPDF.addEventListener('click', gerarPDFProfissional);
    }
});