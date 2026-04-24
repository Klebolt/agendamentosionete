/**
 * MÓDULO DO PACIENTE (Funcionário)
 * * Versão 4.0: 100% Integrado ao Supabase (Sem LocalStorage para dados sensíveis).
 */

const patientApp = {
    notificationInterval: null,

    async renderDashboard() {
        const user = authService.getCurrentUser();
        const container = app.container;

        container.innerHTML = `
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            </div>
        `;

        try {
            const patientAppointments = await dbService.getAppointments(user.id, ROLES.PATIENT);

            // Busca todos os agendamentos da clínica no Supabase para bloquear a agenda
            const allAppointments = await dbService.getAppointments(null, ROLES.PSYCHOLOGIST).catch(() => patientAppointments);

            const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS)) || {
                workDays: [1, 2, 3, 4, 5],
                startTime: '09:00', endTime: '17:00',
                lunchStart: '12:00', lunchEnd: '13:00',
                sessionDuration: 50, buffer: 10,
                availabilityStartDate: new Date().toISOString().split('T')[0],
                availabilityEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                holidays: []
            };

            const now = new Date();

            const upcoming = patientAppointments
                .filter(app => new Date(app.date) >= now && (!app.status || app.status === 'SCHEDULED'))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            const past = patientAppointments
                .filter(app => new Date(app.date) < now || (app.status && app.status.startsWith('CANCELLED')))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            container.innerHTML = `
                <div class="view-transition max-w-5xl mx-auto space-y-8 animate-fade-in">
                    
                    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div class="text-center sm:text-left">
                            <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Bem-vindo, ${user.name.split(' ')[0]}.</h1>
                            <p class="text-slate-500 mt-2">Escolha um horário para o seu atendimento.</p>
                        </div>
                        <button onclick="patientApp.openProfileModal()" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center shrink-0">
                            <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Minha Conta
                        </button>
                    </div>

                    ${this.buildNextSessionCard(upcoming[0])}

                    ${this.buildFutureSessionsList(upcoming)}

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 class="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Agenda de Consultas
                            </h2>
                            <div class="max-h-[600px] overflow-y-auto pr-2 space-y-8">
                                ${this.buildDynamicCalendar(settings, allAppointments, patientAppointments)}
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 class="text-xl font-semibold text-slate-800 mb-4">Histórico</h2>
                            <div class="space-y-3 max-h-[400px] overflow-y-auto">
                                ${this.buildHistoryList(past)}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.startNotificationMonitor(upcoming[0]);

            // Passamos a lista de agendamentos para a função validar a regra no Supabase
            this.attachBookingListeners(user.id, patientAppointments);

        } catch (error) {
            container.innerHTML = `<p class="text-red-500 text-center mt-10">Erro ao carregar o portal. Verifique sua conexão.</p>`;
        }
    },

    buildNextSessionCard(nextApp) {
        if (!nextApp) {
            return `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                    <p class="text-slate-500 mb-2">Você não possui sessões agendadas no momento.</p>
                    <p class="text-sm text-slate-400">Escolha um horário no calendário abaixo para iniciar seu acompanhamento.</p>
                </div>
            `;
        }

        const appDate = new Date(nextApp.date);
        const formattedDate = appDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
        const formattedTime = appDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // CIRURGIA: Lê o link dinâmico salvo pela Dra. Ionete no painel de Configuração
        const settings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS)) || {};
        // Tenta ler os nomes mais comuns que você pode ter usado no admin-dashboard.js, se não achar, usa o do config.js
        const dynamicMeetUrl = settings.meetUrl || settings.meetingLink || settings.meetLink || CONFIG.MEET_URL;

        return `
            <div class="bg-teal-50 border border-teal-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-center sm:text-left">
                    <span class="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">Próxima Consulta</span>
                    <h3 class="text-2xl font-bold text-teal-950 capitalize">${formattedDate}</h3>
                    <p class="text-teal-700 text-lg mt-1 flex items-center justify-center sm:justify-start font-medium">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${formattedTime}
                    </p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button onclick="patientApp.cancelAppointment('${nextApp.id}', '${nextApp.date}')" class="flex-1 sm:flex-none justify-center px-6 py-4 text-sm font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-xl transition-all">
                        Cancelar Consulta
                    </button>
                    <a href="${dynamicMeetUrl}" target="_blank" rel="noopener noreferrer" 
                       class="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Entrar na Sala Virtual
                    </a>
                </div>
            </div>
        `;
    },

    buildFutureSessionsList(upcoming) {
        if (!upcoming || upcoming.length <= 1) return '';

        const futureList = upcoming.slice(1).map(app => {
            const date = new Date(app.date);
            return `
                <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex flex-col justify-center items-center mr-4 font-bold border border-sky-100">
                            <span class="text-[10px] uppercase leading-none mb-0.5">${date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                            <span class="text-lg leading-none">${date.getDate()}</span>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800">${date.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                            <p class="text-xs font-medium text-slate-500 mt-0.5">Às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <button onclick="patientApp.cancelAppointment('${app.id}', '${app.date}')" class="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 px-3 py-2 rounded-lg transition-colors">
                        Cancelar
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 shadow-inner">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Seus Outros Agendamentos Futuros
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${futureList}
                </div>
            </div>
        `;
    },

    async cancelAppointment(appId, appDateStr) {
        const now = new Date();
        const appointmentTime = new Date(appDateStr);

        const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            app.showNotification(
                "Cancelamento Bloqueado",
                "Faltam menos de 24h para a consulta.",
                true
            );

            // Adiciona modal para contato via WhatsApp buscando o admin no Supabase
            const { data: admins } = await window.supabaseClient.from('profiles').select('phone').eq('role', ROLES.PSYCHOLOGIST).limit(1);
            const adminPhone = (admins && admins[0]) ? admins[0].phone : '';
            const cleanPhone = adminPhone ? adminPhone.replace(/\D/g, '') : '';

            const dateFmt = appointmentTime.toLocaleDateString('pt-BR');
            const timeFmt = appointmentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const msg = encodeURIComponent(`Olá! Gostaria de falar sobre o cancelamento da minha sessão agendada para ${dateFmt} às ${timeFmt}.`);
            const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;

            const modal = document.createElement('div');
            modal.id = 'wa-alert-modal';
            modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-transition animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                    <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Aviso Importante</h3>
                    <p class="text-sm text-slate-600 mb-6">Como faltam menos de 24 horas para a consulta, o cancelamento automático não é permitido. Por favor, avise a profissional diretamente.</p>
                    <div class="flex flex-col space-y-3">
                        <a href="${waLink}" target="_blank" onclick="document.getElementById('wa-alert-modal').remove()" class="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors flex justify-center items-center">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 21.488l-3.351.879.882-3.267A9.953 9.953 0 012.046 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10a9.952 9.952 0 01-5.015-1.512zM12.046 4c-4.411 0-8 3.589-8 8a7.962 7.962 0 004.148 6.98l.583.336-.58 2.148 2.2-2.148.583.336A7.96 7.96 0 0012.046 20c4.411 0 8-3.589 8-8s-3.589-8-8-8zm4.12 10.963c-.226-.113-1.336-.659-1.543-.734-.207-.075-.358-.113-.509.113-.15.226-.583.734-.715.885-.132.15-.264.17-.49.057-1.127-.565-2.004-1.28-2.674-2.423-.132-.226.132-.207.348-.639.075-.15.038-.283-.019-.396-.057-.113-.509-1.226-.697-1.678-.184-.442-.369-.382-.509-.387-.132-.005-.283-.005-.433-.005-.15 0-.396.057-.603.283-.207.226-.791.772-.791 1.884s.81 2.185.923 2.336c.113.15 1.59 2.423 3.847 3.396 1.157.498 1.642.545 2.188.452.546-.093 1.336-.545 1.524-1.073.188-.528.188-.98.132-1.073-.057-.094-.208-.15-.434-.264z"/></svg>
                            Falar no WhatsApp
                        </a>
                        <button onclick="document.getElementById('wa-alert-modal').remove()" class="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                            Voltar
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            return;
        }

        if (confirm("Tem certeza que deseja cancelar esta consulta? O horário será liberado imediatamente para outros colegas.")) {
            try {
                await dbService.updateAppointmentStatus(appId, 'CANCELLED_BY_PATIENT');
                app.showNotification("Cancelado", "Seu agendamento foi cancelado com sucesso.", false);
                this.renderDashboard();
            } catch (error) {
                app.showNotification("Erro", error.message, true);
            }
        }
    },

    buildDynamicCalendar(settings, allAppointments, patientAppointments) {
        let html = '';

        const startDate = new Date(settings.availabilityStartDate + 'T00:00:00');
        const endDate = new Date(settings.availabilityEndDate + 'T23:59:59');
        const holidays = settings.holidays || [];

        const patientBookedDates = patientAppointments
            .filter(a => !a.status || a.status === 'SCHEDULED')
            .map(a => {
                return a.date ? a.date.split('T')[0] : '';
            });

        const timeToMins = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
        const startMin = timeToMins(settings.startTime);
        const endMin = timeToMins(settings.endTime);
        const lunchStart = timeToMins(settings.lunchStart);
        const lunchEnd = timeToMins(settings.lunchEnd);
        const step = settings.sessionDuration + settings.buffer;

        let cursor = new Date(startDate);

        while (cursor <= endDate) {
            const dateStr = cursor.toISOString().split('T')[0];
            const isWorkDay = settings.workDays.includes(cursor.getDay());
            const isHoliday = holidays.includes(dateStr);
            const hasBookingThisDay = patientBookedDates.includes(dateStr);

            if (isWorkDay) {
                const displayDate = cursor.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase();

                html += `
                    <div>
                        <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                            <h4 class="text-xs font-bold text-slate-400 tracking-widest">${displayDate}</h4>
                            ${isHoliday ? '<span class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">FERIADO / BLOQUEADO</span>' : ''}
                        </div>
                `;

                if (hasBookingThisDay) {
                    html += `
                        <div class="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                            <p class="text-xs font-bold text-sky-700">Você já possui uma sessão agendada para este dia.</p>
                        </div>
                    </div>
                    `;
                } else {
                    html += `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">`;

                    let currentMin = startMin;
                    while (currentMin + settings.sessionDuration <= endMin) {
                        if (currentMin >= lunchStart && currentMin < lunchEnd) {
                            currentMin = lunchEnd;
                            continue;
                        }

                        const h = Math.floor(currentMin / 60).toString().padStart(2, '0');
                        const m = (currentMin % 60).toString().padStart(2, '0');
                        const timeStr = `${h}:${m}`;
                        const fullDateTime = `${dateStr}T${timeStr}:00`;
                        
                        // Transformação em Timestamp para evitar bug de fuso horário
                        const btnTimestamp = new Date(fullDateTime).getTime();

                        const isBooked = allAppointments.some(a => {
                            if (!a || !a.date) return false;
                            
                            const dbTimestamp = new Date(a.date).getTime();
                            const isSameSlot = (dbTimestamp === btnTimestamp) || a.date.includes(`${dateStr}T${timeStr}`);
                            
                            return isSameSlot && (!a.status || a.status === 'SCHEDULED');
                        });

                        if (isHoliday || isBooked) {
                            const label = isHoliday ? 'FERIADO' : 'OCUPADO';
                            html += `
                                <button disabled 
                                    class="py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg cursor-not-allowed opacity-60">
                                    ${label}
                                </button>
                            `;
                        } else {
                            html += `
                                <button data-date="${fullDateTime}" 
                                    class="btn-book py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-all">
                                    ${timeStr}
                                </button>
                            `;
                        }
                        currentMin += step;
                    }
                    html += `</div></div>`;
                }
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        return html || '<p class="text-center text-slate-400">Nenhum horário disponível no período selecionado.</p>';
    },

    buildHistoryList(past) {
        if (past.length === 0) return '<p class="text-slate-400 text-xs italic">Nenhum registo.</p>';
        return past.map(a => {
            const date = new Date(a.date);

            let statusText = "Concluída";
            let statusClasses = "bg-teal-100 text-teal-800";

            if (a.status === 'CANCELLED_BY_PATIENT') {
                statusText = "Cancelada por você";
                statusClasses = "bg-orange-100 text-orange-800";
            } else if (a.status === 'CANCELLED_BY_PSYCHOLOGIST') {
                statusText = "Cancelada pela Clínica";
                statusClasses = "bg-red-100 text-red-800";
            }

            return `
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                        <p class="font-bold text-slate-700">${date.toLocaleDateString('pt-BR')}</p>
                        <p class="text-slate-500">${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span class="px-2 py-1 rounded text-[10px] font-bold ${statusClasses}">${statusText}</span>
                </div>
            `;
        }).join('');
    },

    attachBookingListeners(patientId, patientAppointments) {
        document.querySelectorAll('.btn-book').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const dateStr = e.target.getAttribute('data-date');
                const dayStr = dateStr.split('T')[0];

                const hasBookingToday = patientAppointments.some(a => a.date.startsWith(dayStr) && (!a.status || a.status === 'SCHEDULED'));

                if (hasBookingToday) {
                    app.showNotification("Ação Bloqueada", "Você já agendou uma sessão neste dia.", true);
                    return;
                }

                e.target.disabled = true;
                e.target.innerText = '...';

                try {
                    await dbService.createAppointment({ patientId, date: dateStr, status: 'SCHEDULED' });
                    app.showNotification("Sucesso", "Agendamento confirmado!", false);
                    setTimeout(() => this.renderDashboard(), 600);
                } catch (error) {
                    app.showNotification("Erro", error.message, true);
                    e.target.disabled = false;
                    e.target.innerText = dateStr.split('T')[1].substring(0, 5);
                }
            });
        });
    },

    startNotificationMonitor(nextApp) {
        if (this.notificationInterval) clearInterval(this.notificationInterval);
        if (!nextApp) return;

        this.notificationInterval = setInterval(() => {
            const diff = (new Date(nextApp.date).getTime() - Date.now()) / (1000 * 60);
            if (diff > 0 && diff <= CONFIG.NOTIFICATION_THRESHOLD_MINUTES) {
                app.showNotification("Sua sessão vai começar!", `Faltam ${Math.ceil(diff)} minutos.`, true);
                clearInterval(this.notificationInterval);
            }
        }, 60000);
    },

    openProfileModal() {
        const fullUser = authService.getCurrentUser();

        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-transition animate-fade-in';

        modal.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 class="text-xl font-bold text-slate-900">Minha Conta</h3>
                    <button onclick="document.getElementById('profile-modal').remove()" class="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                        <input type="text" disabled value="${fullUser.email}" class="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Celular (WhatsApp)</label>
                        <input type="tel" id="edit-phone" value="${fullUser.phone || ''}" placeholder="(00) 00000-0000" maxlength="15" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nova Senha (Opcional)</label>
                        <input type="password" id="edit-password" placeholder="Digite apenas se quiser alterar" class="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                    </div>
                </div>
                
                <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onclick="document.getElementById('profile-modal').remove()" class="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                    <button onclick="patientApp.saveProfile('${fullUser.id}')" class="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md transition-transform transform hover:-translate-y-0.5">Salvar Alterações</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const phoneInput = document.getElementById('edit-phone');
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    },

    async saveProfile(userId) {
        const newPhone = document.getElementById('edit-phone').value;
        const newPassword = document.getElementById('edit-password').value;

        if (newPhone.replace(/\D/g, '').length < 10) {
            app.showNotification("Atenção", "Insira um número de celular válido com DDD.", true);
            return;
        }

        try {
            if (newPassword.trim().length > 0) {
                if (newPassword.trim().length < 6) {
                    app.showNotification("Atenção", "A nova senha deve ter pelo menos 6 caracteres.", true);
                    return;
                }
                const { error: authError } = await window.supabaseClient.auth.updateUser({ password: newPassword });
                if (authError) throw authError;
            }

            const { error: profileError } = await window.supabaseClient
                .from('profiles')
                .update({ phone: newPhone })
                .eq('id', userId);

            if (profileError) throw profileError;

            const user = authService.getCurrentUser();
            user.phone = newPhone;
            localStorage.setItem('sensus_current_user', JSON.stringify(user));

            document.getElementById('profile-modal').remove();
            app.showNotification("Sucesso", "Seus dados de contato foram atualizados.", false);

        } catch (error) {
            app.showNotification("Erro", error.message, true);
        }
    }
};
