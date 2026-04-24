/**
 * MÓDULO DE BANCO DE DADOS (SENSUS)
 * * Conectado oficialmente ao Supabase.
 * * Responsável por todas as leituras e gravações nas tabelas blindadas (RLS).
 */

const dbService = {
    
    // ==========================================
    // 👤 PERFIS (PROFILES)
    // ==========================================

    async getUserById(userId) {
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Erro ao buscar usuário:", error);
            return null;
        }
        return data;
    },

    async getAllPatients() {
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', ROLES.PATIENT)
            .order('name', { ascending: true });

        if (error) {
            console.error("Erro ao buscar pacientes:", error);
            return [];
        }
        return data;
    },

    // ==========================================
    // 📅 AGENDAMENTOS (APPOINTMENTS)
    // ==========================================

    async getAppointments(userId, role) {
        let query = window.supabaseClient.from('appointments').select('*');

        // Se for paciente, filtra só os dele. Se for admin, o RLS já garante que ele veja todos.
        if (role === ROLES.PATIENT && userId) {
            query = query.eq('patient_id', userId);
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) {
            console.error("Erro ao buscar agendamentos:", error);
            return [];
        }

        // Mapeia o formato do banco (snake_case) para o formato do nosso painel (camelCase)
        return data.map(app => ({
            id: app.id,
            patientId: app.patient_id,
            date: app.date,
            status: app.status
        }));
    },

    async createAppointment(appointmentData) {
        const { data, error } = await window.supabaseClient
            .from('appointments')
            .insert([
                {
                    patient_id: appointmentData.patientId,
                    date: appointmentData.date,
                    status: appointmentData.status || 'SCHEDULED'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar agendamento:", error);
            throw new Error("Não foi possível confirmar o agendamento.");
        }
        
        return data;
    },

    async updateAppointmentStatus(appId, newStatus) {
        const { error } = await window.supabaseClient
            .from('appointments')
            .update({ status: newStatus })
            .eq('id', appId);

        if (error) {
            console.error("Erro ao atualizar status:", error);
            throw new Error("Erro ao cancelar a consulta.");
        }
        return true;
    },

    async rescheduleAppointment(appId, newDateStr) {
        const { error } = await window.supabaseClient
            .from('appointments')
            .update({ date: newDateStr })
            .eq('id', appId);

        if (error) {
            console.error("Erro ao reagendar:", error);
            throw new Error("Erro ao alterar o horário da consulta.");
        }
        return true;
    },

    // ==========================================
    // 📝 PRONTUÁRIOS (NOTES) - Ultra Sigiloso
    // ==========================================

    async getNotesByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('notes')
            .select('*')
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

        if (error) {
            // Se um paciente tentar rodar isso, o Supabase bloqueia e cai aqui.
            console.warn("Acesso negado ou erro ao buscar prontuários:", error.message);
            return [];
        }
        return data;
    },

    async savePatientNote(patientId, text) {
        const { data, error } = await window.supabaseClient
            .from('notes')
            .insert([
                {
                    patient_id: patientId,
                    text: text
                }
            ]);

        if (error) {
            console.error("Erro ao salvar anotação:", error);
            throw new Error("Não foi possível salvar a evolução clínica.");
        }
        return data;
    }
};