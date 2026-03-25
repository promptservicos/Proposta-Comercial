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
    'faabiomansur@promptservicos.com.br': 'Fabio',
    'comercial1@promptservicos.com.br': 'Leila',
    'comercial3@promptservicos.com.br': 'Ricardo',
    'ass.comercial@promptservicos.com.br': 'Moriela'
};

// Lista de admins (que veem todas as propostas)
const ADMIN_EMAILS = [
    'marketing@promptservicos.com.br',  // Luca - admin mas não aparece na lista
    'faabiomansur@promptservicos.com.br'  // Fabio - admin
];

// Lista de vendedores disponíveis para filtro (apenas os vendedores comuns)
const VENDEDORES = ['Ricardo', 'Leila', 'Moriela'];

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
        
        // Extrair os nomes dos cargos
        let nomesCargos = '';
        if (p.cargos && p.cargos.length > 0) {
            // Pegar os primeiros 2 cargos para não poluir o card
            const cargosExibicao = p.cargos.slice(0, 2);
            nomesCargos = cargosExibicao.map(cargo => cargo.nome || 'Cargo sem nome').join(', ');
            if (p.cargos.length > 2) {
                nomesCargos += ` +${p.cargos.length - 2}`;
            }
        }

        html += `
            <div class="proposta-card" data-id="${p.id}" data-tipo="${p.tipo || 'efetivo'}">
                <div class="card-header">
                    <span class="cliente-nome">${escapeHtml(p.cliente || 'Sem cliente')}</span>
                    <div class="card-badges">
                        <span class="tipo-badge">${escapeHtml(tipoContrato)}</span>
                        <span class="vendedor-badge">${escapeHtml(p.vendedor)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <span><i class="fas fa-calendar"></i> ${dataStr}</span>
                    <span><i class="fas fa-briefcase"></i> ${totalCargos} cargo(s)</span>
                </div>
                ${nomesCargos ? `
                <div class="card-cargos">
                    <i class="fas fa-user-tie"></i> ${escapeHtml(nomesCargos)}
                </div>
                ` : ''}
                <div class="card-footer">
                    R$ ${totalGeral}
                </div>
            </div>
        `;
    });
    cardsContainer.innerHTML = html;

    document.querySelectorAll('.proposta-card').forEach(card => {
        card.addEventListener('click', () => {
            propostaSelecionada = { id: card.dataset.id, tipo: card.dataset.tipo || 'efetivo' };
            if (modalOverlay) modalOverlay.classList.remove('hidden');
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