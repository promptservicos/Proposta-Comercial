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

// Inicializar Firebase (apenas se não estiver inicializado)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// ================== MAPEAMENTO DE EMAILS PARA NOMES ==================
const emailToName = {
    'marketing@promptservicos.com.br': 'Luca',
    'fabiomansur@promptservicos.com.br': 'Fabio',
    'comercial1@promptservicos.com.br': 'Leila',
    'comercial3@promptservicos.com.br': 'Ricardo',
    'ass.comercial@promptservicos.com.br': 'Gabriella',
    'promptcoordenacao@gmail.com': 'Val'
};

// Lista de admins (que veem todas as propostas)
const ADMIN_EMAILS = [
    'marketing@promptservicos.com.br',  // Luca - admin mas não aparece na lista
    'fabiomansur@promptservicos.com.br', // Fabio - admin
];

// Lista de vendedores disponíveis para filtro 
const VENDEDORES = ['Ricardo', 'Leila', 'Moriela', 'Val', 'Fabio'];

// ================== DADOS DO USUÁRIO ==================
let usuarioAtual = null;
let usuarioNome = null;
let usuarioEmail = null;
let isAdmin = false;

// ================== ELEMENTOS ==================
const btnCriar = document.getElementById('btn-criar');
const btnVer = document.getElementById('btn-ver');
const panelCriar = document.getElementById('criar-panel');
const panelVer = document.getElementById('ver-panel');
const contratoSelect = document.getElementById('contrato-criar');
const btnContinuar = document.getElementById('btn-continuar');
const filtroCliente = document.getElementById('filtro-cliente');
const filtroVendedor = document.getElementById('filtro-vendedor');
const filtroDataInicio = document.getElementById('filtro-data-inicio');
const filtroDataFim = document.getElementById('filtro-data-fim');
const cardsContainer = document.getElementById('cards-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalBtnSim = document.querySelector('.modal-btn-sim');
const modalBtnNao = document.querySelector('.modal-btn-nao');
const usuarioNomeSpan = document.getElementById('usuario-nome');
const btnLogout = document.getElementById('btn-logout');

let propostas = [];
let activeButton = null;
let propostaSelecionada = null;

// Garantir que o modal comece oculto
if (modalOverlay) modalOverlay.classList.add('hidden');

// ================== FUNÇÃO PARA OBTER NOME A PARTIR DO EMAIL ==================
function getNomeFromEmail(email) {
    if (!email) return 'Desconhecido';
    if (emailToName[email]) {
        return emailToName[email];
    }
    const nome = email.split('@')[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
}

// ================== VERIFICAR SE É ADMIN ==================
function checkIsAdmin(email) {
    return ADMIN_EMAILS.includes(email);
}

// ================== VERIFICAR SESSÃO DO USUÁRIO ==================
function verificarSessao() {
    const sessionEmail = sessionStorage.getItem('session_email');
    const sessionName = sessionStorage.getItem('session_name');
    
    if (!sessionEmail) {
        window.location.href = 'index.html';
        return false;
    }
    
    usuarioEmail = sessionEmail;
    usuarioAtual = sessionEmail;
    usuarioNome = getNomeFromEmail(sessionEmail);
    isAdmin = checkIsAdmin(sessionEmail);
    
    sessionStorage.setItem('session_name', usuarioNome);
    
    if (usuarioNomeSpan) {
        usuarioNomeSpan.textContent = usuarioNome;
    }
    
    return true;
}

// ================== CONFIGURAR FILTRO DE VENDEDOR ==================
function configurarFiltroVendedor() {
    const filtroVendedorContainer = document.getElementById('filtro-vendedor-container');
    const filtroVendedorSelect = filtroVendedor;
    
    if (!filtroVendedorSelect) return;
    
    filtroVendedorSelect.innerHTML = '<option value="">Todos</option>';
    
    if (isAdmin && filtroVendedorContainer) {
        VENDEDORES.forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            filtroVendedorSelect.appendChild(option);
        });
        filtroVendedorContainer.style.display = 'block';
    } else if (filtroVendedorContainer) {
        filtroVendedorContainer.style.display = 'none';
    }
}

