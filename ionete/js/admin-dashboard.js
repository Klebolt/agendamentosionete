/**
 * MÓDULO DO PSICÓLOGO (Administrador)
 * * Atualizado com: Relatórios Gerenciais Avançados, Exportação para PDF e Soft Delete (Status de Cancelamento).
 */

const adminApp = {
    currentTab: 'agenda',
    agendaSubTab: 'upcoming', 
    currentHolidays: [],

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
            case 'settings': return this.renderSettingsView();
            default: return '';
        }
    },

    // ==========================================
    // 📊 NOVO: VISÃO DE RELATÓRIOS EXECUTIVOS
    // ==========================================
    renderReportsView() {
        setTimeout(() => this.generateReport(), 50);

        return `
            <div class="max-w-5xl mx-auto space-y-6">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:hidden">
                    <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Filtros de Exportação
                    </h2>
                    
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
            container.innerHTML = `<label class="block text-sm font-medium text-slate-700 mb-1">Digite o Ano</label><input type="number" id="report-date-val" placeholder="Ex: 2024" min="2020" max="2050" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none">`;
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

        // 3. Calcula as Métricas (KPIs) usando o sistema de Status
        const now = new Date();
        const scheduled = filteredApps.filter(a => a.status === 'SCHEDULED' && new Date(a.date) >= now);
        const completed = filteredApps.filter(a => (!a.status || a.status === 'SCHEDULED') && new Date(a.date) < now);
        const cancelledPat = filteredApps.filter(a => a.status === 'CANCELLED_BY_PATIENT');
        const cancelledPsy = filteredApps.filter(a => a.status === 'CANCELLED_BY_PSYCHOLOGIST');
        const totalCancelled = cancelledPat.length + cancelledPsy.length;
        
        const uniquePatientIds = [...new Set(filteredApps.map(a => a.patientId))];

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
    // 📅 VISÃO DE AGENDA 
    // ==========================================
    async renderAgendaView() {
        const appointments = await dbService.getAppointments(null, ROLES.PSYCHOLOGIST);
        const now = new Date();
        
        const upcomingApps = appointments.filter(a => new Date(a.date) >= now && (!a.status || a.status === 'SCHEDULED')).sort((a,b) => new Date(a.date) - new Date(b.date));
        const pastApps = appointments.filter(a => new Date(a.date) < now || (a.status && a.status.startsWith('CANCELLED'))).sort((a,b) => new Date(b.date) - new Date(a.date));

        let html = `
            <div class="max-w-4xl mx-auto mb-6 flex space-x-4 border-b border-slate-200 print:hidden">
                <button onclick="adminApp.switchAgendaSubTab('upcoming')" class="pb-3 px-2 text-sm font-bold transition-colors ${this.agendaSubTab === 'upcoming' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800'}">Próximos (${upcomingApps.length})</button>
                <button onclick="adminApp.switchAgendaSubTab('past')" class="pb-3 px-2 text-sm font-bold transition-colors ${this.agendaSubTab === 'past' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800'}">Histórico (${pastApps.length})</button>
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
            let waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
            let waButton = waLink ? `<a href="${waLink}" target="_blank" title="Chamar no WhatsApp" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 ml-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 21.488l-3.351.879.882-3.267A9.953 9.953 0 012.046 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10a9.952 9.952 0 01-5.015-1.512zM12.046 4c-4.411 0-8 3.589-8 8a7.962 7.962 0 004.148 6.98l.583.336-.58 2.148 2.2-2.148.583.336A7.96 7.96 0 0012.046 20c4.411 0 8-3.589 8-8s-3.589-8-8-8zm4.12 10.963c-.226-.113-1.336-.659-1.543-.734-.207-.075-.358-.113-.509.113-.15.226-.583.734-.715.885-.132.15-.264.17-.49.057-1.127-.565-2.004-1.28-2.674-2.423-.132-.226.132-.207.348-.639.075-.15.038-.283-.019-.396-.057-.113-.509-1.226-.697-1.678-.184-.442-.369-.382-.509-.387-.132-.005-.283-.005-.433-.005-.15 0-.396.057-.603.283-.207.226-.791.772-.791 1.884s.81 2.185.923 2.336c.113.15 1.59 2.423 3.847 3.396 1.157.498 1.642.545 2.188.452.546-.093 1.336-.545 1.524-1.073.188-.528.188-.98.132-1.073-.057-.094-.208-.15-.434-.264z"/></svg></a>` : '';

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
                        <a href="${CONFIG.MEET_URL}" target="_blank" class="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">Entrar</a>
                        <button onclick="adminApp.openPatientRecord('${appt.patientId}')" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Prontuário</button>
                    </div>
                </div>
            `;
        }));

        return html + `<div class="max-w-4xl mx-auto">${rows.join('')}</div>`;
    },

    // AQUI: Atualizado cirurgicamente para usar o dbService do Supabase
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
                <h3 class="text-xl font-bold text-slate-900 mb-2">Reagendar Sessão</h3>
                <input type="datetime-local" id="new-app-date" value="${currentDateStr.substring(0, 16)}" class="w-full p-3 border border-slate-200 rounded-xl mb-6 outline-none">
                <div class="flex justify-end space-x-3">
                    <button onclick="document.getElementById('edit-modal').remove()" class="px-4 py-2 font-bold">Cancelar</button>
                    <button onclick="adminApp.saveEditedAppointment('${appId}')" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold">Salvar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // AQUI: Atualizado cirurgicamente para usar o dbService do Supabase
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

    async renderPatientsView() {
        const patients = await dbService.getAllPatients();
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr><th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paciente</th><th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contato</th><th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${patients.map(p => `
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-semibold text-slate-800">${p.name}</td><td class="px-6 py-4 text-slate-500 text-sm"><p>${p.email}</p><p class="text-xs text-slate-400">${p.phone || ''}</p></td><td class="px-6 py-4 text-right"><button onclick="adminApp.openPatientRecord('${p.id}')" class="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-lg">Prontuário</button></td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async openPatientRecord(patientId) {
        const patient = await dbService.getUserById(patientId);
        const notes = await dbService.getNotesByPatient(patientId);
        const modal = document.createElement('div');
        modal.id = 'patient-modal';
        modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div><h3 class="text-xl font-bold">${patient.name}</h3><p class="text-xs text-slate-500">Histórico de Evolução</p></div>
                    <button onclick="document.getElementById('patient-modal').remove()" class="text-3xl">&times;</button>
                </div>
                <div class="p-6 overflow-y-auto flex-1 space-y-6">
                    <div class="space-y-4">
                        ${notes.map(n => `<div class="bg-slate-50 p-4 rounded-xl border"><span class="text-[10px] font-bold text-slate-400">${new Date(n.date).toLocaleString('pt-BR')}</span><p class="mt-2 text-sm">${n.text}</p></div>`).reverse().join('')}
                    </div>
                    <div class="mt-8 border-t border-slate-100 pt-6">
                        <textarea id="new-note-text" rows="4" class="w-full p-4 border rounded-xl outline-none text-sm bg-slate-50" placeholder="Anotações da sessão..."></textarea>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-100 flex justify-end bg-slate-50"><button onclick="adminApp.saveNote('${patientId}')" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Salvar</button></div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    async saveNote(patientId) {
        const text = document.getElementById('new-note-text').value;
        if (!text.trim()) return;
        await dbService.savePatientNote(patientId, text);
        document.getElementById('patient-modal').remove();
        app.showNotification("Evolução Salva", "Anotações armazenadas com segurança.", false);
        if (this.currentTab === 'agenda' && this.agendaSubTab === 'past') this.renderDashboard();
    },

    renderSettingsView() {
        const s = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS)) || { workDays: [1,2,3,4,5], startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', sessionDuration: 50, buffer: 10, availabilityStartDate: new Date().toISOString().split('T')[0], availabilityEndDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0], holidays: [] };
        this.currentHolidays = s.holidays || [];
        setTimeout(() => this.updateHolidaysListUI(), 50);

        return `
            <div class="max-w-4xl mx-auto space-y-6 pb-12">
                <div class="bg-white rounded-2xl p-6 border"><h3 class="font-bold mb-4">Link da Reunião</h3><input type="url" id="custom-meet-url" value="${CONFIG.MEET_URL}" class="w-full p-2.5 border rounded-lg"></div>
                <div class="bg-white rounded-2xl p-6 border"><h3 class="font-bold mb-4">Período e Feriados</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div><label class="text-sm">Início</label><input type="date" id="avail-start" value="${s.availabilityStartDate}" class="w-full p-2 border rounded-lg"></div>
                        <div><label class="text-sm">Fim</label><input type="date" id="avail-end" value="${s.availabilityEndDate}" class="w-full p-2 border rounded-lg"></div>
                    </div>
                    <div class="flex gap-2"><input type="date" id="new-holiday-date" class="flex-1 p-2 border rounded-lg"><button onclick="adminApp.addHoliday()" class="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg border">Bloquear Data</button></div>
                    <div id="holidays-list" class="mt-4 flex flex-wrap gap-2"></div>
                </div>
                <div class="bg-white rounded-2xl p-6 border"><h3 class="font-bold mb-4">Configuração Semanal</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div><label class="text-sm">Duração (min)</label><input type="number" id="session-duration" value="${s.sessionDuration}" class="w-full p-2 border rounded-lg"></div>
                        <div><label class="text-sm">Buffer (min)</label><input type="number" id="session-buffer" value="${s.buffer}" class="w-full p-2 border rounded-lg"></div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4">${[{n:1,l:'Seg'},{n:2,l:'Ter'},{n:3,l:'Qua'},{n:4,l:'Qui'},{n:5,l:'Sex'}].map(d => `<label class="px-4 py-2 border rounded-lg"><input type="checkbox" value="${d.n}" class="day-checkbox mr-2" ${s.workDays.includes(d.n) ? 'checked' : ''}>${d.l}</label>`).join('')}</div>
                    <div class="grid grid-cols-2 gap-4"><div class="p-4 border rounded-xl"><label class="text-sm">Início/Fim do Dia</label><div class="flex gap-2 mt-2"><input type="time" id="start-time" value="${s.startTime}" class="p-2 border rounded-lg w-full"><input type="time" id="end-time" value="${s.endTime}" class="p-2 border rounded-lg w-full"></div></div><div class="p-4 border rounded-xl"><label class="text-sm">Início/Fim do Almoço</label><div class="flex gap-2 mt-2"><input type="time" id="lunch-start" value="${s.lunchStart}" class="p-2 border rounded-lg w-full"><input type="time" id="lunch-end" value="${s.lunchEnd}" class="p-2 border rounded-lg w-full"></div></div></div>
                </div>
                <button onclick="adminApp.saveSettings()" class="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Salvar Configurações</button>
            </div>
        `;
    },

    addHoliday() { const i = document.getElementById('new-holiday-date'); if (i.value && !this.currentHolidays.includes(i.value)) { this.currentHolidays.push(i.value); this.updateHolidaysListUI(); } i.value = ''; },
    removeHoliday(d) { this.currentHolidays = this.currentHolidays.filter(x => x !== d); this.updateHolidaysListUI(); },
    updateHolidaysListUI() { document.getElementById('holidays-list').innerHTML = this.currentHolidays.sort().map(d => `<span class="bg-red-100 px-3 py-1 rounded-lg border flex items-center">${d.split('-').reverse().join('/')} <button onclick="adminApp.removeHoliday('${d}')" class="ml-2 font-bold text-red-600">&times;</button></span>`).join(''); },

    saveSettings() {
        CONFIG.MEET_URL = document.getElementById('custom-meet-url').value;
        const s = { workDays: [...document.querySelectorAll('.day-checkbox:checked')].map(c => +c.value), startTime: document.getElementById('start-time').value, endTime: document.getElementById('end-time').value, lunchStart: document.getElementById('lunch-start').value, lunchEnd: document.getElementById('lunch-end').value, sessionDuration: +document.getElementById('session-duration').value, buffer: +document.getElementById('session-buffer').value, availabilityStartDate: document.getElementById('avail-start').value, availabilityEndDate: document.getElementById('avail-end').value, holidays: this.currentHolidays };
        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(s));
        app.showNotification('Salvo', 'Configurações atualizadas.', false);
    }
};