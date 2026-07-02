// ========== TEMA (CLARO/ESCURO) ==========
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme_menu');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeIcon.classList.remove('bx-moon');
    themeIcon.classList.add('bx-sun');
} else {
    document.body.classList.remove('dark');
    themeIcon.classList.remove('bx-sun');
    themeIcon.classList.add('bx-moon');
    if (!savedTheme) localStorage.setItem('theme_menu', 'light');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    if (isDark) {
        themeIcon.classList.remove('bx-moon');
        themeIcon.classList.add('bx-sun');
        localStorage.setItem('theme_menu', 'dark');
    } else {
        themeIcon.classList.remove('bx-sun');
        themeIcon.classList.add('bx-moon');
        localStorage.setItem('theme_menu', 'light');
    }
});

// ========== FIREBASE INIT ==========
const firebaseConfig = {
    apiKey: "AIzaSyB2xi5fCMv3Vz_UpRxMdQqrVn1DDyAh3_k",
    authDomain: "propostas-comerciais-e288c.firebaseapp.com",
    projectId: "propostas-comerciais-e288c",
    storageBucket: "propostas-comerciais-e288c.firebasestorage.app",
    messagingSenderId: "781220916097",
    appId: "1:781220916097:web:9d1d53aa8bb03c520c1680",
    measurementId: "G-JEH5ZKSX89"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ========== CHAVE DE CRIPTOGRAFIA ==========
const ENCRYPTION_KEY = 'PromptServicos2024Secure!@#$%';

// ========== FUNÇÕES DE CRIPTOGRAFIA ==========
function decryptData(encryptedData) {
    if (!encryptedData) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) throw new Error('Falha na descriptografia');
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Erro ao descriptografar:', error);
        return null;
    }
}

function encryptData(data) {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Erro ao criptografar:', error);
        return null;
    }
}

// ========== MAPEAMENTO DE EMAILS ==========
const emailToName = {
    'marketing@promptservicos.com.br': 'Luca',
    'fabiomansur@promptservicos.com.br': 'Fabio',
    'comercial1@promptservicos.com.br': 'Leila',
    'comercial3@promptservicos.com.br': 'Ricardo',
    'ass.comercial@promptservicos.com.br': 'Gabriella',
    'promptcoordenacao@gmail.com': 'Val'
};

const ADMIN_EMAILS = [
    'marketing@promptservicos.com.br',
    'fabiomansur@promptservicos.com.br',
];

const VENDEDORES = ['Ricardo', 'Leila', 'Moriela', 'Val', 'Fabio'];

// ========== DADOS DO USUÁRIO ==========
let usuarioNome = null;
let usuarioEmail = null;
let isAdmin = false;

// ========== ELEMENTOS ==========
const btnCriar = document.getElementById('btn-criar');
const btnVer = document.getElementById('btn-ver');
const panelCriar = document.getElementById('criar-panel');
const panelVer = document.getElementById('ver-panel');
const btnContinuar = document.getElementById('btn-continuar');
const filtroCliente = document.getElementById('filtro-cliente');
const filtroVendedor = document.getElementById('filtro-vendedor');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroDataInicio = document.getElementById('filtro-data-inicio');
const filtroDataFim = document.getElementById('filtro-data-fim');
const cardsContainer = document.getElementById('cards-container');
const usuarioNomeSpan = document.getElementById('usuario-nome');
const btnLogout = document.getElementById('btn-logout');

// Modais
const confirmModal = document.getElementById('confirmModal');
const deleteModal = document.getElementById('deleteModal');
const modalConfirmBtn = document.querySelector('.modal-btn-confirm');
const modalDeleteBtn = document.querySelector('.modal-btn-delete');
const modalCancelBtns = document.querySelectorAll('.modal-btn-cancel');

let propostas = [];
let activeButton = null;
let propostaSelecionada = null;

