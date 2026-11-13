import { students, riskFor, modelRows } from "./data.js";
import { riskDistributionChart, courseRiskChart, scoreSpreadChart, modelR2Chart } from "./charts.js";
import { dashboard, studentsPage, assessmentPage, analyticsPage, qualityPage, modelsPage, aboutPage, tableRows, detailModal } from "./views.js";

const titles = {dashboard:"Overview",students:"Student directory",assessment:"Assess a student",analytics:"Risk analytics",quality:"Data quality",models:"Model comparison",about:"Project notes"};
const pageRoot = document.getElementById("page-content");
const sidebar = document.getElementById("sidebar");
let currentPage = "dashboard";
let currentStudent = null;
let pageNumber = 1;
const pageSize = 8;
let directoryState = {query:"",risk:"all",course:"all",sort:"score-desc"};
let analyticsState = {risk:"all",course:"all"};

document.getElementById("today-date").textContent = new Intl.DateTimeFormat("en", {month:"short",day:"numeric",year:"numeric"}).format(new Date());
document.getElementById("nav-count").textContent = String(students.length);

function toast(message){
  const region=document.getElementById("toast-region"), node=document.createElement("div");
  node.className="toast";node.textContent=message;region.append(node);
  window.setTimeout(()=>node.remove(),3200);
}
function filteredDirectory(){
  const query=directoryState.query.toLowerCase().trim();
  let rows=students.filter(s=>{
    const matchesQuery=!query||`${s.name} ${s.id} ${s.course}`.toLowerCase().includes(query);
    return matchesQuery&&(directoryState.risk==="all"||s.risk===directoryState.risk)&&(directoryState.course==="all"||s.course===directoryState.course);
  });
  if(directoryState.sort==="score-asc")rows.sort((a,b)=>a.score-b.score);
  else if(directoryState.sort==="admission-desc")rows.sort((a,b)=>b.admissionGrade-a.admissionGrade);
  else if(directoryState.sort==="admission-asc")rows.sort((a,b)=>a.admissionGrade-b.admissionGrade);
  else if(directoryState.sort==="name-asc")rows.sort((a,b)=>a.name.localeCompare(b.name));
  else rows.sort((a,b)=>b.score-a.score);
  return rows;
}
function visibleAnalytics(){
  return students.filter(s=>(analyticsState.risk==="all"||s.risk===analyticsState.risk)&&(analyticsState.course==="all"||s.course===analyticsState.course));
}
function drawDashboard(){
  riskDistributionChart(students);
  scoreSpreadChart(students,"dashboard-score-spread-chart");
}
function render(){
  document.getElementById("crumb-page").textContent=titles[currentPage];
  document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.page===currentPage));
  if(currentPage==="dashboard"){pageRoot.innerHTML=dashboard(students);drawDashboard();}
  if(currentPage==="students"){pageRoot.innerHTML=studentsPage();renderDirectory();}
  if(currentPage==="assessment")pageRoot.innerHTML=assessmentPage();
  if(currentPage==="analytics"){pageRoot.innerHTML=analyticsPage();drawAnalytics();}
  if(currentPage==="quality")pageRoot.innerHTML=qualityPage();
  if(currentPage==="models"){pageRoot.innerHTML=modelsPage();modelR2Chart(modelRows);}
  if(currentPage==="about")pageRoot.innerHTML=aboutPage();
  pageRoot.focus({preventScroll:true});
}
function renderDirectory(){
  const rows=filteredDirectory(), pages=Math.max(1,Math.ceil(rows.length/pageSize));
  pageNumber=Math.min(pageNumber,pages);
  const start=(pageNumber-1)*pageSize, shown=rows.slice(start,start+pageSize);
  const body=document.getElementById("student-table-body");
  if(!body)return;
  body.innerHTML=tableRows(shown);
  document.getElementById("directory-count").textContent=rows.length?`Showing ${start+1}–${Math.min(start+pageSize,rows.length)} of ${rows.length} synthetic records`:"No matching records";
  const nav=document.getElementById("pagination");
  nav.innerHTML=`<button class="page-btn" data-action="page-prev" aria-label="Previous page" ${pageNumber===1?"disabled":""}>‹</button>${Array.from({length:pages},(_,i)=>`<button class="page-btn ${pageNumber===i+1?"active":""}" data-action="page-to" data-page-number="${i+1}" aria-label="Page ${i+1}" aria-current="${pageNumber===i+1?"page":"false"}">${i+1}</button>`).join("")}<button class="page-btn" data-action="page-next" aria-label="Next page" ${pageNumber===pages?"disabled":""}>›</button>`;
}
function drawAnalytics(){
  const rows=visibleAnalytics();
  riskDistributionChart(rows);
  courseRiskChart(rows);
  scoreSpreadChart(rows);
  renderAnalyticsAttention(rows);
}
function renderAnalyticsAttention(rows){
  const root=document.getElementById("analytics-attention-table");
  if(!root)return;
  const highRows=[...rows].filter(s=>s.risk==="High").sort((a,b)=>b.score-a.score).slice(0,6);
  root.innerHTML=`<div class="table-wrap"><table class="student-table"><thead><tr><th>Demo reference</th><th>Age at enrollment</th><th>Course reference</th><th>Admission grade</th><th>Demo score</th><th>Review band</th><th>Details</th></tr></thead><tbody>${highRows.length?highRows.map(s=>`<tr data-student="${s.id}" tabindex="0" aria-label="View ${s.id} synthetic details"><td>${s.id}</td><td>${s.age}</td><td>${s.course}</td><td>${s.admissionGrade.toFixed(1)}</td><td>${s.score}</td><td><span class="badge high">High review</span></td><td><button class="row-action" data-student="${s.id}" aria-label="View ${s.id} details">View</button></td></tr>`).join(""):`<tr><td colspan="7"><div class="empty-state"><strong>No high-band examples in this selection</strong>Try another filter to explore the synthetic demo set.</div></td></tr>`}</tbody></table></div>`;
}
function navigate(page){
  if(!titles[page])return;
  currentPage=page;pageNumber=1;sidebar.classList.remove("open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded","false");
  render();
}
function showStudent(id){
  currentStudent=students.find(s=>s.id===id)||null;
  if(!currentStudent)return;
  document.getElementById("modal-root").innerHTML=detailModal(currentStudent);
  document.querySelector(".modal .close-button")?.focus();
}
function closeModal(){
  document.getElementById("modal-root").replaceChildren();currentStudent=null;
}
function exportRows(){
  const rows=filteredDirectory();
  if(!rows.length){toast("No visible records to export.");return;}
  const header=["Demo ID","Synthetic name","Age at enrollment","Course reference","Admission grade","Previous qualification grade","Demo score","Review band"];
  const quote=v=>`"${String(v).replaceAll('"','""')}"`;
  const csv=[header,...rows.map(s=>[s.id,s.name,s.age,s.course,s.admissionGrade,s.previousQualificationGrade,s.score,s.risk])].map(row=>row.map(quote).join(",")).join("\n");
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));link.download="synthetic-student-demo.csv";link.click();URL.revokeObjectURL(link.href);
  toast(`Exported ${rows.length} illustrative demo records.`);
}
const API_BASE_URL = "https://dropout-risk-nauj.onrender.com";