// ================== FUNÇÃO PARA FORMATAR TIPO DE CONTRATO ==================
function formatarTipoContrato(tipo) {
    switch(tipo) {
        case 'temporario': return 'Temporário';
        case 'efetivo': return 'Efetivo';
        case 'terceirizado': return 'Terceirizado';
        default: return tipo || 'Não definido';
    }
}

// ================== CONTROLE DOS BOTÕES ==================
function setActive(button) {
    if (activeButton === button) {
        activeButton = null;
        if (btnCriar) btnCriar.classList.remove('active');
        if (btnVer) btnVer.classList.remove('active');
        if (panelCriar) panelCriar.classList.add('hidden');
        if (panelVer) panelVer.classList.add('hidden');
    } else {
        if (btnCriar) btnCriar.classList.remove('active');
        if (btnVer) btnVer.classList.remove('active');
        button.classList.add('active');
        activeButton = button;
        if (button === btnCriar) {
            if (panelCriar) panelCriar.classList.remove('hidden');
            if (panelVer) panelVer.classList.add('hidden');
        } else {
            if (panelVer) panelVer.classList.remove('hidden');
            if (panelCriar) panelCriar.classList.add('hidden');
            carregarPropostas();
        }
    }
}

if (btnCriar) btnCriar.addEventListener('click', () => setActive(btnCriar));
if (btnVer) btnVer.addEventListener('click', () => setActive(btnVer));

// ================== EFEITO DE LUZ ==================
function updateLight(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', x + '%');
    btn.style.setProperty('--y', y + '%');
}

if (btnCriar) btnCriar.addEventListener('mousemove', (e) => updateLight(e, btnCriar));
if (btnVer) btnVer.addEventListener('mousemove', (e) => updateLight(e, btnVer));

// ================== CRIAÇÃO DE PROPOSTA ==================
if (btnContinuar) {
    btnContinuar.addEventListener('click', () => {
        const contrato = contratoSelect ? contratoSelect.value : '';
        if (!contrato) {
            alert('Selecione o tipo de contrato.');
            return;
        }
        window.location.href = `${contrato}.html?vendedor=${encodeURIComponent(usuarioNome)}`;
    });
}

// ================== CARREGAR PROPOSTAS ==================
function carregarPropostas() {
    if (cardsContainer) cardsContainer.innerHTML = '<p class="loading">Carregando propostas...</p>';
    
    db.collection('propostas').orderBy('data', 'desc').get()
        .then((querySnapshot) => {
            propostas = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let vendedorNome = data.vendedor;
                if (vendedorNome && vendedorNome.includes('@')) {
                    vendedorNome = getNomeFromEmail(vendedorNome);
                }
                propostas.push({ id: doc.id, ...data, vendedor: vendedorNome });
            });
            
            if (!isAdmin) {
                propostas = propostas.filter(p => p.vendedor === usuarioNome);
            }
            
            aplicarFiltros();
        })
        .catch((error) => {
            console.error('Erro ao carregar propostas: ', error);
            if (cardsContainer) cardsContainer.innerHTML = '<p class="loading">Erro ao carregar. Verifique permissões.</p>';
        });
}

// ================== DUPLICAR PROPOSTA ==================
async function duplicarProposta(originalId, tipoProposta) {
    try {
        // Mostrar um feedback visual (opcional)
        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = 'Duplicando proposta...';
        loadingMsg.style.position = 'fixed';
        loadingMsg.style.bottom = '20px';
        loadingMsg.style.right = '20px';
        loadingMsg.style.backgroundColor = '#c10404';
        loadingMsg.style.color = '#fff';
        loadingMsg.style.padding = '8px 16px';
        loadingMsg.style.borderRadius = '30px';
        loadingMsg.style.zIndex = '9999';
        document.body.appendChild(loadingMsg);

        // 1. Buscar o documento original
        const docRef = db.collection('propostas').doc(originalId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            throw new Error('Proposta original não encontrada');
        }
        const dadosOriginais = docSnap.data();

        // 2. Preparar os dados da cópia
        const novaData = new Date().toISOString();

        // (Opcional) Adicionar "(cópia)" ao nome do cliente
        let clienteCopia = dadosOriginais.cliente || '';
        if (clienteCopia && !clienteCopia.toLowerCase().includes('(cópia)')) {
            clienteCopia = clienteCopia + ' (cópia)';
        }

        const dadosCopia = {
            ...dadosOriginais,               // mantém cargos, totalGeral, etc.
            cliente: clienteCopia,
            data: novaData,
            vendedor: usuarioNome,            // força o vendedor atual
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            originalId: originalId            // opcional: referência à proposta original
        };

        // Remover campos que não devem ser copiados (se houver ID)
        delete dadosCopia.id;

        // 3. Salvar novo documento no Firestore
        const novaRef = await db.collection('propostas').add(dadosCopia);

        // 4. Remover mensagem de loading e redirecionar para edição
        loadingMsg.remove();
        window.location.href = `${tipoProposta}.html?id=${novaRef.id}`;
    } catch (error) {
        console.error('Erro ao duplicar proposta:', error);
        alert('Erro ao duplicar proposta. Tente novamente.');
        // Remover mensagem de loading se existir
        const msg = document.querySelector('div[style*="Duplicando proposta"]');
        if (msg) msg.remove();
    }
}

