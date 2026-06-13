const storeKey="aqua_space_data_v1";
const blank={settings:{name:"KingMiixin"},water:0,exercise:false,tasks:[],events:[],studies:[],finance:{salary:0,fixed:[],variables:[]},notes:[],projects:[]};
let db=JSON.parse(localStorage.getItem(storeKey)||"null")||structuredClone(blank);
let pomodoroSeconds=1500,pomodoroInterval=null;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function setText(selector, value){
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}
function setHTML(selector, value){
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}
const money=v=>(Number(v)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=t=>String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const save=()=>localStorage.setItem(storeKey,JSON.stringify(db));
const uid=()=>crypto.randomUUID();
function fmtDate(d){if(!d)return"Sem data";let [y,m,day]=d.split("-");return`${day}/${m}/${y}`}
function fmtMonth(m){if(!m)return"Sem mês";let [y,mo]=m.split("-");return`${mo}/${y}`}
function stamp(d,t="00:00"){return new Date(`${d}T${t||"00:00"}`).getTime()}
function currentMonth(){return new Date().toISOString().slice(0,7)}
function addMonths(ym,n){let [y,m]=ym.split("-").map(Number);let d=new Date(y,m-1+n,1);return d.toISOString().slice(0,7)}
function isFixedActive(f,month=currentMonth()){let start=f.start,end=addMonths(f.start,Number(f.installments)-1);return month>=start&&month<=end}
function fixedEnd(f){return addMonths(f.start,Number(f.installments)-1)}
function priorityText(p){return{alta:"🔴 Alta",media:"🟡 Média",baixa:"🟢 Baixa"}[p]||p}
function sortedByDate(a){return[...a].sort((x,y)=>(x.date||"9999").localeCompare(y.date||"9999")||(x.time||"").localeCompare(y.time||""))}
function item({title,meta=[],desc="",actions="",classes=""}){return`<article class="item ${classes}"><p class="item-title">${esc(title)}</p><div class="meta">${meta.map(m=>`<span class="badge ${m.cls||""}">${esc(m.txt)}</span>`).join("")}</div>${desc?`<p class="item-desc">${esc(desc)}</p>`:""}<div class="actions">${actions}</div></article>`}
function bindNav(){ $$(".nav-item").forEach(b=>b.onclick=()=>{ $$(".page-section").forEach(s=>s.classList.toggle("active",s.id===b.dataset.section)); $$(".nav-item").forEach(i=>i.classList.toggle("active",i===b)); $("#pageTitle").textContent=b.innerText.trim().replace(/^[^\wÀ-ÿ]+/,""); $(".sidebar").classList.remove("open"); }); $("#menuToggle").onclick=()=>$(".sidebar").classList.toggle("open");}
function renderHeader(){let now=new Date(),h=now.getHours();$("#todayText").textContent=new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);$("#greeting").textContent=`${h<12?"Bom dia":h<18?"Boa tarde":"Boa noite"}, ${db.settings.name||"KingMiixin"} 🩵`}
function renderHabits(){$("#waterCount").textContent=db.water||0;$("#exerciseStatus").textContent=db.exercise?"Realizado hoje":"Não realizado hoje";$("#toggleExercise").textContent=db.exercise?"Desmarcar":"Marcar como feito";save()}
function renderPomodoro(){$("#pomodoroTimer").textContent=`${String(Math.floor(pomodoroSeconds/60)).padStart(2,"0")}:${String(pomodoroSeconds%60).padStart(2,"0")}`}
function startPomodoro(){if(pomodoroInterval)return;pomodoroInterval=setInterval(()=>{pomodoroSeconds--;renderPomodoro();if(pomodoroSeconds<=0){clearInterval(pomodoroInterval);pomodoroInterval=null;pomodoroSeconds=1500;renderPomodoro();alert("Pomodoro concluído! 🌊")}},1000)}
function resetPomodoro(){clearInterval(pomodoroInterval);pomodoroInterval=null;pomodoroSeconds=1500;renderPomodoro()}
function renderTasks(){let search=($("#taskSearch")?.value||"").toLowerCase(),filter=$("#taskFilter")?.value||"todas";let tasks=db.tasks.filter(t=>(filter==="todas"||t.status===filter)&&(`${t.title} ${t.category} ${t.description}`.toLowerCase().includes(search)));let cols={hoje:"#tasksHoje",andamento:"#tasksAndamento",concluida:"#tasksConcluida"};Object.values(cols).forEach(s=>setHTML(s,""));["hoje","andamento","concluida"].forEach(st=>{let arr=sortedByDate(tasks.filter(t=>t.status===st));$(cols[st]).innerHTML=arr.length?arr.map(t=>item({title:t.title,classes:t.status==="concluida"?"done":"",meta:[{txt:t.category},{txt:priorityText(t.priority),cls:"priority-"+t.priority},{txt:fmtDate(t.date)}],desc:t.description,actions:`${st!=="hoje"?`<button class="ghost-btn" onclick="setTask('${t.id}','hoje')">Hoje</button>`:""}${st!=="andamento"?`<button class="ghost-btn" onclick="setTask('${t.id}','andamento')">Em andamento</button>`:""}${st!=="concluida"?`<button class="primary-btn" onclick="setTask('${t.id}','concluida')">Concluir</button>`:""}<button class="danger-btn" onclick="delTask('${t.id}')">Excluir</button>`})).join(""):`<p class="empty">Nada por aqui ainda.</p>`});updateDashboard()}
window.setTask=(id,st)=>{let t=db.tasks.find(x=>x.id===id);if(t)t.status=st;save();renderTasks()}
window.delTask=id=>{db.tasks=db.tasks.filter(x=>x.id!==id);save();renderTasks()}
function renderEvents(){let search=($("#eventSearch")?.value||"").toLowerCase(),filter=$("#eventFilter")?.value||"todos";let events=db.events.filter(e=>(filter==="todos"||e.category===filter)&&(`${e.title} ${e.category} ${e.description}`.toLowerCase().includes(search))).sort((a,b)=>stamp(a.date,a.time)-stamp(b.date,b.time));$("#eventList").innerHTML=events.length?events.map(e=>item({title:e.title,classes:"event-"+e.color,meta:[{txt:e.category},{txt:`${fmtDate(e.date)} • ${e.time}`}],desc:e.description,actions:`<button class="danger-btn" onclick="delEvent('${e.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhum compromisso encontrado.</p>`;let upcoming=db.events.filter(e=>stamp(e.date,e.time)>=Date.now()).sort((a,b)=>stamp(a.date,a.time)-stamp(b.date,b.time));$("#eventSummaryCount").textContent=`${db.events.length} compromisso${db.events.length===1?"":"s"}`;$("#eventSummaryNext").textContent=upcoming[0]?`Próximo: ${upcoming[0].title} em ${fmtDate(upcoming[0].date)} • ${upcoming[0].time}`:"Nenhum próximo evento.";updateDashboard()}
window.delEvent=id=>{db.events=db.events.filter(x=>x.id!==id);save();renderEvents()}
function renderStudies(){let search=($("#studySearch")?.value||"").toLowerCase(),filter=$("#studyFilter")?.value||"todos";let arr=db.studies.filter(s=>(filter==="todos"||s.status===filter)&&(`${s.subject} ${s.title} ${s.notes}`.toLowerCase().includes(search))).sort((a,b)=>stamp(a.date,a.time)-stamp(b.date,b.time));$("#studyList").innerHTML=arr.length?arr.map(s=>item({title:`${s.subject} — ${s.title}`,classes:s.status==="concluido"?"done":"",meta:[{txt:`${fmtDate(s.date)} ${s.time||""}`},{txt:priorityText(s.priority),cls:"priority-"+s.priority},{txt:s.status}],desc:s.notes,actions:`${s.status!=="concluido"?`<button class="primary-btn" onclick="setStudy('${s.id}','concluido')">Concluir</button>`:`<button class="ghost-btn" onclick="setStudy('${s.id}','pendente')">Reabrir</button>`}<button class="danger-btn" onclick="delStudy('${s.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhuma atividade de estudos.</p>`;updateDashboard()}
window.setStudy=(id,st)=>{let s=db.studies.find(x=>x.id===id);if(s)s.status=st;save();renderStudies()}
window.delStudy=id=>{db.studies=db.studies.filter(x=>x.id!==id);save();renderStudies()}
function financeTotals(){let m=currentMonth();let fixed=db.finance.fixed.filter(f=>isFixedActive(f,m)).reduce((s,f)=>s+Number(f.value),0);let variables=db.finance.variables.filter(v=>(v.date||"").slice(0,7)===m).reduce((s,v)=>s+Number(v.value),0);let salary=Number(db.finance.salary)||0;return{salary,fixed,variables,balance:salary-fixed-variables}}
function renderFinance(){let t=financeTotals();$("#salaryView").textContent=money(t.salary);$("#fixedView").textContent=money(t.fixed);$("#variableView").textContent=money(t.variables);$("#balanceView").textContent=money(t.balance);$("#salaryInput").value=db.finance.salary||"";$("#fixedList").innerHTML=db.finance.fixed.length?db.finance.fixed.map(f=>item({title:f.name,meta:[{txt:money(f.value)},{txt:`${f.installments} parcelas`},{txt:`Início ${fmtMonth(f.start)}`},{txt:`Fim ${fmtMonth(fixedEnd(f))}`}],desc:isFixedActive(f)? "Ativo neste mês":"Fora do mês atual",actions:`<button class="danger-btn" onclick="delFixed('${f.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhum boleto/parcela cadastrado.</p>`;$("#variableList").innerHTML=db.finance.variables.length?db.finance.variables.slice().reverse().map(v=>item({title:v.name,meta:[{txt:money(v.value)},{txt:v.category},{txt:fmtDate(v.date)}],actions:`<button class="danger-btn" onclick="delVariable('${v.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhum gasto variável.</p>`;updateDashboard()}
window.delFixed=id=>{db.finance.fixed=db.finance.fixed.filter(x=>x.id!==id);save();renderFinance()}
window.delVariable=id=>{db.finance.variables=db.finance.variables.filter(x=>x.id!==id);save();renderFinance()}
function renderNotes(){let search=($("#noteSearch")?.value||"").toLowerCase(),filter=$("#noteFilter")?.value||"todas";let arr=db.notes.filter(n=>(filter==="todas"||n.category===filter)&&(`${n.title} ${n.category} ${n.text}`.toLowerCase().includes(search))).reverse();$("#noteList").innerHTML=arr.length?arr.map(n=>item({title:n.title,meta:[{txt:n.category},{txt:fmtDate(n.date)}],desc:n.text,actions:`<button class="danger-btn" onclick="delNote('${n.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhuma anotação.</p>`}
window.delNote=id=>{db.notes=db.notes.filter(x=>x.id!==id);save();renderNotes()}
function renderProjects(){$("#projectList").innerHTML=db.projects.length?db.projects.map(p=>item({title:p.name,meta:[{txt:p.status}],desc:p.description,actions:`<button class="danger-btn" onclick="delProject('${p.id}')">Excluir</button>`})).join(""):`<p class="empty">Nenhum projeto cadastrado.</p>`}
window.delProject=id=>{db.projects=db.projects.filter(x=>x.id!==id);save();renderProjects()}
function updateDashboard(){
  const task = sortedByDate(db.tasks.filter(t => t.status !== "concluida"))[0];
  setText("#dashTask", task?.title || "Nenhuma tarefa");
  setText("#dashTaskMeta", task ? `${task.category} • ${fmtDate(task.date)} • ${priorityText(task.priority)}` : "Cadastre uma tarefa.");

  const ev = db.events
    .filter(e => stamp(e.date, e.time) >= Date.now())
    .sort((a,b) => stamp(a.date,a.time) - stamp(b.date,b.time))[0];
  setText("#dashEvent", ev?.title || "Nenhum compromisso");
  setText("#dashEventMeta", ev ? `${ev.category} • ${fmtDate(ev.date)} • ${ev.time}` : "Cadastre um evento.");

  const st = db.studies
    .filter(s => s.status !== "concluido" && stamp(s.date, s.time) >= Date.now() - 86400000)
    .sort((a,b) => stamp(a.date,a.time) - stamp(b.date,b.time))[0];
  setText("#dashStudy", st ? `${st.subject}: ${st.title}` : "Nenhuma atividade");
  setText("#dashStudyMeta", st ? `${fmtDate(st.date)} ${st.time || ""} • ${priorityText(st.priority)}` : "Cadastre uma atividade.");

  const f = financeTotals();
  setText("#dashBalance", money(f.balance));
  setText("#dashFinanceMeta", `Salário ${money(f.salary)} - fixos ${money(f.fixed)} - variáveis ${money(f.variables)}`);

  // Compatibilidade com versões antigas do HTML, caso algum arquivo não tenha sido substituído no GitHub.
  setText("#dashboardNextTaskTitle", task?.title || "Nenhuma tarefa");
  setText("#dashboardNextTaskMeta", task ? `${task.category} • ${fmtDate(task.date)} • ${priorityText(task.priority)}` : "Cadastre uma tarefa.");
  setText("#dashboardNextEventTitle", ev?.title || "Nenhum compromisso");
  setText("#dashboardNextEventMeta", ev ? `${ev.category} • ${fmtDate(ev.date)} • ${ev.time}` : "Cadastre um evento.");
}
function backup(){let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="aqua-space-backup.json";a.click();URL.revokeObjectURL(a.href)}
function importBackup(file){let r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();location.reload()}catch{alert("Arquivo inválido.")}};r.readAsText(file)}
function clearAll(){if(confirm("Tem certeza que quer apagar todos os dados locais do Aqua Space?")){localStorage.removeItem(storeKey);location.reload()}}
function bindForms(){
$("#addWater").onclick=()=>{db.water=Math.min((db.water||0)+1,10);renderHabits()};$("#toggleExercise").onclick=()=>{db.exercise=!db.exercise;renderHabits()};$("#startPomodoro").onclick=startPomodoro;$("#resetPomodoro").onclick=resetPomodoro;
$("#taskForm").onsubmit=e=>{e.preventDefault();db.tasks.push({id:uid(),title:taskTitle.value.trim(),category:taskCategory.value,priority:taskPriority.value,status:taskStatus.value,date:taskDate.value,description:taskDescription.value.trim()});save();e.target.reset();renderTasks()};
$("#eventForm").onsubmit=e=>{e.preventDefault();db.events.push({id:uid(),title:eventTitle.value.trim(),category:eventCategory.value,date:eventDate.value,time:eventTime.value,color:eventColor.value,description:eventDescription.value.trim()});save();e.target.reset();renderEvents()};
$("#studyForm").onsubmit=e=>{e.preventDefault();db.studies.push({id:uid(),subject:studySubject.value.trim(),title:studyTitle.value.trim(),date:studyDate.value,time:studyTime.value,priority:studyPriority.value,notes:studyNotes.value.trim(),status:"pendente"});save();e.target.reset();renderStudies()};
$("#salaryForm").onsubmit=e=>{e.preventDefault();db.finance.salary=Number(salaryInput.value)||0;save();renderFinance()};
$("#fixedForm").onsubmit=e=>{e.preventDefault();db.finance.fixed.push({id:uid(),name:fixedName.value.trim(),value:Number(fixedValue.value)||0,start:fixedStart.value,installments:Number(fixedInstallments.value)||1});save();e.target.reset();renderFinance()};
$("#variableForm").onsubmit=e=>{e.preventDefault();db.finance.variables.push({id:uid(),name:variableName.value.trim(),value:Number(variableValue.value)||0,category:variableCategory.value,date:variableDate.value||new Date().toISOString().slice(0,10)});save();e.target.reset();renderFinance()};
$("#noteForm").onsubmit=e=>{e.preventDefault();db.notes.push({id:uid(),title:noteTitle.value.trim(),category:noteCategory.value,text:noteText.value.trim(),date:new Date().toISOString().slice(0,10)});save();e.target.reset();renderNotes()};
$("#projectForm").onsubmit=e=>{e.preventDefault();db.projects.push({id:uid(),name:projectName.value.trim(),status:projectStatus.value,description:projectDescription.value.trim()});save();e.target.reset();renderProjects()};
$("#settingsForm").onsubmit=e=>{e.preventDefault();db.settings.name=displayName.value.trim()||"KingMiixin";save();renderHeader();alert("Nome salvo!")};displayName.value=db.settings.name||"KingMiixin";
["taskSearch","taskFilter"].forEach(id=>$("#"+id).oninput=renderTasks);["eventSearch","eventFilter"].forEach(id=>$("#"+id).oninput=renderEvents);["studySearch","studyFilter"].forEach(id=>$("#"+id).oninput=renderStudies);["noteSearch","noteFilter"].forEach(id=>$("#"+id).oninput=renderNotes);
$("#exportBackup").onclick=backup;$("#importBackup").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]);$("#clearAll").onclick=clearAll}
document.addEventListener("DOMContentLoaded",()=>{bindNav();bindForms();renderHeader();renderHabits();renderPomodoro();renderTasks();renderEvents();renderStudies();renderFinance();renderNotes();renderProjects();updateDashboard()});