/**
 * MÓDULO DO PSICÓLOGO (Administrador)
 * * Atualizado com: Agendamento Manual/Recorrente, WhatsApp Pré-preenchido, Busca de Pacientes em Tempo Real, Edição/PDF de Prontuário e Expediente por Dia.
 */

const adminApp = {
    currentTab: 'agenda',
    agendaSubTab: 'upcoming', 
    currentHolidays: [],
    patientsCache: [],

    async renderDashboard() {
        const user = authService.getCurrentUser();
        const container = app.container;

        container.innerHTML = `
            <div class="view-transition animate-fade-in">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Painel Clínico</h1>
                        <p class="text-slate-500 mt-1">Gestão de atendimentos e pacientes corporativos.</p>
                    </div>
                    
                    <div class="inline-flex bg-slate-200 p-1 rounded-xl shadow-inner overflow-x-auto">
                        <button onclick="adminApp.switchTab('agenda')" 
                            class="px-5 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${this.currentTab === 'agenda' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}">
                            Minha Agenda
                        </button>
                        <button onclick="adminApp.switchTab('patients')" 
                            class="px-5 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${this.currentTab === 'patients' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}">
                            Pacientes
                        </button>
                        <button onclick="adminApp.switchTab('reports')" 
                            class="px-5 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${this.currentTab === 'reports' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}">
                            Relatórios
                        </button>
                        <button onclick="adminApp.switchTab('settings')" 
                            class="px-5 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${this.currentTab === 'settings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}">
                            Configurar
                        </button>
                    </div>
                </div>

                <div id="admin-content-area" class="min-h-[400px]">
                    ${await this.getContentByTab()}
                </div>
            </div>
        `;
    },

    async switchTab(tabName) {
        this.currentTab = tabName;
        this.renderDashboard();
    },

    async switchAgendaSubTab(subTabName) {
        this.agendaSubTab = subTabName;
        this.renderDashboard();
    },

    async getContentByTab() {
        switch(this.currentTab) {
            case 'agenda': return await this.renderAgendaView();
            case 'patients': return await this.renderPatientsView();
            case 'reports': return this.renderReportsView();
            case 'settings': return await this.renderSettingsView();
            default: return '';
        }
    },

    // ==========================================
    // 📊 VISÃO DE RELATÓRIOS EXECUTIVOS
    // ==========================================
    renderReportsView() {
        setTimeout(() => this.generateReport(), 50);

        return `
            <div class="max-w-5xl mx-auto space-y-6">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:hidden">
                    <h2 class="text-lg font-bold text-slate-800 mb-1 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Filtros de Exportação
                    </h2>
                    <p class="text-xs text-slate-500 mb-4">Legenda: Selecione o período desejado para visualizar as estatísticas ou exportar o relatório oficial em PDF.</p>
                    
                    <div class="flex flex-col md:flex-row gap-4 items-end">
                        <div class="flex-1 w-full">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Período do Relatório</label>
                            <select id="report-period" onchange="adminApp.toggleReportDateInputs()" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="all">Completo (Todo o Histórico)</option>
                                <option value="daily">Diário</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                        
                        <div id="report-date-container" class="flex-1 w-full hidden">
                        </div>

                        <div class="flex gap-2 w-full md:w-auto">
                            <button onclick="adminApp.generateReport()" class="flex-1 px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors">
                                Atualizar
                            </button>
                            <button onclick="adminApp.downloadPDF()" class="flex-1 px-6 py-2.5 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors shadow-md flex items-center justify-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Salvar PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div id="printable-report" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                    <div class="flex justify-center items-center h-32">
                        <div class="animate-pulse text-slate-400">Gerando relatório...</div>
                    </div>
                </div>
            </div>
        `;
    },

    toggleReportDateInputs() {
        const period = document.getElementById('report-period').value;
        const container = document.getElementById('report-date-container');
        container.innerHTML = '';
        container.classList.remove('hidden');

        if (period === 'daily') {
            container.innerHTML = `<label class="block text-sm font-medium text-slate-700 mb-1">Selecione o Dia</label><input type="date" id="report-date-val" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none">`;
        } else if (period === 'monthly') {
            container.innerHTML = `<label class="block text-sm font-medium text-slate-700 mb-1">Selecione o Mês</label><input type="month" id="report-date-val" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none">`;
        } else if (period === 'yearly') {
            container.innerHTML = `<label class="block text-sm font-medium text-slate-700 mb-1">Digite o Ano</label><input type="number" id="report-date-val" placeholder="Ex: 2026" min="2020" max="2050" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none">`;
        } else {
            container.classList.add('hidden');
        }
    },

    async generateReport() {
        const period = document.getElementById('report-period').value;
        const dateInput = document.getElementById('report-date-val')?.value;
        
        const allAppointments = await dbService.getAppointments(null, ROLES.PSYCHOLOGIST);
        const patients = await dbService.getAllPatients();
        
        let filteredApps = allAppointments;
        let periodTitle = "Histórico Completo";

        if (period === 'daily' && dateInput) {
            filteredApps = allAppointments.filter(a => a.date.startsWith(dateInput));
            periodTitle = `Relatório Diário - ${dateInput.split('-').reverse().join('/')}`;
        } else if (period === 'monthly' && dateInput) {
            filteredApps = allAppointments.filter(a => a.date.startsWith(dateInput));
            periodTitle = `Relatório Mensal - ${dateInput.split('-').reverse().join('/')}`;
        } else if (period === 'yearly' && dateInput) {
            filteredApps = allAppointments.filter(a => a.date.startsWith(dateInput));
            periodTitle = `Relatório Anual - ${dateInput}`;
        }

        filteredApps.sort((a,b) => new Date(a.date) - new Date(b.date));

        const now = new Date();
        const scheduled = filteredApps.filter(a => a.status === 'SCHEDULED' && new Date(a.date) >= now);
        const completed = filteredApps.filter(a => (!a.status || a.status === 'SCHEDULED') && new Date(a.date) < now);
        const cancelledPat = filteredApps.filter(a => a.status === 'CANCELLED_BY_PATIENT');
        const cancelledPsy = filteredApps.filter(a => a.status === 'CANCELLED_BY_PSYCHOLOGIST');
        const totalCancelled = cancelledPat.length + cancelledPsy.length;

        const reportContainer = document.getElementById('printable-report');
        
        let html = `
            <div class="border-b-2 border-slate-800 pb-6 mb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 class="text-3xl font-black text-slate-900 tracking-tight">Psi<span class="text-sky-500">.</span>Ionete</h1>
                    <p class="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Relatório de Atendimentos Psicológicos</p>
                </div>
                <div class="text-right mt-4 md:mt-0">
                    <p class="text-lg font-bold text-slate-800">${periodTitle}</p>
                    <p class="text-xs text-slate-400 mt-1">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <p class="text-xs font-bold text-slate-500 uppercase">Total Movimentações</p>
                    <p class="text-3xl font-black text-slate-800 mt-1">${filteredApps.length}</p>
                </div>
                <div class="bg-teal-50 p-4 rounded-xl border border-teal-100 text-center">
                    <p class="text-xs font-bold text-teal-600 uppercase">Realizadas</p>
                    <p class="text-3xl font-black text-teal-900 mt-1">${completed.length}</p>
                </div>
                <div class="bg-sky-50 p-4 rounded-xl border border-sky-100 text-center">
                    <p class="text-xs font-bold text-sky-600 uppercase">Futuras Agendadas</p>
                    <p class="text-3xl font-black text-sky-900 mt-1">${scheduled.length}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                    <p class="text-xs font-bold text-red-600 uppercase">Canceladas (Faltas)</p>
                    <p class="text-3xl font-black text-red-900 mt-1">${totalCancelled}</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Detalhamento de Consultas</h3>
        `;

        if (filteredApps.length === 0) {
            html += `<p class="text-slate-500 italic text-center py-8">Não há dados registrados para o período selecionado.</p>`;
        } else {
            html += `
                <table class="w-full text-left border-collapse text-sm">
                    <thead class="bg-slate-100 border-b-2 border-slate-200">
                        <tr>
                            <th class="px-4 py-3 font-bold text-slate-700">Data e Hora</th>
                            <th class="px-4 py-3 font-bold text-slate-700">Paciente</th>
                            <th class="px-4 py-3 font-bold text-slate-700">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
            `;
            
            for (let appt of filteredApps) {
                const pat = patients.find(p => p.id === appt.patientId);
                const d = new Date(appt.date);
                
                let statusBadge = '';
                if (appt.status === 'CANCELLED_BY_PATIENT') {
                    statusBadge = `<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">Cancelada pelo Paciente</span>`;
                } else if (appt.status === 'CANCELLED_BY_PSYCHOLOGIST') {
                    statusBadge = `<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Cancelada por Você</span>`;
                } else if (d < now) {
                    statusBadge = `<span class="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-bold">Concluída</span>`;
                } else {
                    statusBadge = `<span class="bg-sky-100 text-sky-800 px-2 py-1 rounded text-xs font-bold">Agendada</span>`;
                }

                html += `
                    <tr>
                        <td class="px-4 py-3 text-slate-600">${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</td>
                        <td class="px-4 py-3 font-semibold text-slate-800">${pat ? pat.name : 'Desconhecido'}</td>
                        <td class="px-4 py-3">${statusBadge}</td>
                    </tr>
                `;
            }
            html += `</tbody></table>`;
        }

        html += `
            <div class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                Documento gerado automaticamente pelo sistema Sensus. Uso exclusivo interno.
            </div>
        `;

        reportContainer.innerHTML = html;
    },

    downloadPDF() {
        const style = document.createElement('style');
        style.id = 'print-overrides';
        style.innerHTML = `
            @media print {
                body { background-color: white !important; }
                nav, .print\\:hidden { display: none !important; }
                #app-container { padding: 0 !important; margin: 0 !important; }
                #printable-report { border: none !important; box-shadow: none !important; padding: 0 !important; }
            }
        `;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => document.getElementById('print-overrides').remove(), 1000);
    },
    
    // ==========================================
    // 📅 VISÃO DE AGENDA (COM AGENDAMENTO MANUAL E WHATSAPP PRÉ-PRONTO)
    // ==========================================
    async renderAgendaView() {
        const appointments = await dbService.getAppointments(null, ROLES.PSYCHOLOGIST);
        const now = new Date();
        
        const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS)) || {};
        const dynamicMeetUrl = settings.meetUrl || CONFIG.MEET_URL;

        const upcomingApps = appointments.filter(a => new Date(a.date) >= now && (!a.status || a.status === 'SCHEDULED')).sort((a,b) => new Date(a.date) - new Date(b.date));
        const pastApps = appointments.filter(a => new Date(a.date) < now || (a.status && a.status.startsWith('CANCELLED'))).sort((a,b) => new Date(b.date) - new Date(a.date));

        let html = `
            <div class="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 print:hidden">
                <div>
                    <div class="flex space-x-4">
                        <button onclick="adminApp.switchAgendaSubTab('upcoming')" class="pb-2 px-2 text-sm font-bold transition-colors ${this.agendaSubTab === 'upcoming' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800'}">Próximos (${upcomingApps.length})</button>
                        <button onclick="adminApp.switchAgendaSubTab('past')" class="pb-2 px-2 text-sm font-bold transition-colors ${this.agendaSubTab === 'past' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800'}">Histórico (${pastApps.length})</button>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Legenda: Clique no ícone do WhatsApp ao lado do paciente para enviar confirmação com 1 clique.</p>
                </div>
                <button onclick="adminApp.openNewAppointmentModal()" class="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Novo Agendamento Manual
                </button>
            </div>
        `;

        const activeList = this.agendaSubTab === 'upcoming' ? upcomingApps : pastApps;

        if (activeList.length === 0) {
            return html + `<div class="max-w-4xl mx-auto bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center"><p class="text-slate-400">Nenhum agendamento encontrado.</p></div>`;
        }

        const rows = await Promise.all(activeList.map(async appt => {
            const patient = await dbService.getUserById(appt.patientId);
            const date = new Date(appt.date);
            let phoneStr = patient?.phone || '';
            let cleanPhone = phoneStr.replace(/\D/g, '');
            const firstName = patient?.name ? patient.name.split(' ')[0] : 'Olá';
            const dateFmt = date.toLocaleDateString('pt-BR');
            const timeFmt = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const confirmMsg = encodeURIComponent(`Olá ${firstName}, tudo bem? Passando para confirmar nossa sessão agendada para ${dateFmt} às ${timeFmt}. Segue o link da nossa sala virtual: ${dynamicMeetUrl}`);

            let waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${confirmMsg}` : null;
            let waButton = waLink ? `<a href="${waLink}" target="_blank" title="Enviar confirmação por WhatsApp" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 ml-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 21.488l-3.351.879.882-3.267A9.953 9.953 0 012.046 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10a9.952 9.952 0 01-5.015-1.512zM12.046 4c-4.411 0-8 3.589-8 8a7.962 7.962 0 004.148 6.98l.583.336-.58 2.148 2.2-2.148.583.336A7.96 7.96 0 0012.046 20c4.411 0 8-3.589 8-8s-3.589-8-8-8zm4.12 10.963c-.226-.113-1.336-.659-1.543-.734-.207-.075-.358-.113-.509.113-.15.226-.583.734-.715.885-.132.15-.264.17-.49.057-1.127-.565-2.004-1.28-2.674-2.423-.132-.226.132-.207.348-.639.075-.15.038-.283-.019-.396-.057-.113-.509-1.226-.697-1.678-.184-.442-.369-.382-.509-.387-.132-.005-.283-.005-.433-.005-.15 0-.396.057-.603.283-.207.226-.791.772-.791 1.884s.81 2.185.923 2.336c.113.15 1.59 2.423 3.847 3.396 1.157.498 1.642.545 2.188.452.546-.093 1.336-.545 1.524-1.073.188-.528.188-.98.132-1.073-.057-.094-.208-.15-.434-.264z"/></svg></a>` : '';

            if (this.agendaSubTab === 'past') {
                const notes = await dbService.getNotesByPatient(appt.patientId);
                const sessionDateStr = date.toISOString().split('T')[0];
                const noteObj = notes.find(n => n.date.startsWith(sessionDateStr));
                
                let visualStatus = '';
                if(appt.status === 'CANCELLED_BY_PATIENT') visualStatus = `<span class="block text-xs font-bold text-orange-600 bg-orange-50 mt-1 px-2 py-1 rounded">Cancelada pelo Paciente</span>`;
                else if(appt.status === 'CANCELLED_BY_PSYCHOLOGIST') visualStatus = `<span class="block text-xs font-bold text-red-600 bg-red-50 mt-1 px-2 py-1 rounded">Cancelada por Você</span>`;
                else visualStatus = `<span class="block text-xs font-bold text-teal-600 bg-teal-50 mt-1 px-2 py-1 rounded">Sessão Concluída</span>`;

                const noteSnippet = noteObj ? `<strong>Resumo:</strong> ${noteObj.text.substring(0, 80)}...` : `<span class="italic opacity-70">Sem anotações nesta data.</span>`;

                return `
                    <div class="bg-white border border-slate-200 rounded-xl p-5 mb-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${appt.status && appt.status.includes('CANCELLED') ? 'opacity-75 bg-slate-50' : ''}">
                        <div class="flex items-center">
                            <div class="w-16 h-16 rounded-lg bg-slate-100 flex flex-col items-center justify-center mr-4 shrink-0">
                                <span class="text-sm text-slate-500 uppercase font-bold">${date.toLocaleDateString('pt-BR', {month: 'short'})}</span>
                                <span class="text-xl font-black text-slate-800">${date.getDate()}</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 flex items-center">${patient?.name || 'Paciente Externo'} ${waButton}</h4>
                                <div class="flex items-center gap-2">
                                    <p class="text-xs text-slate-500 mb-1">Às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}</p>
                                    ${visualStatus}
                                </div>
                                ${!(appt.status && appt.status.includes('CANCELLED')) ? `<p class="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">${noteSnippet}</p>` : ''}
                            </div>
                        </div>
                        <button onclick="adminApp.openPatientRecord('${appt.patientId}')" class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold shrink-0">Prontuário</button>
                    </div>
                `;
            }

            return `
                <div class="group flex flex-col sm:flex-row items-center bg-white border border-slate-200 rounded-xl p-4 mb-3 hover:border-sky-300 transition-all shadow-sm relative gap-4">
                    <div class="w-full sm:w-20 text-center sm:border-r border-slate-100 sm:mr-4 shrink-0">
                        <span class="block text-xl font-bold text-slate-700">${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}</span>
                        <span class="text-xs text-slate-400 uppercase font-medium">${date.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                    </div>
                    <div class="flex-1 text-center sm:text-left">
                        <h4 class="font-bold text-slate-800 flex items-center justify-center sm:justify-start">${patient?.name || 'Paciente Externo'} ${waButton}</h4>
                        <p class="text-xs text-slate-500 mt-1">${phoneStr ? `Tel: ${phoneStr}` : 'S/ telefone'}</p>
                    </div>
                    
                    <div class="flex space-x-1 border-r border-slate-100 pr-3 mr-1">
                        <button onclick="adminApp.openEditModal('${appt.id}', '${appt.date}')" title="Reagendar" class="p-2 text-sky-600 hover:bg-sky-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button onclick="adminApp.deleteAppointment('${appt.id}')" title="Cancelar e Liberar Horário" class="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>

                    <div class="flex space-x-2 shrink-0">
                        <a href="${dynamicMeetUrl}" target="_blank" class="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">Entrar</a>
                        <button onclick="adminApp.openPatientRecord('${appt.patientId}')" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Prontuário</button>
                    </div>
                </div>
            `;
        }));

        return html + `<div class="max-w-4xl mx-auto">${rows.join('')}</div>`;
    },

    // MODAL DE AGENDAMENTO MANUAL E RECORRENTE PELO ADMIN
    async openNewAppointmentModal() {
        const patients = await dbService.getAllPatients();
        const existing = document.getElementById('new-manual-app-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'new-manual-app-modal';
        modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-transition animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Novo Agendamento Manual</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Legenda: Agende um paciente diretamente ou crie sessões semanais recorrentes.</p>
                    </div>
                    <button onclick="document.getElementById('new-manual-app-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">1. Selecione o Paciente</label>
                        <select id="manual-app-patient" class="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                            <option value="">-- Escolha um paciente --</option>
                            ${patients.map(p => `<option value="${p.id}">${p.name} (${p.email})</option>`).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">2. Data da 1ª Sessão</label>
                            <input type="date" id="manual-app-date" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">3. Horário</label>
                            <input type="time" id="manual-app-time" value="14:00" class="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500">
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">4. Repetição Semanal (Opcional)</label>
                        <p class="text-[11px] text-slate-400 mb-2">Legenda: Escolha se deseja repetir este agendamento no mesmo dia da semana e horário pelas próximas semanas.</p>
                        <select id="manual-app-repeat" class="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500">
                            <option value="1">Apenas esta sessão (Avulsa)</option>
                            <option value="2">Repetir por 2 semanas seguidas</option>
                            <option value="4">Repetir por 4 semanas (1 Mês)</option>
                            <option value="8">Repetir por 8 semanas (2 Meses)</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onclick="document.getElementById('new-manual-app-modal').remove()" class="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
                    <button id="btn-save-manual-app" onclick="adminApp.saveManualAppointment()" class="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">
                        Confirmar Agendamento
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async saveManualAppointment() {
        const patientId = document.getElementById('manual-app-patient').value;
        const dateVal = document.getElementById('manual-app-date').value;
        const timeVal = document.getElementById('manual-app-time').value;
        const repeatCount = parseInt(document.getElementById('manual-app-repeat').value, 10) || 1;

        if (!patientId || !dateVal || !timeVal) {
            app.showNotification("Atenção", "Preencha o paciente, a data e o horário.", true);
            return;
        }

        const btn = document.getElementById('btn-save-manual-app');
        btn.disabled = true;
        btn.innerText = 'Agendando...';

        try {
            const [y, m, d] = dateVal.split('-').map(Number);
            for (let i = 0; i < repeatCount; i++) {
                const targetDate = new Date(y, m - 1, d + (i * 7));
                const ty = targetDate.getFullYear();
                const tm = String(targetDate.getMonth() + 1).padStart(2, '0');
                const td = String(targetDate.getDate()).padStart(2, '0');
                const fullIso = `${ty}-${tm}-${td}T${timeVal}:00`;

                await dbService.createAppointment({
                    patientId: patientId,
                    date: fullIso,
                    status: 'SCHEDULED'
                });
            }

            document.getElementById('new-manual-app-modal').remove();
            app.showNotification("Sucesso!", repeatCount > 1 ? `${repeatCount} sessões agendadas com sucesso.` : "Sessão agendada com sucesso.", false);
            this.renderDashboard();
        } catch (error) {
            app.showNotification("Erro", error.message, true);
            btn.disabled = false;
            btn.innerText = 'Confirmar Agendamento';
        }
    },

    async deleteAppointment(appId) {
        if(confirm("Tem certeza que deseja cancelar esta sessão? O paciente não a verá mais e o horário será liberado.")) {
            try {
                await dbService.updateAppointmentStatus(appId, 'CANCELLED_BY_PSYCHOLOGIST');
                app.showNotification("Cancelada", "Sessão marcada como cancelada por você.", true);
                this.renderDashboard();
            } catch (error) {
                app.showNotification("Erro", error.message, true);
            }
        }
    },

    openEditModal(appId, currentDateStr) {
        const modal = document.createElement('div');
        modal.id = 'edit-modal';
        modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                <h3 class="text-xl font-bold text-slate-900 mb-1">Reagendar Sessão</h3>
                <p class="text-xs text-slate-500 mb-4">Legenda: Escolha a nova data e horário para transferir este atendimento.</p>
                <input type="datetime-local" id="new-app-date" value="${currentDateStr.substring(0, 16)}" class="w-full p-3 border border-slate-200 rounded-xl mb-6 outline-none">
                <div class="flex justify-end space-x-3">
                    <button onclick="document.getElementById('edit-modal').remove()" class="px-4 py-2 font-bold">Cancelar</button>
                    <button onclick="adminApp.saveEditedAppointment('${appId}')" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold">Salvar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async saveEditedAppointment(appId) {
        const newVal = document.getElementById('new-app-date').value;
        if(!newVal) return;
        
        try {
            await dbService.rescheduleAppointment(appId, newVal + ":00");
            document.getElementById('edit-modal').remove();
            app.showNotification("Reagendado", "Sessão alterada.", false);
            this.renderDashboard();
        } catch (error) {
            app.showNotification("Erro", error.message, true);
        }
    },

    // ==========================================
    // 👥 VISÃO DE PACIENTES (COM BUSCA EM TEMPO REAL)
    // ==========================================
    async renderPatientsView() {
        this.patientsCache = await dbService.getAllPatients();
        return `
            <div class="max-w-4xl mx-auto space-y-4">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 class="text-lg font-bold text-slate-800">Diretório de Pacientes</h2>
                            <p class="text-xs text-slate-500 mt-0.5">Legenda: Digite no campo ao lado para filtrar pacientes por nome, e-mail ou telefone instantaneamente.</p>
                        </div>
                        <div class="relative w-full sm:w-72">
                            <input type="text" id="patient-search-input" oninput="adminApp.filterPatientsTable()" placeholder="Buscar nome, e-mail ou tel..." class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50">
                            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paciente</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contato</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="patients-table-body" class="divide-y divide-slate-100">
                            ${this.buildPatientsRows(this.patientsCache)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    buildPatientsRows(list) {
        if (!list || list.length === 0) {
            return `<tr><td colspan="3" class="px-6 py-8 text-center text-slate-400 text-sm italic">Nenhum paciente encontrado com esse termo.</td></tr>`;
        }
        return list.map(p => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-semibold text-slate-800">${p.name}</td>
                <td class="px-6 py-4 text-slate-500 text-sm">
                    <p>${p.email}</p>
                    <p class="text-xs text-slate-400">${p.phone || ''}</p>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="adminApp.openPatientRecord('${p.id}')" class="text-sky-600 hover:bg-sky-100 font-bold text-sm bg-sky-50 px-3.5 py-2 rounded-lg transition-colors">
                        Prontuário
                    </button>
                </td>
            </tr>
        `).join('');
    },

    filterPatientsTable() {
        const query = (document.getElementById('patient-search-input')?.value || '').toLowerCase().trim();
        const tbody = document.getElementById('patients-table-body');
        if (!tbody) return;

        const filtered = this.patientsCache.filter(p =>
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.email && p.email.toLowerCase().includes(query)) ||
            (p.phone && p.phone.toLowerCase().includes(query))
        );
        tbody.innerHTML = this.buildPatientsRows(filtered);
    },

    // ==========================================
    // 📝 PRONTUÁRIO (COM EDIÇÃO DE NOTAS E EXPORTAÇÃO PDF INDIVIDUAL)
    // ==========================================
    async openPatientRecord(patientId) {
        const existing = document.getElementById('patient-modal');
        if (existing) existing.remove();

        const patient = await dbService.getUserById(patientId);
        const notes = await dbService.getNotesByPatient(patientId);
        const modal = document.createElement('div');
        modal.id = 'patient-modal';
        modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">${patient.name}</h3>
                        <p class="text-xs text-slate-500">Legenda: Histórico sigiloso de evolução clínica. Você pode editar anotações ou exportar este prontuário em PDF.</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button onclick="adminApp.printPatientRecord('${patientId}')" class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center shadow-sm transition-colors">
                            <svg class="w-4 h-4 mr-1.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Exportar PDF
                        </button>
                        <button onclick="document.getElementById('patient-modal').remove()" class="text-3xl text-slate-400 hover:text-slate-600 leading-none px-2">&times;</button>
                    </div>
                </div>
                <div class="p-6 overflow-y-auto flex-1 space-y-6">
                    <div class="space-y-4">
                        ${notes.length === 0 ? '<p class="text-center text-slate-400 text-sm italic py-4">Nenhuma evolução registrada para este paciente.</p>' : notes.map(n => `
                            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-[11px] font-bold text-slate-400">${new Date(n.date).toLocaleString('pt-BR')}</span>
                                    <button onclick="adminApp.toggleEditNote('${n.id}')" class="text-xs font-bold text-sky-600 hover:text-sky-800">Editar anotação</button>
                                </div>
                                <p id="note-text-display-${n.id}" class="text-sm text-slate-700 whitespace-pre-line">${app.escapeHTML(n.text)}</p>
                                <div id="note-edit-box-${n.id}" class="hidden mt-3 space-y-2">
                                    <textarea id="note-edit-input-${n.id}" rows="3" class="w-full p-3 border border-sky-300 rounded-lg text-sm bg-white outline-none">${app.escapeHTML(n.text)}</textarea>
                                    <div class="flex justify-end gap-2">
                                        <button onclick="adminApp.toggleEditNote('${n.id}')" class="px-3 py-1.5 text-xs font-bold text-slate-500">Cancelar</button>
                                        <button onclick="adminApp.saveEditedNote('${n.id}', '${patientId}')" class="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold">Salvar Correção</button>
                                    </div>
                                </div>
                            </div>
                        `).reverse().join('')}
                    </div>
                    <div class="mt-8 border-t border-slate-100 pt-6">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nova Evolução Clínica</label>
                        <textarea id="new-note-text" rows="4" class="w-full p-4 border rounded-xl outline-none text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500" placeholder="Digite as anotações da sessão..."></textarea>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
                    <button onclick="adminApp.saveNote('${patientId}')" class="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm">Salvar Nova Evolução</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    toggleEditNote(noteId) {
        const displayEl = document.getElementById(`note-text-display-${noteId}`);
        const editBox = document.getElementById(`note-edit-box-${noteId}`);
        if (!displayEl || !editBox) return;
        displayEl.classList.toggle('hidden');
        editBox.classList.toggle('hidden');
    },

    async saveEditedNote(noteId, patientId) {
        const newText = document.getElementById(`note-edit-input-${noteId}`)?.value || '';
        if (!newText.trim()) return;
        try {
            await dbService.updatePatientNote(noteId, newText);
            app.showNotification("Atualizado", "Anotação corrigida com sucesso.", false);
            this.openPatientRecord(patientId);
        } catch (err) {
            app.showNotification("Erro", err.message, true);
        }
    },

    async printPatientRecord(patientId) {
        const patient = await dbService.getUserById(patientId);
        const notes = await dbService.getNotesByPatient(patientId);
        const printWin = window.open('', '_blank', 'width=800,height=700');
        if (!printWin) return;

        const notesHtml = notes.length === 0
            ? '<p style="color:#64748b;font-style:italic;">Nenhum registro clínico encontrado.</p>'
            : notes.slice().reverse().map(n => `
                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px;background:#f8fafc;">
                    <div style="font-size:11px;font-weight:bold;color:#64748b;margin-bottom:6px;">Data do Registro: ${new Date(n.date).toLocaleString('pt-BR')}</div>
                    <div style="font-size:13px;color:#1e293b;white-space:pre-line;line-height:1.5;">${app.escapeHTML(n.text)}</div>
                </div>
            `).join('');

        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Prontuário - ${patient.name}</title>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #0f172a; }
                    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
                    .patient-box { background: #f1f5f9; padding: 16px; border-radius: 10px; margin-bottom: 24px; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 style="margin:0;font-size:24px;">Psi.Ionete</h1>
                        <p style="margin:4px 0 0;font-size:12px;color:#475569;">PRONTUÁRIO PSICOLÓGICO INDIVIDUAL - DOCUMENTO CONFIDENCIAL</p>
                    </div>
                    <div style="text-align:right;font-size:11px;color:#64748b;">
                        Emitido em: ${new Date().toLocaleString('pt-BR')}
                    </div>
                </div>
                <div class="patient-box">
                    <strong>Paciente:</strong> ${patient.name}<br>
                    <strong>E-mail:</strong> ${patient.email}<br>
                    <strong>Telefone:</strong> ${patient.phone || 'Não informado'}
                </div>
                <h3 style="font-size:15px;margin-bottom:12px;">Histórico de Evolução Clínica</h3>
                ${notesHtml}
                <script>window.onload = () => { window.print(); };</script>
            </body>
            </html>
        `);
        printWin.document.close();
    },

    async saveNote(patientId) {
        const text = document.getElementById('new-note-text').value;
        if (!text.trim()) return;
        await dbService.savePatientNote(patientId, text);
        document.getElementById('patient-modal').remove();
        app.showNotification("Evolução Salva", "Anotações armazenadas com segurança.", false);
        if (this.currentTab === 'agenda' && this.agendaSubTab === 'past') this.renderDashboard();
    },

    // ==========================================
    // ⚙️ VISÃO DE CONFIGURAÇÕES (PERSONALIZADA POR DIA DA SEMANA)
    // ==========================================
    async renderSettingsView() {
        let defaultSettings = {
            meetUrl: CONFIG.MEET_URL,
            workDays: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
            lunchStart: '12:00',
            lunchEnd: '13:00',
            sessionDuration: 50,
            buffer: 10,
            availabilityStartDate: new Date().toISOString().split('T')[0],
            availabilityEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            holidays: [],
            customSchedule: null
        };

        let savedLocal = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS)) || {};
        let s = { ...defaultSettings, ...savedLocal };

        try {
            const supabaseConn = window.supabaseClient || window.supabase || CONFIG.supabaseClient;
            if (supabaseConn) {
                const { data, error } = await supabaseConn
                    .from('configuracoes')
                    .select('dados_config')
                    .eq('id', 1)
                    .single();

                if (!error && data && data.dados_config && Object.keys(data.dados_config).length > 0) {
                    s = { ...s, ...data.dados_config };
                    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(s));
                }
            }
        } catch (err) {
            console.warn("Aviso ao ler configurações da nuvem no Admin:", err);
        }

        const daysInfo = [
            { id: 1, name: 'Segunda-feira', short: 'Seg' },
            { id: 2, name: 'Terça-feira', short: 'Ter' },
            { id: 3, name: 'Quarta-feira', short: 'Qua' },
            { id: 4, name: 'Quinta-feira', short: 'Qui' },
            { id: 5, name: 'Sexta-feira', short: 'Sex' },
            { id: 6, name: 'Sábado', short: 'Sáb' },
            { id: 0, name: 'Domingo', short: 'Dom' }
        ];

        if (!s.customSchedule || typeof s.customSchedule !== 'object') {
            s.customSchedule = {};
            daysInfo.forEach(d => {
                const isSaturday = (d.id === 6);
                const isSunday = (d.id === 0);
                s.customSchedule[d.id] = {
                    active: Array.isArray(s.workDays) ? s.workDays.includes(d.id) : (!isSaturday && !isSunday),
                    start: isSaturday ? (s.saturdayStartTime || '08:00') : (s.startTime || '09:00'),
                    end: isSaturday ? (s.saturdayEndTime || '13:00') : (s.endTime || '17:00'),
                    hasLunch: !isSaturday && !isSunday,
                    lunchStart: s.lunchStart || '12:00',
                    lunchEnd: s.lunchEnd || '13:00'
                };
            });
        }

        this.currentHolidays = s.holidays || [];
        setTimeout(() => this.updateHolidaysListUI(), 50);

        const scheduleRowsHtml = daysInfo.map(d => {
            const dayCfg = s.customSchedule[d.id] || {
                active: false,
                start: '09:00',
                end: '17:00',
                hasLunch: true,
                lunchStart: '12:00',
                lunchEnd: '13:00'
            };

            return `
                <div id="day-row-${d.id}" class="p-4 rounded-xl border transition-all ${dayCfg.active ? 'bg-white border-sky-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        <div class="flex items-center justify-between lg:w-48 shrink-0">
                            <label class="inline-flex items-center cursor-pointer select-none">
                                <input type="checkbox" id="day-active-${d.id}" value="${d.id}" 
                                    onchange="adminApp.toggleDayRow(${d.id})"
                                    class="day-checkbox w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer" 
                                    ${dayCfg.active ? 'checked' : ''}>
                                <span class="ml-3 font-bold text-slate-800 text-base">${d.name}</span>
                            </label>
                            <span id="day-badge-${d.id}" class="lg:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full ${dayCfg.active ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'}">
                                ${dayCfg.active ? 'Ativo' : 'Sem expediente'}
                            </span>
                        </div>

                        <div id="day-controls-${d.id}" class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 ${dayCfg.active ? '' : 'pointer-events-none'}">
                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                                <span class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Horário de Funcionamento</span>
                                <div class="flex items-center gap-2">
                                    <div class="flex-1">
                                        <span class="text-[10px] text-slate-400 block mb-0.5">Início</span>
                                        <input type="time" id="day-start-${d.id}" value="${dayCfg.start}" class="w-full p-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500">
                                    </div>
                                    <span class="text-slate-400 font-bold mt-4">até</span>
                                    <div class="flex-1">
                                        <span class="text-[10px] text-slate-400 block mb-0.5">Fim</span>
                                        <input type="time" id="day-end-${d.id}" value="${dayCfg.end}" class="w-full p-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500">
                                    </div>
                                </div>
                            </div>

                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="inline-flex items-center cursor-pointer select-none">
                                        <input type="checkbox" id="day-has-lunch-${d.id}" 
                                            onchange="adminApp.toggleLunchInputs(${d.id})"
                                            class="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer" 
                                            ${dayCfg.hasLunch ? 'checked' : ''}>
                                        <span class="ml-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pausa de Almoço</span>
                                    </label>
                                </div>
                                <div id="day-lunch-box-${d.id}" class="flex items-center gap-2 transition-opacity ${dayCfg.hasLunch ? '' : 'opacity-30 pointer-events-none'}">
                                    <div class="flex-1">
                                        <span class="text-[10px] text-slate-400 block mb-0.5">Início Pausa</span>
                                        <input type="time" id="day-lunch-start-${d.id}" value="${dayCfg.lunchStart}" class="w-full p-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500">
                                    </div>
                                    <span class="text-slate-400 font-bold mt-4">até</span>
                                    <div class="flex-1">
                                        <span class="text-[10px] text-slate-400 block mb-0.5">Fim Pausa</span>
                                        <input type="time" id="day-lunch-end-${d.id}" value="${dayCfg.lunchEnd}" class="w-full p-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="max-w-4xl mx-auto space-y-6 pb-12">
                
                <div class="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
                    <div class="p-2.5 bg-sky-100 text-sky-600 rounded-xl shrink-0 mt-0.5">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-sky-950">Central de Configuração da Agenda</h2>
                        <p class="text-xs text-sky-800 mt-1 leading-relaxed">
                            Todas as alterações salvas nesta página atualizam <strong>instantaneamente</strong> o calendário de agendamentos dos pacientes. Configure abaixo o link das chamadas, o período aberto na agenda e os horários individuais de cada dia da semana.
                        </p>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div class="mb-4">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            1. Sala de Atendimento Online (Google Meet)
                        </h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Legenda: Este é o link para onde o paciente será redirecionado ao clicar no botão <strong>"Entrar na Sala Virtual"</strong> no dia da consulta.
                        </p>
                    </div>
                    <input type="url" id="custom-meet-url" value="${s.meetUrl || CONFIG.MEET_URL}" placeholder="https://meet.google.com/..." class="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50">
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div class="mb-4">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            2. Janela de Datas Disponíveis e Feriados
                        </h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Legenda: Defina a data inicial e final que ficará visível para os pacientes agendarem, além de bloquear dias específicos (feriados, recessos ou folgas).
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Abertura da Agenda (Data Início)</label>
                            <p class="text-[11px] text-slate-400 mb-2">Primeiro dia liberado para agendamento.</p>
                            <input type="date" id="avail-start" value="${s.availabilityStartDate}" class="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500">
                        </div>
                        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Limite da Agenda (Data Fim)</label>
                            <p class="text-[11px] text-slate-400 mb-2">Último dia liberado para agendamento.</p>
                            <input type="date" id="avail-end" value="${s.availabilityEndDate}" class="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500">
                        </div>
                    </div>

                    <div class="border-t border-slate-100 pt-5">
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bloquear Feriados ou Dias de Folga</label>
                        <p class="text-[11px] text-slate-400 mb-3">Selecione uma data abaixo e clique em "Bloquear Data". O dia aparecerá como indisponível para todos os pacientes.</p>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input type="date" id="new-holiday-date" class="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-400">
                            <button onclick="adminApp.addHoliday()" class="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm rounded-xl border border-red-200 transition-colors shrink-0">
                                + Bloquear Data
                            </button>
                        </div>
                        <div id="holidays-list" class="mt-4 flex flex-wrap gap-2"></div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div class="mb-4">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            3. Tempo de Sessão e Intervalo (Buffer)
                        </h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Legenda: O sistema calcula automaticamente os botões de horário somando a <strong>Duração da Sessão + Tempo de Intervalo</strong> (ex: 50 min de consulta + 10 min de pausa = horários de 1 em 1 hora).
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duração da Consulta (Minutos)</label>
                            <p class="text-[11px] text-slate-400 mb-2">Tempo efetivo de cada atendimento.</p>
                            <input type="number" id="session-duration" value="${s.sessionDuration}" min="15" max="180" class="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500">
                        </div>
                        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Intervalo entre Pacientes / Buffer (Minutos)</label>
                            <p class="text-[11px] text-slate-400 mb-2">Pausa para descanso ou anotações entre sessões.</p>
                            <input type="number" id="session-buffer" value="${s.buffer}" min="0" max="120" class="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500">
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                            4. Dias de Funcionamento e Horários por Dia da Semana
                        </h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Legenda: Marque os dias da semana em que haverá expediente e defina manualmente o horário de início, fim e pausa de almoço de cada dia. Os dias desmarcados não aparecerão para o cliente.
                        </p>
                    </div>

                    <div class="space-y-3">
                        ${scheduleRowsHtml}
                    </div>
                </div>

                <button id="btn-save-settings" onclick="adminApp.saveSettings()" class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Salvar Configurações e Atualizar Agenda dos Clientes
                </button>
            </div>
        `;
    },

    toggleDayRow(dayId) {
        const checkbox = document.getElementById(`day-active-${dayId}`);
        const row = document.getElementById(`day-row-${dayId}`);
        const controls = document.getElementById(`day-controls-${dayId}`);
        const badge = document.getElementById(`day-badge-${dayId}`);

        if (checkbox.checked) {
            row.classList.remove('bg-slate-50', 'border-slate-200', 'opacity-60');
            row.classList.add('bg-white', 'border-sky-200', 'shadow-sm');
            controls.classList.remove('pointer-events-none');
            if (badge) {
                badge.textContent = 'Ativo';
                badge.className = 'lg:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800';
            }
        } else {
            row.classList.add('bg-slate-50', 'border-slate-200', 'opacity-60');
            row.classList.remove('bg-white', 'border-sky-200', 'shadow-sm');
            controls.classList.add('pointer-events-none');
            if (badge) {
                badge.textContent = 'Sem expediente';
                badge.className = 'lg:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-500';
            }
        }
    },

    toggleLunchInputs(dayId) {
        const hasLunch = document.getElementById(`day-has-lunch-${dayId}`).checked;
        const lunchBox = document.getElementById(`day-lunch-box-${dayId}`);
        if (hasLunch) {
            lunchBox.classList.remove('opacity-30', 'pointer-events-none');
        } else {
            lunchBox.classList.add('opacity-30', 'pointer-events-none');
        }
    },

    addHoliday() {
        const i = document.getElementById('new-holiday-date');
        if (i.value && !this.currentHolidays.includes(i.value)) {
            this.currentHolidays.push(i.value);
            this.updateHolidaysListUI();
        }
        i.value = '';
    },

    removeHoliday(d) {
        this.currentHolidays = this.currentHolidays.filter(x => x !== d);
        this.updateHolidaysListUI();
    },

    updateHolidaysListUI() {
        const listEl = document.getElementById('holidays-list');
        if (!listEl) return;
        if (this.currentHolidays.length === 0) {
            listEl.innerHTML = `<span class="text-xs text-slate-400 italic">Nenhuma data bloqueada no momento.</span>`;
            return;
        }
        listEl.innerHTML = this.currentHolidays.sort().map(d => `
            <span class="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 flex items-center shadow-sm">
                ${d.split('-').reverse().join('/')} 
                <button onclick="adminApp.removeHoliday('${d}')" title="Desbloquear data" class="ml-2 font-black text-red-500 hover:text-red-800 text-sm leading-none">&times;</button>
            </span>
        `).join('');
    },

    async saveSettings() {
        const btn = document.getElementById('btn-save-settings');
        const originalText = btn ? btn.innerHTML : 'Salvar Configurações';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="animate-pulse">Salvando configurações na nuvem...</span>`;
        }

        try {
            const customSchedule = {};
            const workDays = [];

            [0, 1, 2, 3, 4, 5, 6].forEach(dayId => {
                const activeEl = document.getElementById(`day-active-${dayId}`);
                const isActive = activeEl ? activeEl.checked : false;
                const start = document.getElementById(`day-start-${dayId}`)?.value || '09:00';
                const end = document.getElementById(`day-end-${dayId}`)?.value || '17:00';
                const hasLunch = document.getElementById(`day-has-lunch-${dayId}`)?.checked || false;
                const lunchStart = document.getElementById(`day-lunch-start-${dayId}`)?.value || '12:00';
                const lunchEnd = document.getElementById(`day-lunch-end-${dayId}`)?.value || '13:00';

                if (isActive) workDays.push(dayId);

                customSchedule[dayId] = {
                    active: isActive,
                    start: start,
                    end: end,
                    hasLunch: hasLunch,
                    lunchStart: lunchStart,
                    lunchEnd: lunchEnd
                };
            });

            const meetUrlVal = document.getElementById('custom-meet-url').value;
            CONFIG.MEET_URL = meetUrlVal;

            const refDay = customSchedule[1] || { start: '09:00', end: '17:00', lunchStart: '12:00', lunchEnd: '13:00' };
            const satDay = customSchedule[6] || { start: '08:00', end: '13:00' };

            const s = {
                meetUrl: meetUrlVal,
                workDays: workDays,
                startTime: refDay.start,
                endTime: refDay.end,
                lunchStart: refDay.lunchStart,
                lunchEnd: refDay.lunchEnd,
                saturdayStartTime: satDay.start,
                saturdayEndTime: satDay.end,
                customSchedule: customSchedule,
                sessionDuration: +document.getElementById('session-duration').value || 50,
                buffer: +document.getElementById('session-buffer').value || 10,
                availabilityStartDate: document.getElementById('avail-start').value,
                availabilityEndDate: document.getElementById('avail-end').value,
                holidays: this.currentHolidays
            };

            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(s));

            const supabaseConn = window.supabaseClient || window.supabase || CONFIG.supabaseClient;
            if (supabaseConn) {
                const { data: updatedRows, error: updateError } = await supabaseConn
                    .from('configuracoes')
                    .update({ dados_config: s })
                    .eq('id', 1)
                    .select();

                if (updateError) throw updateError;

                if (!updatedRows || updatedRows.length === 0) {
                    const { error: insertError } = await supabaseConn
                        .from('configuracoes')
                        .insert([{ id: 1, dados_config: s }]);
                    if (insertError) throw insertError;
                }
            }

            app.showNotification('Configurações Salvas!', 'Os horários de funcionamento foram atualizados para todos os clientes.', false);
        } catch (err) {
            console.error("Erro ao salvar configurações:", err);
            app.showNotification('Aviso', 'Salvo localmente, mas houve um erro ao sincronizar com a nuvem: ' + err.message, true);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }
};
