/**
 * ORQUESTRADOR PRINCIPAL (Router/App)
 * * Controla qual tela deve ser exibida e gerencia eventos globais.
 * * Atualizado: Motor de Cadastro, Modal de TCLE e Recuperação plugados no Supabase.
 */

const app = {

    // VACINA CONTRA XSS: Transforma códigos HTML maliciosos em texto inofensivo
    escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, function (tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            };
            return charsToReplace[tag] || tag;
        });
    },
    container: document.getElementById('app-container'),
    nav: document.getElementById('main-nav'),
    userNameDisplay: document.getElementById('user-display-name'),

    async init() {
        console.log("🚀 Iniciando Sensus App...");
        const user = authService.getCurrentUser();

        if (!user) {
            this.renderAuthView('login');
        } else {
            this.setupNavigation(user);
            this.routeUser(user);
        }
    },

    setupNavigation(user) {
        this.nav.classList.remove('hidden');
        this.userNameDisplay.textContent = `Olá, ${user.name.split(' ')[0]}`;
    },

    routeUser(user) {
        if (user.role === ROLES.PATIENT) {
            if (typeof patientApp !== 'undefined') patientApp.renderDashboard();
            else this.container.innerHTML = '<p>Módulo do paciente carregando...</p>';
        } else if (user.role === ROLES.PSYCHOLOGIST) {
            if (typeof adminApp !== 'undefined') adminApp.renderDashboard();
            else this.container.innerHTML = '<p>Módulo do psicólogo carregando...</p>';
        }
    },

    openTermsModal(e) {
        if (e) e.preventDefault();
        const existing = document.getElementById('tcle-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tcle-modal';
        modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-transition animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Termo de Consentimento Livre e Esclarecido (TCLE)</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Legenda: Leia atentamente as diretrizes éticas e de privacidade antes de confirmar seu cadastro.</p>
                    </div>
                    <button type="button" onclick="document.getElementById('tcle-modal').remove()" class="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                </div>
                <div class="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-600 leading-relaxed">
                    <div class="bg-sky-50 border border-sky-100 p-3.5 rounded-xl text-xs text-sky-900">
                        <strong>Profissional Responsável:</strong> Psicóloga Clínica Ionete | CRP 06/226283<br>
                        <strong>Abordagem:</strong> Abordagem Sistêmica - Acompanhamento Psicológico e Terapêutico.
                    </div>
                    <p><strong>1. Objetivo e Funcionamento Online:</strong> Este sistema destina-se ao agendamento e acompanhamento psicológico realizado de forma síncrona (por videochamada), em conformidade com as diretrizes do Conselho Federal de Psicologia (Resolução CFP nº 09/2024) e a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
                    <p><strong>2. Sigilo e Confidencialidade:</strong> Todas as informações compartilhadas durante as sessões, bem como os registros de prontuário eletrônico neste portal, são estritamente confidenciais e protegidos pelo Código de Ética Profissional do Psicólogo. Recomenda-se que o paciente realize as sessões em local privado e utilize fones de ouvido.</p>
                    <p><strong>3. Política de Agendamento e Cancelamento:</strong> Os agendamentos e reagendamentos pela plataforma podem ser realizados livremente com até <strong>24 horas de antecedência</strong> do horário marcado. Caso precise cancelar com menos de 24 horas, o paciente deverá comunicar diretamente a profissional via WhatsApp.</p>
                    <p><strong>4. Proteção de Dados (LGPD):</strong> Seus dados cadastrais (nome, e-mail e telefone) são utilizados exclusivamente para identificação clínica, comunicação sobre suas consultas e envio de confirmações de agendamento.</p>
                </div>
                <div class="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
                    <button type="button" onclick="document.getElementById('tcle-modal').remove()" class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800">Fechar</button>
                    <button type="button" onclick="const cb = document.getElementById('reg-terms'); if(cb) cb.checked = true; document.getElementById('tcle-modal').remove();" class="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors">
                        Li e Concordo com os Termos
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    renderAuthView(view = 'login') {
        this.nav.classList.add('hidden');
        let formContent = '';

        if (view === 'login') {
            formContent = `
            <div class="profile-container">
                        <img src="img/IMAGEM_PROFISSIONAL_LOGINN.jpeg" alt="Psi. Ionete" class="profile-image">
                        <h2 class="profile-title">Psy.Ionete</h2>
                        <p class="profile-subtitle">Psicóloga Clínica | CRP 06/226283</p>
                        <p class="profile-subtitle">Abordagem Sistêmica<br>Acompanhamento Piscológico e Terapêutico</p>
                    </div>

                <!--<div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-slate-900 tracking-tight mb-2">Psi<span class="text-sky-500">.</span>Ionete</h2>
                    <p class="text-slate-600">Acesso ao portal de Agendamentos</p>
                </div>-->
                <form id="auth-form" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                        <input type="email" id="email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all" placeholder="seu.nome@email.com">
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-sm font-medium text-slate-700">Senha</label>
                            <button type="button" onclick="app.renderAuthView('recover')" class="text-xs font-semibold text-sky-600 hover:text-sky-800">Esqueceu a senha?</button>
                        </div>
                        <input type="password" id="password" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all" placeholder="••••••••">
                    </div>
                    <div id="auth-error" class="text-red-500 text-sm hidden font-medium text-center bg-red-50 p-2 rounded"></div>
                    <button type="submit" id="btn-submit" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        Entrar na Plataforma
                    </button>
                    <p class="text-center text-sm text-slate-600 mt-4">
                        Ainda não tem acesso? <button type="button" onclick="app.renderAuthView('register')" class="font-bold text-sky-600 hover:text-sky-800">Cadastre-se</button>
                    </p>
                </form>
            `;
        }
        else if (view === 'register') {
            formContent = `
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Criar Conta</h2>
                    <p class="text-sm text-slate-500 mt-1">Preencha seus dados para acessar a tela de agendamentos.</p>
                </div>
                <form id="auth-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input type="text" id="reg-name" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                        <input type="email" id="reg-email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Celular (WhatsApp)</label>
                        <input type="tel" id="reg-phone" required placeholder="(00) 00000-0000" maxlength="15" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Crie uma Senha</label>
                        <input type="password" id="reg-password" required minlength="6" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Mínimo 6 caracteres">
                    </div>
                    
                    <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                        <div class="flex items-start">
                            <div class="flex items-center h-5 mt-0.5">
                                <input id="reg-terms" type="checkbox" required class="w-4 h-4 text-teal-600 bg-white border-slate-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer">
                            </div>
                            <label for="reg-terms" class="ml-2 text-xs text-slate-600 cursor-pointer leading-relaxed">
                                Eu li e aceito o <button type="button" onclick="app.openTermsModal(event)" class="text-sky-600 hover:underline font-bold">Termo de Consentimento Livre e Esclarecido (TCLE)</button> e a Política de Privacidade.
                            </label>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-1.5 pl-6">Legenda: Clique no link azul acima para ler o documento completo na tela.</p>
                    </div>

                    <div id="auth-error" class="text-red-500 text-sm hidden font-medium text-center bg-red-50 p-2 rounded"></div>
                    <button type="submit" id="btn-submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2">
                        Finalizar Cadastro
                    </button>
                    <p class="text-center text-sm text-slate-600 mt-4">
                        Já tem uma conta? <button type="button" onclick="app.renderAuthView('login')" class="font-bold text-sky-600 hover:text-sky-800">Fazer Login</button>
                    </p>
                </form>
            `;
        }
        else if (view === 'recover') {
            formContent = `
                <div class="text-center mb-6">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 mb-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Recuperar Senha</h2>
                    <p class="text-sm text-slate-500 mt-2">Digite seu e-mail para receber as instruções de redefinição.</p>
                </div>
                <form id="auth-form" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail Cadastrado</label>
                        <input type="email" id="rec-email" required class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                    </div>
                    <div id="auth-error" class="text-red-500 text-sm hidden font-medium text-center bg-red-50 p-2 rounded"></div>
                    <button type="submit" id="btn-submit" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        Enviar Link de Recuperação
                    </button>
                    <button type="button" onclick="app.renderAuthView('login')" class="w-full mt-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        Voltar para o Login
                    </button>
                </form>
            `;
        }

        this.container.innerHTML = `
            <div class="fixed inset-0 w-full h-full flex items-center justify-center view-transition animate-fade-in bg-cover bg-center bg-no-repeat overflow-y-auto" style="background-image: url('img/imagem_fundo_login.png'); z-index: 0;">
                <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-0 pointer-events-none"></div>
                
                <div class="flex flex-col max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 m-4 relative z-10">
                    <div class="w-full p-8 sm:p-12 flex flex-col justify-center bg-white">
                        ${formContent}
                    </div>
                </div>
            </div>
        `;

        if (view === 'register') {
            const phoneInput = document.getElementById('reg-phone');
            phoneInput.addEventListener('input', function (e) {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        }

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('auth-error');
            const btn = document.getElementById('btn-submit');
            const originalBtnText = btn.innerText;

            btn.innerHTML = `<span class="animate-pulse">Processando...</span>`;
            btn.disabled = true;
            errorDiv.classList.add('hidden');

            try {
                // FLUXO DE LOGIN INTEGRADO AO SUPABASE
                if (view === 'login') {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    await authService.login(email, password);
                    this.init();
                }

                // FLUXO DE CADASTRO INTEGRADO AO SUPABASE
                else if (view === 'register') {
                    const termsAccepted = document.getElementById('reg-terms').checked;
                    if (!termsAccepted) throw new Error("Você precisa aceitar o Termo de Consentimento para continuar.");

                    const name = document.getElementById('reg-name').value;
                    const email = document.getElementById('reg-email').value;
                    const phone = document.getElementById('reg-phone').value;
                    const password = document.getElementById('reg-password').value;

                    if (phone.replace(/\D/g, '').length < 10) throw new Error("Por favor, insira um número de celular válido.");

                    // Dispara a criação da conta na nuvem registrando a data/hora do aceite do TCLE
                    const { data, error } = await window.supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                name: name,
                                phone: phone,
                                role: ROLES.PATIENT,
                                tcle_accepted_at: new Date().toISOString()
                            }
                        }
                    });

                    if (error) throw new Error(error.message);

                    this.showNotification("Conta Criada!", "Seu cadastro foi realizado com sucesso. Faça login para continuar.", false);
                    setTimeout(() => this.renderAuthView('login'), 2000);
                }

                // FLUXO DE RECUPERAÇÃO DE SENHA INTEGRADO
                else if (view === 'recover') {
                    const recEmail = document.getElementById('rec-email').value;

                    const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(recEmail, {
                        redirectTo: window.location.origin + '/index.html',
                    });

                    if (error) throw new Error(error.message);

                    this.showNotification("E-mail Enviado!", "Verifique sua caixa de entrada (ou spam) para redefinir sua senha.", false);
                    setTimeout(() => this.renderAuthView('login'), 3000);
                }

            } catch (error) {
                if (error.message.includes('Invalid login credentials')) {
                    errorDiv.textContent = "E-mail ou senha incorretos.";
                } else if (error.message.includes('User already registered')) {
                    errorDiv.textContent = "Este e-mail já possui cadastro.";
                } else {
                    errorDiv.textContent = error.message;
                }

                errorDiv.classList.remove('hidden');
                btn.innerText = originalBtnText;
                btn.disabled = false;
            }
        });
    },

    showNotification(title, message, isAlert = false) {
        const container = document.getElementById('notification-container');
        const notif = document.createElement('div');

        const bgClass = isAlert ? 'bg-sky-500 text-white' : 'bg-white text-slate-800 border border-slate-200';
        const titleColor = isAlert ? 'text-white' : 'text-slate-900';

        notif.className = `p-4 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-500 translate-x-full ${bgClass} mb-2`;
        notif.innerHTML = `
            <div class="flex items-start">
                <div class="flex-1">
                    <h4 class="font-bold text-sm ${titleColor}">${title}</h4>
                    <p class="text-sm mt-1 opacity-90">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 opacity-70 hover:opacity-100 font-bold">&times;</button>
            </div>
        `;

        container.appendChild(notif);
        setTimeout(() => notif.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notif.classList.add('translate-x-full');
            setTimeout(() => notif.remove(), 500);
        }, 8000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
