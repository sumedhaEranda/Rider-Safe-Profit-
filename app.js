const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const DEFAULTS={petrol:424,mileage:35,maintenance:3,goal:98000};
let data;
try{data=JSON.parse(localStorage.getItem("riderProfitData")||'{"orders":[],"expenses":[],"settings":{"petrol":424,"mileage":35,"maintenance":3,"goal":98000}}')}catch(e){data={orders:[],expenses:[],settings:{...DEFAULTS}}}
data.orders=Array.isArray(data.orders)?data.orders:[];
data.expenses=Array.isArray(data.expenses)?data.expenses:[];
data.settings={...DEFAULTS,...(data.settings||{})};
function save(){localStorage.setItem("riderProfitData",JSON.stringify(data));render()}
function money(n){return "LKR "+Number(n||0).toLocaleString("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2})}
function fuelPerKm(){return data.settings.petrol/Math.max(1,data.settings.mileage)}
function estimated(pay,km){const fuel=km*fuelPerKm(),maint=km*data.settings.maintenance,profit=pay-fuel-maint;return {fuel,maint,profit,rate:km?pay/km:0}}
function dateInit(){$("orderDate").value=today();$("expenseDate").value=today()}
function render(){
 const d=today(),orders=data.orders.filter(x=>x.date===d),expenses=data.expenses.filter(x=>x.date===d);
 const income=orders.reduce((s,x)=>s+(+x.pay||0),0),cost=expenses.reduce((s,x)=>s+(+x.amount||0),0),km=orders.reduce((s,x)=>s+(+x.km||0),0);
 $("todayIncome").textContent=money(income);$("todayExpenses").textContent=money(cost);$("todayOrders").textContent=orders.length;$("todayKm").textContent=km.toFixed(1)+" km";$("todayNet").textContent=money(income-cost);
 $("todayMeta").textContent=`${orders.length} orders • ${km.toFixed(1)} actual km`;
 const allIncome=data.orders.reduce((s,x)=>s+(+x.pay||0),0),allExpense=data.expenses.reduce((s,x)=>s+(+x.amount||0),0),goal=data.settings.goal||98000;
 $("targetProgress").textContent=Math.min(100,Math.round((allIncome-allExpense)/goal*100))+"% achieved (all recorded days)";
 $("petrolPrice").value=data.settings.petrol;$("mileage").value=data.settings.mileage;$("maintenance").value=data.settings.maintenance;$("goal").value=goal;
 const items=[...data.orders.map(x=>({...x,type:"Order",label:`${money(x.pay)} • ${x.km} km`,detail:x.note||"Completed order"})),...data.expenses.map(x=>({...x,type:"Expense",label:`-${money(x.amount)}`,detail:x.category+(x.note?" • "+x.note:"")}))].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 $("historyList").innerHTML=items.length?items.map(x=>`<div class="history-item"><div><b>${x.type}</b><small>${x.date} • ${escapeHtml(x.detail)}</small></div><b>${x.label}</b></div>`).join(""):'<p class="muted">No records yet. Add an order or expense.</p>';
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showEstimate(pay,km,el){
 if(!(pay>=0&&km>0)){el.textContent="Enter offer amount and total distance to calculate.";el.className="result";return}
 const e=estimated(pay,km),status=e.rate>=40?"GOOD":e.rate>=35?"CAUTION":"LOW";
 el.className="result "+(e.rate>=40?"":e.rate>=35?"warn":"bad");
 el.innerHTML=`<b>${status}</b> • ${money(e.rate)}/km<br>Estimated fuel: ${money(e.fuel)} • Maintenance reserve: ${money(e.maint)}<br><b>Estimated order profit: ${money(e.profit)}</b><br><small>Guide only. Consider waiting time, return distance and other costs too.</small>`;
}
$("calcPay").addEventListener("input",()=>showEstimate(+$("calcPay").value,+$("calcKm").value,$("calcResult")));
$("calcKm").addEventListener("input",()=>showEstimate(+$("calcPay").value,+$("calcKm").value,$("calcResult")));
$("orderPay").addEventListener("input",()=>showEstimate(+$("orderPay").value,+$("orderDistance").value,$("orderEstimate")));
$("orderDistance").addEventListener("input",()=>showEstimate(+$("orderPay").value,+$("orderDistance").value,$("orderEstimate")));
$("orderForm").addEventListener("submit",e=>{e.preventDefault();data.orders.push({id:Date.now(),date:$("orderDate").value,pay:+$("orderPay").value,km:+$("orderDistance").value,note:$("orderNote").value.trim()});e.target.reset();dateInit();save();$("orderEstimate").textContent="Estimated profit will appear here."});
$("expenseForm").addEventListener("submit",e=>{e.preventDefault();data.expenses.push({id:Date.now(),date:$("expenseDate").value,category:$("expenseCategory").value,amount:+$("expenseAmount").value,note:$("expenseNote").value.trim()});e.target.reset();dateInit();save()});
$("saveSettings").onclick=()=>{data.settings={petrol:+$("petrolPrice").value||424,mileage:+$("mileage").value||35,maintenance:+$("maintenance").value||0,goal:+$("goal").value||98000};save();alert("Settings saved.")};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("exportCsv").onclick=()=>{const rows=[["Type","Date","Amount LKR","Distance km","Category","Note"],...data.orders.map(x=>["Order",x.date,x.pay,x.km,"",x.note]),...data.expenses.map(x=>["Expense",x.date,x.amount,"",x.category,x.note])];const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="rider-profit-data.csv";a.click();URL.revokeObjectURL(a.href)};
$("clearData").onclick=()=>{if(confirm("Delete all orders, expenses and settings? Export a backup first if needed.")){data={orders:[],expenses:[],settings:{...DEFAULTS}};save()}};

/* Offer image OCR */
let selectedImage=null,previewUrl=null,ocrPromise=null;
const offerEls=["scanPay","scanPickup","scanTrip"];
function setScanStatus(msg,kind=""){const el=$("scanStatus");el.textContent=msg;el.className="scan-status "+kind}
function totalOfferKm(){return (+$("scanPickup").value||0)+(+$("scanTrip").value||0)}
function updateOfferPreview(){
 const pay=+$("scanPay").value||0,pickup=+$("scanPickup").value||0,trip=+$("scanTrip").value||0,total=pickup+trip;
 $("offerPricePreview").textContent=money(pay);
 $("offerRatePreview").textContent=total>0?money(pay/total)+" / km":"LKR 0.00 / km";
 $("offerTypeBadge").textContent=$("scanType").value+" offer";
 $("pickupPreview").textContent=pickup.toFixed(1)+" km";
 $("tripPreview").textContent=trip.toFixed(1)+" km";
 $("totalPreview").textContent=total.toFixed(1)+" km";
 showEstimate(pay,total,$("scanEstimate"));
 $("saveScannedOrder").disabled=!(pay>0&&total>0);
}
offerEls.concat(["scanType"]).forEach(id=>$(id).addEventListener("input",updateOfferPreview));
$("offerImage").addEventListener("change",e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 selectedImage=file;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);
 $("offerPreview").src=previewUrl;$("offerPreview").hidden=false;$("scanButton").disabled=false;
 setScanStatus("Image ready. Tap “Read offer details” to scan it.");
});
function loadTesseract(){
 if(window.Tesseract)return Promise.resolve(window.Tesseract);
 if(ocrPromise)return ocrPromise;
 ocrPromise=new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  s.onload=()=>resolve(window.Tesseract);s.onerror=()=>reject(new Error("Could not load OCR engine. Check your internet connection and try again."));
  document.head.appendChild(s);
 });
 return ocrPromise;
}
function parseOfferText(text){
 const normalized=text.replace(/[，]/g,",").replace(/\s+/g," ");
 const amountMatches=[...normalized.matchAll(/(?:LKR|RS\.?|රු)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi)]
  .filter(m=>!/^\s*\/\s*km/i.test(normalized.slice(m.index+m[0].length)));
 let pay=0;
 if(amountMatches.length)pay=parseFloat(amountMatches[0][1].replace(/,/g,""));
 const distanceMatches=[...normalized.matchAll(/(\d+(?:\.\d+)?)\s*km\b/gi)].map(m=>parseFloat(m[1]));
 const isDelivery=/delivery/i.test(normalized);
 let pickup=0,trip=0;
 if(distanceMatches.length>=2){pickup=distanceMatches[0];trip=distanceMatches[1];}
 else if(distanceMatches.length===1){trip=distanceMatches[0];}
 // Uber multi-stop delivery screens commonly show one total distance.
 if(isDelivery && distanceMatches.length>=1 && /\btotal\b/i.test(normalized)){pickup=0;trip=distanceMatches[distanceMatches.length-1];}
 return {pay,pickup,trip,type:isDelivery?"Delivery":"Moto",raw:text};
}
$("scanButton").addEventListener("click",async()=>{
 if(!selectedImage)return;
 $("scanButton").disabled=true;setScanStatus("Reading image… This may take a little time.");
 try{
  const T=await loadTesseract();
  const result=await T.recognize(selectedImage,"eng",{logger:m=>{if(m.status==="recognizing text")setScanStatus("Reading offer text… "+Math.round((m.progress||0)*100)+"%")}});
  const parsed=parseOfferText(result.data.text||"");
  if(parsed.pay>0)$("scanPay").value=parsed.pay;
  if(parsed.pickup>=0)$("scanPickup").value=parsed.pickup;
  if(parsed.trip>0)$("scanTrip").value=parsed.trip;
  if(parsed.pay>0||parsed.trip>0){
   $("scanType").value=parsed.type;updateOfferPreview();setScanStatus("Scan complete. Check the amount and distances below before saving.","success");
  }else{
   setScanStatus("Could not confidently find the amount or kilometres. Try a clearer screenshot, or correct the fields below.","error");
  }
 }catch(err){setScanStatus(err.message||"Scan failed. Try again with a clear image.","error")}
 finally{$("scanButton").disabled=false}
});
$("clearScan").onclick=()=>{
 selectedImage=null;$("offerImage").value="";$("offerPreview").hidden=true;$("offerPreview").removeAttribute("src");
 $("scanPay").value="";$("scanPickup").value="";$("scanTrip").value="";$("scanType").value="Moto";
 if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;updateOfferPreview();$("scanButton").disabled=true;
 setScanStatus("Choose an offer screenshot to begin.");
};
$("saveScannedOrder").onclick=()=>{
 const pay=+$("scanPay").value||0,km=totalOfferKm();if(!(pay>0&&km>0))return;
 data.orders.push({id:Date.now(),date:today(),pay,km,note:$("scanType").value+" offer"});
 save();setScanStatus("Order saved to today's history.","success");
};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
dateInit();render();updateOfferPreview();