// ========== FUNÇÃO PARA OBTER NOME ==========
function getNomeFromEmail(email) {
    if (!email) return 'Desconhecido';
    if (emailToName[email]) return emailToName[email];
    const nome = email.split('@')[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function checkIsAdmin(email) {
    return ADMIN_EMAILS.includes(email);
}

// ========== VERIFICAR SESSÃO ==========
function verificarSessao() {
    const sessionEmail = sessionStorage.getItem('session_email');
    const sessionName = sessionStorage.getItem('session_name');
    
    if (!sessionEmail) {
        if (!window._isRedirecting) {
            window._isRedirecting = true;
            window.location.href = 'index.html';
        }
        return false;
    }
    
    usuarioEmail = sessionEmail;
    usuarioNome = getNomeFromEmail(sessionEmail);
    isAdmin = checkIsAdmin(sessionEmail);
    
    sessionStorage.setItem('session_name', usuarioNome);
    
    if (usuarioNomeSpan) {
        usuarioNomeSpan.textContent = usuarioNome;
    }
    
    return true;
}

// ========== CONFIGURAR FILTRO DE VENDEDOR ==========
function configurarFiltroVendedor() {
    if (!filtroVendedor) return;
    
    filtroVendedor.innerHTML = '<option value="">Todos</option>';
    
    if (isAdmin) {
        VENDEDORES.forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            filtroVendedor.appendChild(option);
        });
        document.getElementById('filtro-vendedor-container').style.display = 'block';
    } else {
        document.getElementById('filtro-vendedor-container').style.display = 'none';
    }
}

// ========== FORMATAR TIPO ==========
function formatarTipoContrato(tipo) {
    switch(tipo) {
        case 'temporario': return 'Temporário';
        case 'efetivo': return 'Efetivo';
        case 'terceirizado': return 'Terceirizado';
        case 'carta': return 'Carta';
        default: return tipo || 'Não definido';
    }
}

// ========== CONTROLE DOS BOTÕES ==========
function setActive(button) {
    if (activeButton === button) {
        activeButton = null;
        btnCriar.classList.remove('active');
        btnVer.classList.remove('active');
        panelCriar.classList.add('hidden');
        panelVer.classList.add('hidden');
    } else {
        btnCriar.classList.remove('active');
        btnVer.classList.remove('active');
        button.classList.add('active');
        activeButton = button;
        if (button === btnCriar) {
            panelCriar.classList.remove('hidden');
            panelVer.classList.add('hidden');
        } else {
            panelVer.classList.remove('hidden');
            panelCriar.classList.add('hidden');
            carregarPropostas();
        }
    }
}

btnCriar.addEventListener('click', () => setActive(btnCriar));
btnVer.addEventListener('click', () => setActive(btnVer));

// ========== CUSTOM SELECT ==========
function initCustomSelect() {
    const customSelect = document.getElementById('custom-select');
    const hiddenSelect = document.getElementById('contrato-criar');
    
    if (!customSelect || !hiddenSelect) return;
    
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const valueSpan = trigger.querySelector('.custom-select-value');
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });
    
    const options = customSelect.querySelectorAll('.custom-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            const text = option.textContent.trim();
            
            valueSpan.textContent = text;
            hiddenSelect.value = value;
            
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            customSelect.classList.remove('open');
            
            const changeEvent = new Event('change', { bubbles: true });
            hiddenSelect.dispatchEvent(changeEvent);
        });
    });
    
    document.addEventListener('click', () => {
        customSelect.classList.remove('open');
    });
    
    customSelect.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ========== CRIAÇÃO DE PROPOSTA ==========
btnContinuar.addEventListener('click', () => {
    const hiddenSelect = document.getElementById('contrato-criar');
    const contrato = hiddenSelect ? hiddenSelect.value : '';
    if (!contrato) {
        alert('Selecione o tipo de documento.');
        return;
    }
    if (contrato === 'carta') {
        window.location.href = `carta.html?vendedor=${encodeURIComponent(usuarioNome)}`;
    } else {
        window.location.href = `${contrato}.html?vendedor=${encodeURIComponent(usuarioNome)}`;
    }
});