// ================== EXCLUIR PROPOSTA ==================
async function excluirProposta(propostaId) {
    // Confirmação adicional (já teremos no clique, mas pode ser redundante)
    if (!confirm('Tem certeza que deseja excluir esta proposta permanentemente? Esta ação não pode ser desfeita.')) {
        return false;
    }
    
    try {
        // Mostrar feedback visual
        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = 'Excluindo proposta...';
        loadingMsg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#c10404; color:#fff; padding:8px 16px; border-radius:30px; z-index:9999;';
        document.body.appendChild(loadingMsg);
        
        // Excluir do Firestore
        await db.collection('propostas').doc(propostaId).delete();
        
        loadingMsg.remove();
        // Recarregar a lista de propostas
        await carregarPropostas();
        return true;
    } catch (error) {
        console.error('Erro ao excluir proposta:', error);
        alert('Erro ao excluir proposta. Tente novamente.');
        const msg = document.querySelector('div[style*="Excluindo proposta"]');
        if (msg) msg.remove();
        return false;
    }
}

// ================== APLICAR FILTROS ==================
function aplicarFiltros() {
    const filtroClienteVal = filtroCliente ? filtroCliente.value.toLowerCase().trim() : '';
    const filtroVendedorVal = (isAdmin && filtroVendedor) ? filtroVendedor.value : usuarioNome;
    const dataInicioVal = filtroDataInicio && filtroDataInicio.value ? new Date(filtroDataInicio.value) : null;
    let dataFimVal = filtroDataFim && filtroDataFim.value ? new Date(filtroDataFim.value) : null;
    if (dataFimVal) dataFimVal.setHours(23, 59, 59);

    let filtradas = propostas.filter(p => {
        const cliente = p.cliente || '';
        const clienteMatch = cliente.toLowerCase().includes(filtroClienteVal);
        const vendedorMatch = !isAdmin ? true : (filtroVendedorVal === '' || p.vendedor === filtroVendedorVal);
        let dataMatch = true;
        if (p.data) {
            const dataProposta = new Date(p.data);
            if (dataInicioVal && dataProposta < dataInicioVal) dataMatch = false;
            if (dataFimVal && dataProposta > dataFimVal) dataMatch = false;
        }
        return clienteMatch && vendedorMatch && dataMatch;
    });

    if (!cardsContainer) return;

    if (filtradas.length === 0) {
        cardsContainer.innerHTML = '<p class="loading">Nenhuma proposta encontrada.</p>';
        return;
    }

    let html = '';
    filtradas.forEach(p => {
        const data = p.data ? new Date(p.data) : new Date();
        const dataStr = data.toLocaleDateString('pt-BR');
        const totalCargos = p.cargos ? p.cargos.length : 0;
        const totalGeral = p.totalGeral ? p.totalGeral.toFixed(2).replace('.', ',') : '0,00';
        const tipoContrato = formatarTipoContrato(p.tipo);
        
        let nomesCargos = '';
        if (p.cargos && p.cargos.length > 0) {
            const cargosExibicao = p.cargos.slice(0, 2);
            nomesCargos = cargosExibicao.map(cargo => cargo.nome || 'Cargo sem nome').join(', ');
            if (p.cargos.length > 2) nomesCargos += ` +${p.cargos.length - 2}`;
        }

        html += `
        <div class="proposta-card" data-id="${p.id}" data-tipo="${p.tipo || 'efetivo'}">
            <div class="card-header">
                <span class="cliente-nome">${escapeHtml(p.cliente || 'Sem cliente')}</span>
                <div class="right-group">
                    <div class="card-badges">
                        <span class="vendedor-badge">${escapeHtml(p.vendedor)}</span>
                        <span class="tipo-badge">${escapeHtml(tipoContrato)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-duplicar" data-id="${p.id}" data-tipo="${p.tipo || 'efetivo'}" title="Duplicar proposta">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-excluir" data-id="${p.id}" title="Excluir proposta">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <span><i class="fas fa-calendar"></i> ${dataStr}</span>
                <span><i class="fas fa-briefcase"></i> ${totalCargos} cargo(s)</span>
            </div>
            ${nomesCargos ? `<div class="card-cargos"><i class="fas fa-user-tie"></i> ${escapeHtml(nomesCargos)}</div>` : ''}
            <div class="card-footer">R$ ${totalGeral}</div>
        </div>
    `;
    });
    cardsContainer.innerHTML = html;

    // Clique no card para abrir
    document.querySelectorAll('.proposta-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-duplicar') || e.target.closest('.btn-excluir')) return;
            propostaSelecionada = { id: card.dataset.id, tipo: card.dataset.tipo || 'efetivo' };
            if (modalOverlay) modalOverlay.classList.remove('hidden');
        });
    });

    // Clique no botão duplicar
    document.querySelectorAll('.btn-duplicar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const tipo = btn.dataset.tipo;
            if (!id || !tipo) return;
            if (confirm('Deseja realmente duplicar esta proposta? Uma nova cópia será criada com a data atual.')) {
                await duplicarProposta(id, tipo);
            }
        });
    });

    // Clique no botão excluir
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (!id) return;
            if (confirm('Excluir esta proposta permanentemente? Esta ação não pode ser desfeita.')) {
                await excluirProposta(id);
            }
        });
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================== MODAL ==================
if (modalBtnSim) {
    modalBtnSim.addEventListener('click', () => {
        if (propostaSelecionada) {
            window.location.href = `${propostaSelecionada.tipo}.html?id=${propostaSelecionada.id}`;
        }
        if (modalOverlay) modalOverlay.classList.add('hidden');
    });
}

