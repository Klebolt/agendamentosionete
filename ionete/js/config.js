/**
 * CONFIGURAÇÕES GERAIS DO SISTEMA (SENSUS)
 * * Centraliza constantes, chaves de API e configurações globais.
 */

const CONFIG = {
    // ESTRATÉGIA DE DADOS: Alterada para 'SUPABASE'
    STRATEGY: 'SUPABASE',

    // CREDENCIAIS DO SUPABASE (Localizadas em Settings > API)
    // Substitua os valores abaixo pelas suas chaves reais:
    SUPABASE_URL: "https://npdcvgonnlpqjryleopk.supabase.co", 
    SUPABASE_KEY: "sb_publishable_LsQWAfJKOn3e_W1BT0aJng_TLloj0eZ",

    // Link fixo do Google Meet para as sessões
    MEET_URL: "https://meet.google.com/aya-dwib-bwx",

    // Configurações de exibição e UX
    SYSTEM_NAME: "Psi.Ionete",
    SESSION_DURATION_MINUTES: 50,
    NOTIFICATION_THRESHOLD_MINUTES: 15, // Alerta visual 15 min antes

    // Chaves para o LocalStorage (Mantidas para compatibilidade ou cache local)
    STORAGE_KEYS: {
        USERS: 'sensus_users',
        APPOINTMENTS: 'sensus_appointments',
        NOTES: 'sensus_psychologist_notes',
        SETTINGS: 'sensus_admin_settings'
    }
};

// Papéis de usuário (Roles) padronizados
const ROLES = {
    PATIENT: 'PACIENTE',
    PSYCHOLOGIST: 'PSICOLOGO'
};

// Tornar as configurações disponíveis globalmente para todos os módulos
window.CONFIG = CONFIG;
window.ROLES = ROLES;

console.log("🚀 Conexão com Supabase configurada no CONFIG.");