// ========== CARREGAR PROPOSTAS ==========
function carregarPropostas() {
    cardsContainer.innerHTML = '<div class="loading-state"><i class="bx bx-loader-alt bx-spin"></i><p>Carregando propostas...</p></div>';
    
    const promises = [];
    promises.push(db.collection('propostas').orderBy('data', 'desc').get());
    promises.push(db.collection('cartas').orderBy('dataAtualizacao', 'desc').get());
    
    Promise.all(promises)
        .then(([propostasSnap, cartasSnap]) => {
            propostas = [];
            
            propostasSnap.forEach((doc) => {
                const data = doc.data();
                let vendedorNome = data.vendedor;
                if (vendedorNome && vendedorNome.includes('@')) {
                    vendedorNome = getNomeFromEmail(vendedorNome);
                }
                
                let clienteNome = '';
                let cargosLista = [];
                let totalGeral = data.totalGeral || 0;
                
                // 🔥 LIDAR COM TIMESTAMP DO FIREBASE
                let dataProposta = data.data;
                if (dataProposta && typeof dataProposta.toDate === 'function') {
                    dataProposta = dataProposta.toDate();
                } else if (dataProposta && !(dataProposta instanceof Date)) {
                    dataProposta = new Date(dataProposta);
                } else if (!dataProposta) {
                    dataProposta = new Date(0);
                }
                
                if (data.dadosCriptografados) {
                    const dadosDescriptografados = decryptData(data.dadosCriptografados);
                    if (dadosDescriptografados) {
                        clienteNome = dadosDescriptografados.cliente || '';
                        cargosLista = dadosDescriptografados.cargos || [];
                        totalGeral = dadosDescriptografados.totalGeral || data.totalGeral || 0;
                    } else {
                        clienteNome = data.cliente || 'Erro ao descriptografar';
                        cargosLista = data.cargos || [];
                    }
                } else {
                    clienteNome = data.cliente || '';
                    cargosLista = data.cargos || [];
                }
                
                propostas.push({ 
                    id: doc.id, 
                    cliente: clienteNome,
                    vendedor: vendedorNome,
                    tipo: data.tipo || 'efetivo',
                    colecao: 'propostas',
                    data: dataProposta,
                    dataOrdenacao: dataProposta,
                    totalGeral: totalGeral,
                    cargos: cargosLista
                });
            });
            
            cartasSnap.forEach((doc) => {
                const data = doc.data();
                let vendedorNome = data.vendedor || data.usuario;
                if (vendedorNome && vendedorNome.includes('@')) {
                    vendedorNome = getNomeFromEmail(vendedorNome);
                }
                const tituloCarta = data.nome || 'Carta sem nome';
                
                // 🔥 LIDAR COM TIMESTAMP DAS CARTAS
                let dataCarta = data.dataAtualizacao || data.dataGeracao || new Date();
                if (dataCarta && typeof dataCarta.toDate === 'function') {
                    dataCarta = dataCarta.toDate();
                } else if (dataCarta && !(dataCarta instanceof Date)) {
                    dataCarta = new Date(dataCarta);
                }
                
                propostas.push({ 
                    id: doc.id, 
                    cliente: tituloCarta,
                    vendedor: vendedorNome || 'Não informado',
                    data: dataCarta,
                    tipo: 'carta',
                    totalGeral: 0,
                    cargos: [],
                    colecao: 'cartas',
                    dataOrdenacao: dataCarta
                });
            });
            
            // 🔥 ORDENAR POR DATA (MAIS RECENTE PRIMEIRO)
            propostas.sort((a, b) => {
                const dateA = a.dataOrdenacao instanceof Date ? a.dataOrdenacao : new Date(0);
                const dateB = b.dataOrdenacao instanceof Date ? b.dataOrdenacao : new Date(0);
                return dateB - dateA;
            });
            
            if (!isAdmin) {
                propostas = propostas.filter(p => p.vendedor === usuarioNome);
            }
            
            aplicarFiltros();
        })
        .catch((error) => {
            console.error('Erro ao carregar:', error);
            cardsContainer.innerHTML = '<div class="loading-state"><i class="bx bx-error-circle"></i><p>Erro ao carregar propostas</p></div>';
        });
}

