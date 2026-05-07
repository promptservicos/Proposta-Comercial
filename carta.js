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

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', function() {
    const inputNome = document.getElementById('input-nome');
    const inputEmail = document.getElementById('input-email');
    const inputTelefone = document.getElementById('input-telefone');
    const assinaturaNome = document.getElementById('assinatura-nome');
    const assinaturaEmail = document.getElementById('assinatura-email');
    const assinaturaTelefone = document.getElementById('assinatura-telefone');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    const btnVoltar = document.getElementById('btn-voltar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalOk = document.getElementById('modal-ok');
    const cartaConteudo = document.getElementById('carta-conteudo');
    const corpoCarta = document.getElementById('carta-corpo-editable');

    // Verificar se está editando uma carta existente
    const urlParams = new URLSearchParams(window.location.search);
    const cartaId = urlParams.get('id');

    // Função para formatar telefone automaticamente
    function formatarTelefone(valor) {
        let numeros = valor.replace(/\D/g, '');
        
        if (numeros.length === 0) return '';
        
        if (numeros.length <= 2) {
            return `(${numeros}`;
        } else if (numeros.length <= 6) {
            return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
        } else if (numeros.length <= 10) {
            return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
        } else {
            return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
        }
    }

    inputTelefone.addEventListener('input', function(e) {
        let valor = e.target.value;
        let cursorPos = e.target.selectionStart;
        let formatted = formatarTelefone(valor);
        e.target.value = formatted;
        
        let diff = formatted.length - valor.length;
        e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
        
        atualizarAssinatura();
    });

    function mostrarModal(mensagem) {
        modalMensagem.textContent = mensagem;
        modalOverlay.classList.remove('hidden');
    }

    modalOk.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    btnVoltar.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    function salvarConteudoCarta() {
        const conteudo = corpoCarta.innerHTML;
        localStorage.setItem('carta_conteudo', conteudo);
    }

    function carregarConteudoCarta() {
        const conteudoSalvo = localStorage.getItem('carta_conteudo');
        if (conteudoSalvo && !cartaId) {
            corpoCarta.innerHTML = conteudoSalvo;
        }
    }

    corpoCarta.addEventListener('input', function() {
        salvarConteudoCarta();
        ajustarTamanhoTexto();
    });

    function atualizarAssinatura() {
        const nome = inputNome.value.trim();
        const email = inputEmail.value.trim();
        const telefone = inputTelefone.value.trim();
        
        assinaturaNome.textContent = nome || '_________________________';
        assinaturaEmail.textContent = email || '_________________________';
        assinaturaTelefone.textContent = telefone || '_________________________';
        
        const dadosCarta = {
            nome: nome,
            email: email,
            telefone: telefone,
            data: new Date().toISOString()
        };
        localStorage.setItem('carta_draft', JSON.stringify(dadosCarta));
    }

    inputNome.addEventListener('input', atualizarAssinatura);
    inputEmail.addEventListener('input', atualizarAssinatura);

    function carregarRascunho() {
        const draft = localStorage.getItem('carta_draft');
        if (draft && !cartaId) {
            const dados = JSON.parse(draft);
            if (dados.nome) inputNome.value = dados.nome;
            if (dados.email) inputEmail.value = dados.email;
            if (dados.telefone) inputTelefone.value = dados.telefone;
            atualizarAssinatura();
        }
        carregarConteudoCarta();
    }
    carregarRascunho();

    // Carregar carta existente do Firebase
    async function carregarCartaExistente() {
        if (cartaId) {
            try {
                const doc = await db.collection('cartas').doc(cartaId).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data.nome) inputNome.value = data.nome;
                    if (data.email) inputEmail.value = data.email;
                    if (data.telefone) inputTelefone.value = data.telefone;
                    if (data.conteudo) corpoCarta.innerHTML = data.conteudo;
                    atualizarAssinatura();
                    mostrarModal('Carta carregada com sucesso!');
                }
            } catch (error) {
                console.error('Erro ao carregar carta:', error);
            }
        }
    }
    carregarCartaExistente();

    // Salvar carta no Firebase
    async function salvarCarta() {
        const nome = inputNome.value.trim() || 'Não informado';
        const email = inputEmail.value.trim() || 'Não informado';
        const telefone = inputTelefone.value.trim() || 'Não informado';
        const conteudo = corpoCarta.innerHTML;
        
        if (!conteudo || conteudo.trim() === '') {
            mostrarModal('❌ Escreva algo na carta antes de salvar!');
            return;
        }
        
        const carta = {
            nome: nome,
            email: email,
            telefone: telefone,
            conteudo: conteudo,
            tipo: 'carta',
            dataAtualizacao: new Date().toISOString()
        };
        
        try {
            const usuario = auth.currentUser;
            if (usuario) {
                carta.usuario = usuario.email || usuario.uid;
            }
            
            if (cartaId) {
                await db.collection('cartas').doc(cartaId).update(carta);
                mostrarModal('✅ Carta atualizada com sucesso!');
            } else {
                const docRef = await db.collection('cartas').add(carta);
                mostrarModal('✅ Carta salva com sucesso!');
                window.history.replaceState(null, '', `?id=${docRef.id}`);
                localStorage.removeItem('carta_draft');
                localStorage.removeItem('carta_conteudo');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarModal('❌ Erro ao salvar carta. Tente novamente.');
        }
    }

    btnSalvar.addEventListener('click', salvarCarta);

    function ajustarTamanhoTexto() {
        const cartaConteudoDiv = document.getElementById('carta-conteudo');
        
        cartaConteudoDiv.classList.remove('texto-pequeno', 'texto-medio', 'texto-normal');
        
        const alturaConteudo = cartaConteudoDiv.scrollHeight;
        const larguraConteudo = cartaConteudoDiv.scrollWidth;
        
        const limiteAlturaA4 = 1123;
        const limiteLarguraA4 = 800;
        
        if (alturaConteudo > limiteAlturaA4 || larguraConteudo > limiteLarguraA4) {
            const fatorAltura = limiteAlturaA4 / alturaConteudo;
            const fatorLargura = limiteLarguraA4 / larguraConteudo;
            const fator = Math.min(fatorAltura, fatorLargura, 0.9);
            
            if (fator < 0.7) {
                cartaConteudoDiv.classList.add('texto-pequeno');
            } else if (fator < 0.85) {
                cartaConteudoDiv.classList.add('texto-medio');
            } else {
                cartaConteudoDiv.classList.add('texto-normal');
            }
        } else {
            cartaConteudoDiv.classList.add('texto-normal');
        }
        
        if (alturaConteudo < 400) {
            cartaConteudoDiv.classList.add('texto-normal');
        }
    }

    const observer = new MutationObserver(function(mutations) {
        ajustarTamanhoTexto();
    });
    
    observer.observe(corpoCarta, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    function formatarData() {
        const now = new Date();
        return now.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function gerarImagemCarta() {
        const btnOriginalHtml = btnCompartilhar.innerHTML;
        btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
        btnCompartilhar.disabled = true;
        
        try {
            const cartaElement = document.getElementById('carta-para-imagem');
            
            const wasLightMode = document.body.classList.contains('light-mode');
            if (!wasLightMode) {
                document.body.classList.add('light-mode');
            }
            
            ajustarTamanhoTexto();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const dataElement = document.createElement('div');
            dataElement.className = 'carta-data';
            dataElement.style.textAlign = 'center';
            dataElement.style.fontSize = '0.8rem';
            dataElement.style.color = '#999';
            dataElement.style.marginTop = '1rem';
            dataElement.style.paddingTop = '1rem';
            dataElement.style.borderTop = '1px solid #eee';
            dataElement.innerHTML = `Documento gerado em ${formatarData()}`;
            
            const cartaConteudoEl = cartaElement.querySelector('.carta-conteudo');
            cartaConteudoEl.appendChild(dataElement);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const canvas = await html2canvas(cartaElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: cartaElement.scrollWidth,
                windowHeight: cartaElement.scrollHeight
            });
            
            dataElement.remove();
            
            if (!wasLightMode) {
                document.body.classList.remove('light-mode');
            }
            
            const link = document.createElement('a');
            const nomeArquivo = `carta_prompt_${new Date().getTime()}.png`;
            link.download = nomeArquivo;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            mostrarModal('✅ Carta salva como imagem com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            mostrarModal('❌ Erro ao gerar imagem. Tente novamente.');
        } finally {
            btnCompartilhar.innerHTML = btnOriginalHtml;
            btnCompartilhar.disabled = false;
        }
    }

    btnCompartilhar.addEventListener('click', gerarImagemCarta);

    function initTema() {
        const temaSalvo = localStorage.getItem('tema_efetivo');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        if (temaSalvo === 'dark' || !temaSalvo) {
            document.body.classList.remove('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-sun');
                iconTema.classList.add('fa-moon');
            }
            if (!temaSalvo) {
                localStorage.setItem('tema_efetivo', 'dark');
            }
        } else if (temaSalvo === 'light') {
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
    
    setTimeout(() => {
        ajustarTamanhoTexto();
    }, 100);
    
    initTema();
});