if (modalBtnNao) {
    modalBtnNao.addEventListener('click', () => {
        if (modalOverlay) modalOverlay.classList.add('hidden');
        propostaSelecionada = null;
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
            propostaSelecionada = null;
        }
    });
}

// ================== LOGOUT ==================
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        auth.signOut().then(() => {
            sessionStorage.clear();
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
            localStorage.removeItem('remember_me');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
            window.location.href = 'index.html';
        });
    });
}

// ================== EVENTOS DE FILTRO ==================
if (filtroCliente) filtroCliente.addEventListener('input', aplicarFiltros);
if (filtroVendedor) filtroVendedor.addEventListener('change', aplicarFiltros);
if (filtroDataInicio) filtroDataInicio.addEventListener('change', aplicarFiltros);
if (filtroDataFim) filtroDataFim.addEventListener('change', aplicarFiltros);

// ================== TEMA CLARO/ESCURO ==================
function initTema() {
    const temaSalvo = localStorage.getItem('tema_menu');
    const btnTema = document.getElementById('btn-tema');
    const iconTema = btnTema?.querySelector('i');
    
    // Se NÃO houver tema salvo, ou se o tema salvo for 'light', aplica o tema claro
    if (!temaSalvo || temaSalvo === 'light') {
        document.body.classList.add('light-mode');
        if (iconTema) {
            iconTema.classList.remove('fa-moon');
            iconTema.classList.add('fa-sun');
        }
        if (!temaSalvo) {
            localStorage.setItem('tema_menu', 'light');
        }
    } else if (temaSalvo === 'dark') {
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
            localStorage.setItem('tema_menu', isLight ? 'light' : 'dark');
            
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

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tema primeiro
    initTema();
    
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        if (verificarSessao()) {
            configurarFiltroVendedor();
        }
    });
});