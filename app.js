const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
let data=JSON.parse(localStorage.getItem("riderProfitData")||'{"orders":[],"expenses":[],"settings":{"petrol":424,"mileage":35,"maintenance":3,"goal":98000}}');
function save(){localStorage.setItem("riderProfitData",JSON.stringify(data));render()}
function money(n){return "Rs. "+Number(n||0).toLocaleString("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2})}
function fuelPerKm(){return data.settings.petrol/Math.max(1,data.settings.mileage)}
function estimated(pay,km){const fuel=km*fuelPerKm(),maint=km*data.settings.maintenance,profit=pay-fuel-maint;return {fuel,maint,profit,rate:km?pay/km:0}}
function dateInit(){$("orderDate").value=today();$("expenseDate").value=today()}
function render(){
 const d=today(),orders=data.orders.filter(x=>x.date===d),expenses=data.expenses.filter(x=>x.date===d);
 const income=orders.reduce((s,x)=>s+x.pay,0),cost=expenses.reduce((s,x)=>s+x.amount,0),km=orders.reduce((s,x)=>s+x.km,0);
 $("todayIncome").textContent=money(income);$("todayExpenses").textContent=money(cost);$("todayOrders").textContent=orders.length;$("todayKm").textContent=km.toFixed(1)+" km";$("todayNet").textContent=money(income-cost);
 $("todayMeta").textContent=`${orders.length} orders • ${km.toFixed(1)} actual km`;
 const allIncome=data.orders.reduce((s,x)=>s+x.pay,0),allExpense=data.expenses.reduce((s,x)=>s+x.amount,0),goal=data.settings.goal||98000;
 $("targetProgress").textContent=Math.min(100,Math.round((allIncome-allExpense)/goal*100))+"% achieved (all recorded days)";
 $("petrolPrice").value=data.settings.petrol;$("mileage").value=data.settings.mileage;$("maintenance").value=data.settings.maintenance;$("goal").value=goal;
 const items=[...data.orders.map(x=>({...x,type:"Order",label:`${money(x.pay)} • ${x.km} km`,detail:x.note||"Completed order"})),...data.expenses.map(x=>({...x,type:"Expense",label:`-${money(x.amount)}`,detail:x.category+(x.note?" • "+x.note:"")}))].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 $("historyList").innerHTML=items.length?items.map(x=>`<div class="history-item"><div><b>${x.type}</b><small>${x.date} • ${escapeHtml(x.detail)}</small></div><b>${x.label}</b></div>`).join(""):'<p class="muted">No records yet. Add an order or expense.</p>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showEstimate(pay,km,el){if(!(pay>=0&&km>0)){el.textContent="Enter payment and distance to calculate.";el.className="result";return}const e=estimated(pay,km),rate=e.rate;let status=rate>=40?"GOOD":rate>=35?"CAUTION":"LOW";el.className="result "+(rate>=40?"":rate>=35?"warn":"bad");el.innerHTML=`<b>${status}</b> • ${money(rate)}/km<br>Estimated fuel: ${money(e.fuel)} • Maintenance reserve: ${money(e.maint)}<br><b>Estimated order profit: ${money(e.profit)}</b><br><small>Guide only: excludes waiting time, empty return distance and other daily costs.</small>`}
$("calcPay").addEventListener("input",()=>showEstimate(+$("calcPay").value,+$("calcKm").value,$("calcResult")));
$("calcKm").addEventListener("input",()=>showEstimate(+$("calcPay").value,+$("calcKm").value,$("calcResult")));
$("orderPay").addEventListener("input",()=>showEstimate(+$("orderPay").value,+$("orderDistance").value,$("orderEstimate")));
$("orderDistance").addEventListener("input",()=>showEstimate(+$("orderPay").value,+$("orderDistance").value,$("orderEstimate")));
$("orderForm").addEventListener("submit",e=>{e.preventDefault();data.orders.push({id:Date.now(),date:$("orderDate").value,pay:+$("orderPay").value,km:+$("orderDistance").value,note:$("orderNote").value.trim()});e.target.reset();dateInit();save();$("orderEstimate").textContent="Estimated profit will appear here.";});
$("expenseForm").addEventListener("submit",e=>{e.preventDefault();data.expenses.push({id:Date.now(),date:$("expenseDate").value,category:$("expenseCategory").value,amount:+$("expenseAmount").value,note:$("expenseNote").value.trim()});e.target.reset();dateInit();save()});
$("saveSettings").onclick=()=>{data.settings={petrol:+$("petrolPrice").value||424,mileage:+$("mileage").value||35,maintenance:+$("maintenance").value||0,goal:+$("goal").value||98000};save();alert("Settings saved.")};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("exportCsv").onclick=()=>{const rows=[["Type","Date","Amount LKR","Distance km","Category","Note"],...data.orders.map(x=>["Order",x.date,x.pay,x.km,"",x.note]),...data.expenses.map(x=>["Expense",x.date,x.amount,"",x.category,x.note])];const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="rider-profit-data.csv";a.click();URL.revokeObjectURL(a.href)};
$("clearData").onclick=()=>{if(confirm("Delete all orders, expenses and settings? Export a backup first if needed.")){data={orders:[],expenses:[],settings:{petrol:424,mileage:35,maintenance:3,goal:98000}};save()}};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
dateInit();render();