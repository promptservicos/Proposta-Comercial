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
const DRAFT_KEY = 'proposta_efetivo_draft';

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
            const taxaSpan = item.querySelector('.resultado-bloco .valor');
            if (taxaSpan) {
                const taxaText = taxaSpan.textContent;
                const taxaValor = parseFloat(taxaText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                total += taxaValor * qtd;
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
                    taxa: item.querySelector('.cargo-taxa')?.value || '0.5'
                };
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
                            parseFloat(c.taxa) || 0.5
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

    // ========== FUNÇÃO PARA CRIAR CARGO ==========
    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, taxa = 0.5) {
        const item = document.createElement('div');
        item.className = 'cargo-item';

        // Cabeçalho
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

        // Linha de campos
        const linha = document.createElement('div');
        linha.className = 'cargo-linha';

        const cargoDiv = document.createElement('div');
        cargoDiv.className = 'campo-pequeno';
        cargoDiv.innerHTML = `
            <label><i class="fas fa-briefcase"></i> Cargo</label>
            <input type="text" class="input-moderno cargo-nome" placeholder="Ex: Assistente" value="${cargo}">
        `;

        const qtdDiv = document.createElement('div');
        qtdDiv.className = 'campo-pequeno';
        qtdDiv.innerHTML = `
            <label><i class="fas fa-hashtag"></i> Quant.</label>
            <input type="number" class="input-moderno cargo-quantidade" min="1" value="${quantidade}">
        `;

        const salarioDiv = document.createElement('div');
        salarioDiv.className = 'campo-pequeno';
        salarioDiv.innerHTML = `
            <label><i class="fas fa-dollar-sign"></i> Salário (R$)</label>
            <input type="text" class="input-moderno cargo-salario" placeholder="0,00" value="${salario > 0 ? salario.toFixed(2).replace('.', ',') : ''}">
        `;

        const taxaDiv = document.createElement('div');
        taxaDiv.className = 'campo-pequeno select-wrapper';
        taxaDiv.innerHTML = `
            <label><i class="fas fa-percent"></i> Taxa</label>
            <select class="cargo-taxa">
                <option value="0.5" ${taxa === 0.5 ? 'selected' : ''}>50%</option>
                <option value="0.6" ${taxa === 0.6 ? 'selected' : ''}>60%</option>
                <option value="0.7" ${taxa === 0.7 ? 'selected' : ''}>70%</option>
            </select>
            <i class="fas fa-chevron-down"></i>
        `;

        linha.appendChild(cargoDiv);
        linha.appendChild(qtdDiv);
        linha.appendChild(salarioDiv);
        linha.appendChild(taxaDiv);
        item.appendChild(linha);

        // Área de resultados
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);

        function atualizarResultados() {
            const nome = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const taxa = parseFloat(item.querySelector('.cargo-taxa').value);

            const valorTaxa = salario * taxa;
            const subtotalTaxas = valorTaxa * qtd;

            resultadosDiv.innerHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Taxa (${taxa*100}%)</span>
                    <span class="valor">${formatarMoeda(valorTaxa)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-layer-group"></i> Subtotal (${qtd} vaga${qtd>1?'s':''})</span>
                    <span class="valor">${formatarMoeda(subtotalTaxas)}</span>
                </div>
            `;

            calcularTotalGeral();
            salvarRascunho();
        }

        // Event listeners
        item.querySelector('.cargo-nome').addEventListener('input', atualizarResultados);
        item.querySelector('.cargo-quantidade').addEventListener('input', atualizarResultados);
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor === '') {
                e.target.value = '';
            } else {
                valor = (parseInt(valor) / 100).toFixed(2);
                e.target.value = valor.replace('.', ',');
            }
            atualizarResultados();
        });
        item.querySelector('.cargo-taxa').addEventListener('change', atualizarResultados);

        // Botão remover
        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });

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
                            container.appendChild(criarCargoItem(c.nome, c.quantidade, c.salario, c.taxa));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, 0.5));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, 0.5));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, 0.5));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, 0.5));
            }
        }
    }

    await carregarPropostaExistente();

    // Botão adicionar cargo
    btnAdicionar.addEventListener('click', function() {
        container.appendChild(criarCargoItem('', 1, 0, 0.5));
        salvarRascunho();
    });

    // ========== TEMA CLARO/ESCURO ==========
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_efetivo');
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
                localStorage.setItem('tema_efetivo', 'light');
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
                localStorage.setItem('tema_efetivo', isLight ? 'light' : 'dark');
                
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
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            document.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.7';
                el.style.cursor = 'not-allowed';
                el.style.pointerEvents = 'none';
            });
            
            document.querySelectorAll('.btn-add, #btn-salvar, .btn-remover, .btn-tema, .btn-compartilhar').forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            const btnVoltar = document.getElementById('btn-voltar');
            if (btnVoltar) btnVoltar.style.display = 'none';
            
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
            const taxa = parseFloat(item.querySelector('.cargo-taxa').value);
            const valorTaxa = salario * taxa;
            const subtotal = valorTaxa * qtd;
            
            cargos.push({
                nome,
                quantidade: qtd,
                salario,
                taxa,
                valorTaxa,
                subtotal
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'efetivo',
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
});