// ========== DUPLICAR ==========
async function duplicarProposta(originalId, tipoProposta, colecao) {
    try {
        const docRef = db.collection(colecao).doc(originalId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) throw new Error('Documento original não encontrado');
        
        const dadosOriginais = docSnap.data();
        const user = auth.currentUser;
        
        if (colecao === 'cartas') {
            let nomeCopia = dadosOriginais.nome || 'Carta';
            if (nomeCopia && !nomeCopia.toLowerCase().includes('(cópia)')) {
                nomeCopia = nomeCopia + ' (cópia)';
            }
            const dadosCopia = {
                ...dadosOriginais,
                nome: nomeCopia,
                dataGeracao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                usuario: usuarioNome,
                originalId: originalId
            };
            delete dadosCopia.id;
            const novaRef = await db.collection('cartas').add(dadosCopia);
            window.location.href = `carta.html?id=${novaRef.id}`;
        } else {
            // Verificar se é proposta com criptografia
            if (dadosOriginais.dadosCriptografados) {
                const dadosDescriptografados = decryptData(dadosOriginais.dadosCriptografados);
                if (dadosDescriptografados) {
                    let clienteCopia = dadosDescriptografados.cliente || '';
                    if (clienteCopia && !clienteCopia.toLowerCase().includes('(cópia)')) {
                        clienteCopia = clienteCopia + ' (cópia)';
                    }
                    const cargosCopia = dadosDescriptografados.cargos || [];
                    const totalGeralCopia = dadosDescriptografados.totalGeral || dadosOriginais.totalGeral || 0;
                    
                    const novosDadosSensiveis = {
                        cliente: clienteCopia,
                        cargos: cargosCopia,
                        totalGeral: totalGeralCopia
                    };
                    
                    const dadosCopia = {
                        vendedor: usuarioNome,
                        emailVendedor: user?.email || dadosOriginais.emailVendedor,
                        tipo: tipoProposta,
                        data: firebase.firestore.FieldValue.serverTimestamp(),
                        totalGeral: totalGeralCopia,
                        dadosCriptografados: encryptData(novosDadosSensiveis),
                        originalId: originalId
                    };
                    
                    const novaRef = await db.collection('propostas').add(dadosCopia);
                    window.location.href = `${tipoProposta}.html?id=${novaRef.id}`;
                    return;
                }
            }
            
            // Fallback para propostas antigas
            let clienteCopia = dadosOriginais.cliente || '';
            if (clienteCopia && !clienteCopia.toLowerCase().includes('(cópia)')) {
                clienteCopia = clienteCopia + ' (cópia)';
            }
            
            const dadosCopia = {
                ...dadosOriginais,
                cliente: clienteCopia,
                data: firebase.firestore.FieldValue.serverTimestamp(),
                vendedor: usuarioNome,
                originalId: originalId
            };
            delete dadosCopia.id;
            
            const novaRef = await db.collection('propostas').add(dadosCopia);
            window.location.href = `${tipoProposta}.html?id=${novaRef.id}`;
        }
    } catch (error) {
        console.error('Erro ao duplicar:', error);
        alert('Erro ao duplicar. Tente novamente.');
    }
}

// ========== EXCLUIR ==========
async function excluirProposta(propostaId, colecao) {
    try {
        await db.collection(colecao).doc(propostaId).delete();
        await carregarPropostas();
        return true;
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir. Tente novamente.');
        return false;
    }
}