async function calculateDemo(form){
  const ageText=form.elements.age.value.trim(), admissionText=form.elements.admission.value.trim(), previousText=form.elements.previousQualification.value.trim();
  const age=Number(ageText), admission=Number(admissionText), previous=Number(previousText);
  const error=document.getElementById("assessment-error"), result=document.getElementById("assessment-result");
  if(!ageText||!admissionText||!previousText||!Number.isFinite(age)||age<16||age>75||!Number.isFinite(admission)||admission<0||admission>200||!Number.isFinite(previous)||previous<0||previous>200){
    error.textContent="Enter an age from 16 to 75 and both grades from 0 to 200.";
    result.classList.remove("visible");result.replaceChildren();return;
  }
  error.textContent="";
  result.innerHTML=`<div style="text-align:center;padding:20px;color:#8290a1;font-size:11px">Running the trained Random Forest model...</div>`;
  result.classList.add("visible");

  try{
    const response=await fetch(`${API_BASE_URL}/predict`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({age,admissionGrade:admission,previousQualificationGrade:previous})
    });
    if(!response.ok)throw new Error("API request failed");
    const data=await response.json();
    if(!data.success)throw new Error(data.error||"Prediction failed");

    const score=data.score, band=data.category, color=band==="High"?"#bd6663":band==="Medium"?"#c28a2d":"#398c72";
    result.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><small style="display:block;color:#8290a1;font-size:9px;font-weight:700;letter-spacing:.7px">LIVE MODEL PREDICTION - TUNED RANDOM FOREST</small><strong class="result-score">${score}</strong><span style="color:#8b98a7;font-size:10px"> / 100</span></div><span class="badge ${band.toLowerCase()}">${band} review</span></div><div class="result-meter"><span style="width:${score}%;background:${color}"></span></div><p class="result-explain"><strong style="color:#53677f">Live prediction:</strong> this score comes from the actual trained and tuned Random Forest Regressor, loaded from the project's saved model file. Age, admission grade, and previous qualification grade were supplied by you; remaining predictors use the model's training-set median values. The synthetic course reference is shown for context only and is not sent to the model. Use this as a prompt for supportive human review, not a certain outcome.</p>`;
    toast("Live prediction received from the trained model.");
  }catch(err){
    result.innerHTML=`<div style="color:#bd6663;font-size:11px;padding:12px">Could not reach the prediction service. Please try again in a moment.</div>`;
    toast("Prediction service unavailable.");
  }
}

document.addEventListener("click",event=>{
  const pageButton=event.target.closest("[data-page]");
  if(pageButton){navigate(pageButton.dataset.page);return;}
  const action=event.target.closest("[data-action]");
  if(action){
    const type=action.dataset.action;
    if(type==="page-prev"&&pageNumber>1){pageNumber--;renderDirectory();}
    if(type==="page-next"){pageNumber++;renderDirectory();}
    if(type==="page-to"){pageNumber=Number(action.dataset.pageNumber);renderDirectory();}
    if(type==="close-modal"&&(event.target===action||action.classList.contains("close-button")))closeModal();
    if(type==="export-demo")exportRows();
    if(type==="print")window.print();
    if(type==="quality-details")toast("Notebook cleaning counts are not loaded in this frontend demo.");
    if(type==="model-method")toast("Five-fold GridSearchCV is described in the notebook; exact CV values are not loaded.");
    return;
  }
  const row=event.target.closest("[data-student]");
  if(row){showStudent(row.dataset.student);return;}
  if(sidebar.classList.contains("open")&&!event.target.closest("#sidebar")&&!event.target.closest("#menu-toggle")){
    sidebar.classList.remove("open");document.getElementById("menu-toggle").setAttribute("aria-expanded","false");
  }
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    if(currentStudent)closeModal();
    sidebar.classList.remove("open");document.getElementById("menu-toggle").setAttribute("aria-expanded","false");
  }
  if((event.key==="Enter"||event.key===" ")&&event.target.matches("[data-student]")){event.preventDefault();showStudent(event.target.dataset.student);}
});
document.getElementById("menu-toggle").addEventListener("click",event=>{
  const open=sidebar.classList.toggle("open");event.currentTarget.setAttribute("aria-expanded",String(open));
});
pageRoot.addEventListener("input",event=>{
  if(event.target.id==="student-search"){directoryState.query=event.target.value;pageNumber=1;renderDirectory();}
});
pageRoot.addEventListener("change",event=>{
  if(event.target.id==="risk-filter"){directoryState.risk=event.target.value;pageNumber=1;renderDirectory();}
  if(event.target.id==="course-filter"){directoryState.course=event.target.value;pageNumber=1;renderDirectory();}
  if(event.target.id==="sort-filter"){directoryState.sort=event.target.value;pageNumber=1;renderDirectory();}
  if(event.target.id==="analytics-risk"){analyticsState.risk=event.target.value;drawAnalytics();}
  if(event.target.id==="analytics-course"){analyticsState.course=event.target.value;drawAnalytics();}
});
pageRoot.addEventListener("submit",event=>{
  if(event.target.id==="assessment-form"){event.preventDefault();calculateDemo(event.target);}
});
pageRoot.addEventListener("reset",event=>{
  if(event.target.id==="assessment-form")window.setTimeout(()=>{
    const out=document.getElementById("assessment-result"),error=document.getElementById("assessment-error");
    out?.classList.remove("visible");if(out)out.replaceChildren();if(error)error.textContent="";
  },0);
});

render();
