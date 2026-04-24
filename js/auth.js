/**
 * MÓDULO DE AUTENTICAÇÃO (SENSUS)
 * * Conectado oficialmente ao Supabase Auth e blindado.
 */

// 1. Inicializa o cliente oficial. 
// Mudamos o nome da variável para 'supabaseClient' para evitar conflito com a biblioteca global.
const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Torna o cliente global para podermos usá-lo em outros arquivos (como app.js e database.js)
window.supabaseClient = supabaseClient;

const authService = {
    // Retorna o usuário do cache local para não causar lentidão no carregamento da tela
    getCurrentUser() {
        const userStr = localStorage.getItem('sensus_current_user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    },

    // Realiza o login real no servidor
    async login(email, password) {
        // Tenta abrir o "cofre" com e-mail e senha
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw new Error("E-mail ou senha incorretos.");

        // Se abriu, busca os dados públicos dele (Nome, Telefone, Role) na tabela profiles
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error(profileError);
            throw new Error("Erro ao carregar os dados do seu perfil.");
        }

        // Salva os dados do perfil no cache do navegador e retorna
        localStorage.setItem('sensus_current_user', JSON.stringify(profile));
        return profile;
    },

    // Função de Logout oficial
    async logout() {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('sensus_current_user');
        window.location.reload();
    }
};