// ========== APLICAR FILTROS ==========
// ========== APLICAR FILTROS ==========
function aplicarFiltros() {
    const filtroClienteVal = filtroCliente ? filtroCliente.value.toLowerCase().trim() : '';
    const filtroVendedorVal = (isAdmin && filtroVendedor) ? filtroVendedor.value : usuarioNome;
    const filtroTipoVal = filtroTipo ? filtroTipo.value : '';
    const dataInicioVal = filtroDataInicio && filtroDataInicio.value ? new Date(filtroDataInicio.value) : null;
    let dataFimVal = filtroDataFim && filtroDataFim.value ? new Date(filtroDataFim.value) : null;
    if (dataFimVal) dataFimVal.setHours(23, 59, 59);

    let filtradas = propostas.filter(p => {
        const cliente = p.cliente || '';
        const clienteMatch = cliente.toLowerCase().includes(filtroClienteVal);
        const vendedorMatch = !isAdmin ? true : (filtroVendedorVal === '' || p.vendedor === filtroVendedorVal);
        const tipoMatch = filtroTipoVal === '' || p.tipo === filtroTipoVal;
        
        let dataMatch = true;
        if (p.data) {
            // 🔥 GARANTIR QUE DATA É UM OBJETO DATE VÁLIDO
            let dataProposta = p.data;
            if (dataProposta instanceof Date) {
                dataProposta = dataProposta;
            } else if (dataProposta && typeof dataProposta.toDate === 'function') {
                dataProposta = dataProposta.toDate();
            } else {
                dataProposta = new Date(dataProposta);
            }
            
            if (dataInicioVal && dataProposta < dataInicioVal) dataMatch = false;
            if (dataFimVal && dataProposta > dataFimVal) dataMatch = false;
        }
        return clienteMatch && vendedorMatch && tipoMatch && dataMatch;
    });

    if (!cardsContainer) return;

    if (filtradas.length === 0) {
        cardsContainer.innerHTML = '<div class="loading-state"><i class="bx bx-folder-open"></i><p>Nenhuma proposta encontrada</p></div>';
        return;
    }

    let html = '';
    filtradas.forEach(p => {
        // 🔥 FORMATAR DATA CORRETAMENTE
        let data = p.data;
        if (data instanceof Date) {
            data = data;
        } else if (data && typeof data.toDate === 'function') {
            data = data.toDate();
        } else {
            data = new Date(data);
        }
        
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
            <div class="proposta-card" data-id="${p.id}" data-tipo="${p.tipo || 'efetivo'}" data-colecao="${p.colecao || 'propostas'}">
                <div class="card-header">
                    <span class="cliente-nome">${escapeHtml(p.cliente || 'Sem título')}</span>
                    <div class="right-group">
                        <div class="card-badges">
                            <span class="vendedor-badge">${escapeHtml(p.vendedor || 'Não informado')}</span>
                            <span class="tipo-badge">${escapeHtml(tipoContrato)}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-duplicar" data-id="${p.id}" data-tipo="${p.tipo || 'efetivo'}" data-colecao="${p.colecao || 'propostas'}" title="Duplicar">
                                <i class='bx bx-copy'></i>
                            </button>
                            <button class="btn-excluir" data-id="${p.id}" data-colecao="${p.colecao || 'propostas'}" title="Excluir">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <span><i class='bx bx-calendar'></i> ${dataStr}</span>
                    ${p.tipo !== 'carta' ? `<span><i class='bx bx-briefcase'></i> ${totalCargos} cargo(s)</span>` : '<span><i class="bx bx-envelope"></i> Carta</span>'}
                </div>
                ${nomesCargos && p.tipo !== 'carta' ? `<div class="card-cargos"><i class='bx bx-user-tie'></i> ${escapeHtml(nomesCargos)}</div>` : ''}
                ${p.tipo !== 'carta' ? `<div class="card-footer">R$ ${totalGeral}</div>` : '<div class="card-footer">Carta</div>'}
            </div>
        `;
    });
    cardsContainer.innerHTML = html;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== MODAIS ==========
modalConfirmBtn.addEventListener('click', () => {
    if (propostaSelecionada) {
        if (propostaSelecionada.tipo === 'carta') {
            window.location.href = `carta.html?id=${propostaSelecionada.id}`;
        } else {
            window.location.href = `${propostaSelecionada.tipo}.html?id=${propostaSelecionada.id}`;
        }
    }
    confirmModal.style.display = 'none';
});

modalDeleteBtn.addEventListener('click', async () => {
    if (propostaSelecionada) {
        await excluirProposta(propostaSelecionada.id, propostaSelecionada.colecao);
    }
    deleteModal.style.display = 'none';
    propostaSelecionada = null;
});

modalCancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        deleteModal.style.display = 'none';
        propostaSelecionada = null;
    });
});

window.addEventListener('click', (e) => {
    if (e.target === confirmModal) confirmModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
});

// ========== LOGOUT ==========
btnLogout.addEventListener('click', () => {
    auth.signOut().then(() => {
        sessionStorage.clear();
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
        localStorage.removeItem('remember_me');
        window.location.href = 'index.html';
    }).catch(() => {
        window.location.href = 'index.html';
    });
});

// ========== EVENTOS DE FILTRO ==========
if (filtroCliente) filtroCliente.addEventListener('input', aplicarFiltros);
if (filtroVendedor) filtroVendedor.addEventListener('change', aplicarFiltros);
if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
if (filtroDataInicio) filtroDataInicio.addEventListener('change', aplicarFiltros);
if (filtroDataFim) filtroDataFim.addEventListener('change', aplicarFiltros);

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    initCustomSelect();
    
    setTimeout(() => {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                if (!window._isRedirecting) {
                    window._isRedirecting = true;
                    window.location.href = 'index.html';
                }
                return;
            }
            if (verificarSessao()) {
                configurarFiltroVendedor();
            }
        });
    }, 100);
});