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

// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o Firebase foi carregado
    if (typeof firebase === 'undefined') {
        console.error('Firebase não carregado! Verifique os scripts no HTML.');
        alert('Erro: Firebase não carregado. Recarregue a página.');
        return;
    }

    // Inicializar Firebase (se já não estiver inicializado)
    if (!firebase.apps.length) {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            alert('Erro ao inicializar Firebase. Verifique o console.');
            return;
        }
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Configurar persistência de sessão
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .catch((error) => {
            console.error('Erro ao configurar persistência:', error);
        });

    // ================== TEMA CLARO/ESCURO ==================
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_login');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        const textoTema = btnTema?.querySelector('span');
        
        // Se NÃO houver tema salvo, ou se o tema salvo for 'light', aplica o tema claro
        if (!temaSalvo || temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
            if (textoTema) textoTema.textContent = 'Modo claro';
            if (!temaSalvo) {
                localStorage.setItem('tema_login', 'light');
            }
        } else if (temaSalvo === 'dark') {
            document.body.classList.remove('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-sun');
                iconTema.classList.add('fa-moon');
            }
            if (textoTema) textoTema.textContent = 'Modo escuro';
        }
        
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('tema_login', isLight ? 'light' : 'dark');
                
                if (iconTema) {
                    if (isLight) {
                        iconTema.classList.remove('fa-moon');
                        iconTema.classList.add('fa-sun');
                        if (textoTema) textoTema.textContent = 'Modo claro';
                    } else {
                        iconTema.classList.remove('fa-sun');
                        iconTema.classList.add('fa-moon');
                        if (textoTema) textoTema.textContent = 'Modo escuro';
                    }
                }
            });
        }
    }
    
    // Inicializar tema
    initTema();

    // ================== ELEMENTOS ==================
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalOk = document.getElementById('modal-ok');
    const btnLogin = document.getElementById('btn-login');

    // Verificar se os elementos existem
    if (!form || !emailInput || !passwordInput) {
        console.error('Elementos do formulário não encontrados!');
        return;
    }

    // Desabilitar botão durante login
    function setLoading(isLoading) {
        if (btnLogin) {
            if (isLoading) {
                btnLogin.disabled = true;
                btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            } else {
                btnLogin.disabled = false;
                btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            }
        }
    }

    // Função para mostrar modal
    function mostrarModal(mensagem, isError = true) {
        if (modalMensagem && modalOverlay) {
            modalMensagem.textContent = mensagem;
            modalOverlay.classList.remove('hidden');
            
            if (isError && passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        } else {
            alert(mensagem);
        }
    }

    // Fechar modal
    if (modalOk) {
        modalOk.addEventListener('click', () => {
            if (modalOverlay) modalOverlay.classList.add('hidden');
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
        });
    }

    // Toggle de visibilidade da senha
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Carregar credenciais salvas se existirem
    function loadSavedCredentials() {
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        const remember = localStorage.getItem('remember_me') === 'true';
        
        if (remember && savedEmail && savedPassword && emailInput && passwordInput) {
            emailInput.value = savedEmail;
            passwordInput.value = savedPassword;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        } else if (emailInput && passwordInput) {
            emailInput.value = '';
            passwordInput.value = '';
        }
    }

    loadSavedCredentials();

    // Salvar credenciais se "lembrar-me" estiver marcado
    function saveCredentials(email, senha, remember) {
        if (remember) {
            localStorage.setItem('remembered_email', email);
            localStorage.setItem('remembered_password', senha);
            localStorage.setItem('remember_me', 'true');
        } else {
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
            localStorage.setItem('remember_me', 'false');
        }
    }

    // Verificar se há uma sessão ativa
    function checkActiveSession() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                const nome = user.email.split('@')[0];
                sessionStorage.setItem('session_email', user.email);
                sessionStorage.setItem('session_name', nome);
                window.location.href = 'menu.html';
            }
        });
    }

    checkActiveSession();

    // ================== LOGIN COM FIREBASE AUTH ==================
    async function fazerLoginComFirebase(email, senha) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, senha);
            return userCredential.user;
        } catch (error) {
            console.error('Erro no login:', error.code, error.message);
            throw error;
        }
    }

    // ================== EVENTO DE SUBMIT ==================
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const senha = passwordInput.value;
            const remember = rememberCheckbox ? rememberCheckbox.checked : false;
            
            // Validação básica
            if (!email || !senha) {
                mostrarModal('Por favor, preencha todos os campos.');
                return;
            }
            
            // Validação de formato de email
            const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarModal('Por favor, insira um e-mail válido.');
                return;
            }
            
            setLoading(true);
            
            try {
                const user = await fazerLoginComFirebase(email, senha);
                
                if (user) {
                    saveCredentials(email, senha, remember);
                    
                    const nome = email.split('@')[0];
                    sessionStorage.setItem('session_email', email);
                    sessionStorage.setItem('session_name', nome);
                    
                    mostrarModal('Login realizado com sucesso! Redirecionando...', false);
                    
                    setTimeout(() => {
                        window.location.href = 'menu.html';
                    }, 1000);
                }
            } catch (error) {
                let mensagemErro = 'E-mail ou senha inválidos.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        mensagemErro = 'Usuário não encontrado. Verifique o e-mail.';
                        break;
                    case 'auth/wrong-password':
                        mensagemErro = 'Senha incorreta. Tente novamente.';
                        break;
                    case 'auth/invalid-email':
                        mensagemErro = 'E-mail inválido.';
                        break;
                    case 'auth/user-disabled':
                        mensagemErro = 'Esta conta foi desativada.';
                        break;
                    case 'auth/too-many-requests':
                        mensagemErro = 'Muitas tentativas. Tente novamente mais tarde.';
                        break;
                    case 'auth/network-request-failed':
                        mensagemErro = 'Erro de rede. Verifique sua conexão com a internet.';
                        break;
                    default:
                        mensagemErro = error.message || 'Erro ao fazer login. Tente novamente.';
                }
                
                mostrarModal(mensagemErro);
            } finally {
                setLoading(false);
            }
        });
    }

    // Permitir login com Enter
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && form) {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
});