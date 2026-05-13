import { useState, useMemo, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

/* ── Fonts ── */
const _fl=document.createElement("link");_fl.rel="stylesheet";
_fl.href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap";
document.head.appendChild(_fl);

/* ── Tokens ── */
const T={
  bg:"#080A0F",card:"#0F1117",raised:"#171B24",hi:"#1E2230",
  border:"rgba(255,255,255,0.07)",border2:"rgba(255,255,255,0.14)",
  gold:"#C9A84C",green:"#2ECC94",red:"#F05B5B",blue:"#5B8EF0",
  purple:"#8B7FE8",pink:"#D46EAA",amber:"#EFA827",teal:"#5DC8CA",
  txt:"#F0F2F7",muted:"rgba(240,242,247,0.42)",faint:"rgba(240,242,247,0.07)",
};

/* ── Translations ── */
const S={
  en:{
    app:"My Wallet",home:"Home",txns:"Txns",goals:"Goals",ai:"AI",worth:"Worth",
    income:"Income",expense:"Expense",balance:"Total Balance",savRate:"Savings",
    netWorth:"Net Worth",assets:"Assets",debts:"Debts",totalAssets:"Total Assets",totalDebts:"Total Debts",
    addTxn:"Add Transaction",saveTxn:"Save Transaction",
    search:"Search by name, tag, category…",noTxn:"No transactions found.",
    budget:"Budget Goals",sGoals:"Savings Goals",
    aiName:"AI Finance Advisor",currency:"Currency Converter",online:"Online · Data shared",
    setPin:"Set your 4-digit PIN",confirmPin:"Confirm your PIN",enterPin:"Enter PIN",
    pinBad:"PINs don't match. Try again.",pinHint:"Secure your wallet",unlock:"Unlock",
    wallets:"Wallets",recurring:"Upcoming Recurring",recent:"Recent Transactions",viewAll:"VIEW ALL →",
    cat:"Category",wlt:"Wallet",desc:"Description",date:"Date",notes:"Notes (optional)",tags:"Custom Tags",
    tagsHint:"e.g. work, personal, urgent",
    today:"Today",week:"This Week",month:"This Month",
    scan:"Scan Receipt",next:"Next →",from:"From",to:"To",
    addAsset:"+ Add Asset",addDebt:"+ Add Debt",namePh:"e.g. Land, Savings",valuePh:"Value (Rs.)",
    transfer:"Transfer",lock:"Lock App",enablePin:"Enable PIN",disablePin:"Disable PIN",
    langBtn:"සිංහල",
    spent:"spent",saved:"saved",netIncome:"net",
    filterTag:"Filter by tag:",allTags:"All",
    amtDisplay:"Rs. 0",
  },
  si:{
    app:"මගේ මුදල්",home:"මුල් පිට",txns:"ගනුදෙනු",goals:"ඉලක්ක",ai:"AI",worth:"ශේෂය",
    income:"ආදායම",expense:"වියදම",balance:"මුළු ශේෂය",savRate:"ඉතිරිය",
    netWorth:"සම්පත් ශේෂය",assets:"වත්කම්",debts:"ණය",totalAssets:"මුළු වත්කම්",totalDebts:"මුළු ණය",
    addTxn:"ගනුදෙනු එකතු",saveTxn:"සුරකින්න",
    search:"නම, ටැග්, වර්ගය සොයන්න…",noTxn:"ගනුදෙනු නැත.",
    budget:"අයවැය ඉලක්ක",sGoals:"ඉතිරිකිරීමේ ඉලක්ක",
    aiName:"AI මූල්‍ය උපදේශක",currency:"මුදල් හුවමාරු",online:"සබැඳි · දත්ත බෙදාගනී",
    setPin:"PIN සකසන්න",confirmPin:"PIN තහවුරු කරන්න",enterPin:"PIN ඇතුළු කරන්න",
    pinBad:"PIN ගැලපෙන්නේ නැත.",pinHint:"මුදල් ආරක්ෂා කරන්න",unlock:"අගුළු ඇරින්න",
    wallets:"පසුම්බි",recurring:"ඉදිරි ගෙවීම්",recent:"මෑත ගනුදෙනු",viewAll:"සියල්ල →",
    cat:"වර්ගය",wlt:"පසුම්බිය",desc:"විස්තරය",date:"දිනය",notes:"සටහන් (අමතර)",tags:"ටැග්",
    tagsHint:"e.g. රැකියා, පුද්ගලික",
    today:"අද",week:"මෙ සතිය",month:"මෙ මාසය",
    scan:"රිසිට් ස්කෑන්",next:"ඊළඟ →",from:"සිට",to:"දක්වා",
    addAsset:"+ වත්කම් එකතු",addDebt:"+ ණය එකතු",namePh:"e.g. ඉඩම, ඉතිරිය",valuePh:"වටිනාකම (රු.)",
    transfer:"හුවමාරු",lock:"අගුළු දමන්න",enablePin:"PIN සක්‍රිය",disablePin:"PIN අක්‍රිය",
    langBtn:"English",
    spent:"වැය",saved:"ඉතිරි",netIncome:"ශේෂ",
    filterTag:"ටැග් අනුව:",allTags:"සියල්ල",
    amtDisplay:"රු. 0",
  }
};

const CATS={
  Food:{icon:"🍜",color:"#F05B5B"},Transport:{icon:"🚕",color:"#5B8EF0"},
  Shopping:{icon:"🛍️",color:"#D46EAA"},Housing:{icon:"🏠",color:"#8B7FE8"},
  Health:{icon:"💊",color:"#2ECC94"},Entertainment:{icon:"🎬",color:"#EFA827"},
  Education:{icon:"📚",color:"#5DC8CA"},Other:{icon:"📦",color:"#888"},
  Income:{icon:"💰",color:"#2ECC94"},
};
const FX={USD:{s:"$",r:310},EUR:{s:"€",r:335},GBP:{s:"£",r:390},AUD:{s:"A$",r:200},SGD:{s:"S$",r:230},INR:{s:"₹",r:3.7},JPY:{s:"¥",r:2.1}};
const QUICK=[500,1000,2000,5000,10000,25000,50000];
const today=()=>new Date().toISOString().slice(0,10);
const rs=n=>"Rs. "+Math.round(n).toLocaleString("en-IN");
const pct=(a,b)=>b===0?0:Math.min(100,Math.round((a/b)*100));

const INIT_WALLETS=[
  {id:"cash",name:"Cash",icon:"💵",color:T.green,start:15000},
  {id:"bank",name:"Bank",icon:"🏦",color:T.blue,start:87500},
  {id:"card",name:"Credit Card",icon:"💳",color:T.pink,start:22000},
];
const INIT_TXNS=[
  {id:1,type:"income", cat:"Income",       label:"Monthly salary",      amount:150000,date:"2026-05-01",wid:"bank",rec:false,tags:["salary"]},
  {id:2,type:"expense",cat:"Housing",      label:"Rent",                 amount:35000, date:"2026-05-02",wid:"bank",rec:true,tags:["monthly"]},
  {id:3,type:"expense",cat:"Food",         label:"Groceries – Keells",   amount:4800,  date:"2026-05-04",wid:"cash",rec:false,tags:["food","weekly"]},
  {id:4,type:"expense",cat:"Transport",    label:"Uber rides",           amount:2100,  date:"2026-05-05",wid:"cash",rec:false,tags:["commute"]},
  {id:5,type:"expense",cat:"Food",         label:"Dinner – Noodle Stop", amount:1600,  date:"2026-05-06",wid:"cash",rec:false,tags:["food"]},
  {id:6,type:"income", cat:"Income",       label:"Freelance project",    amount:22000, date:"2026-05-07",wid:"bank",rec:false,tags:["freelance"]},
  {id:7,type:"expense",cat:"Entertainment",label:"Netflix + Spotify",    amount:3200,  date:"2026-05-08",wid:"card",rec:true,tags:["monthly","subscriptions"]},
  {id:8,type:"expense",cat:"Health",       label:"Pharmacy",             amount:1850,  date:"2026-05-09",wid:"cash",rec:false,tags:["health"]},
  {id:9,type:"expense",cat:"Shopping",     label:"Clothing – H&M",       amount:7500,  date:"2026-05-10",wid:"card",rec:false,tags:["personal"]},
];
const INIT_BUDGETS=[
  {cat:"Food",limit:15000},{cat:"Transport",limit:5000},{cat:"Shopping",limit:10000},
  {cat:"Entertainment",limit:5000},{cat:"Health",limit:3000},{cat:"Housing",limit:40000},
];
const INIT_GOALS=[
  {id:1,name:"Emergency Fund",icon:"🛡️",target:200000,current:85000,color:T.green,deadline:"2026-12-31"},
  {id:2,name:"New Laptop",    icon:"💻",target:150000,current:45000,color:T.blue, deadline:"2026-08-01"},
  {id:3,name:"Vacation",      icon:"✈️",target:80000, current:20000,color:T.gold, deadline:"2026-09-15"},
];
const INIT_REC=[
  {id:1,label:"Netflix",   cat:"Entertainment",amount:1490,  freq:"monthly",next:"2026-06-08",wid:"card",type:"expense"},
  {id:2,label:"Gym",       cat:"Health",       amount:2500,  freq:"monthly",next:"2026-06-01",wid:"bank",type:"expense"},
  {id:3,label:"Salary",    cat:"Income",       amount:150000,freq:"monthly",next:"2026-06-01",wid:"bank",type:"income"},
  {id:4,label:"Phone Bill",cat:"Other",        amount:1800,  freq:"monthly",next:"2026-06-05",wid:"card",type:"expense"},
];
const INIT_ASSETS=[
  {id:1,name:"Bank Savings",icon:"🏦",value:87500,type:"savings"},
  {id:2,name:"Land – Galle",icon:"🏞️",value:4500000,type:"property"},
  {id:3,name:"Vehicle",     icon:"🚗",value:2800000,type:"vehicle"},
];
const INIT_DEBTS=[
  {id:1,name:"Personal Loan",icon:"🏦",value:350000,type:"loan"},
  {id:2,name:"Credit Card",  icon:"💳",value:45000, type:"credit"},
];

/* ── Global CSS ── */
const _gs=document.createElement("style");
_gs.textContent=`
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#080A0F;}
  input,select,textarea{background:#1E2230;border:1px solid rgba(255,255,255,0.1);color:#F0F2F7;
    border-radius:12px;padding:11px 13px;font-family:'Outfit',sans-serif;font-size:14px;
    width:100%;outline:none;transition:border-color .2s;}
  input:focus,select:focus,textarea:focus{border-color:#C9A84C;}
  select option{background:#1E2230;}
  textarea{resize:none;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  .row:hover{background:#171B24;border-radius:12px;}
  .nk{transition:background .1s,transform .08s !important;}
  .nk:active{transform:scale(.9) !important;background:#2A3040 !important;}
  .qa:hover{border-color:#C9A84C !important;color:#C9A84C !important;}
  .cb{transition:all .15s !important;}
  .cb:hover{transform:scale(1.07) !important;}
  .wc{transition:transform .2s;}
  .wc:hover{transform:translateY(-3px);}
  .tag-chip{transition:all .15s;}
  .tag-chip:hover{opacity:.7;}
  .fab:hover{transform:scale(1.08) !important;}
`;
document.head.appendChild(_gs);

/* ── Shared components ── */
const Lbl=({t})=><p style={{fontSize:10,fontWeight:600,letterSpacing:"0.09em",textTransform:"uppercase",color:T.muted,marginBottom:6}}>{t}</p>;

function Pill({cat}){
  const c=CATS[cat]||CATS.Other;
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,padding:"2px 7px",borderRadius:99,background:c.color+"22",color:c.color,fontWeight:600}}>{c.icon} {cat}</span>;
}

function ProgressRing({p,size=56,stroke=5,color}){
  const r=size/2-stroke,circ=2*Math.PI*r,dash=circ*(p/100);
  return(
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray .6s ease"}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{fill:T.txt,fontSize:11,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>{p}%</text>
    </svg>
  );
}

function TxnRow({t,onDel,wallets,anim}){
  const c=CATS[t.cat]||CATS.Other;
  const w=wallets?.find(x=>x.id===t.wid);
  return(
    <div className="row" style={{display:"flex",alignItems:"center",gap:12,padding:"11px 10px",
      transition:"background .15s",animation:anim?"fadeUp .3s ease":"none"}}>
      <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:c.color+"18",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{c.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:13,fontWeight:500,color:T.txt,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:3}}>
          {t.label}{t.rec&&<span style={{marginLeft:5,fontSize:10,color:T.gold}}>🔁</span>}
        </p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <Pill cat={t.cat}/>
          {w&&<span style={{fontSize:10,color:T.muted}}>{w.icon} {w.name}</span>}
          {t.tags?.slice(0,2).map(tg=>(
            <span key={tg} style={{fontSize:10,color:T.teal,background:T.teal+"18",padding:"1px 5px",borderRadius:99}}>#{tg}</span>
          ))}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <p style={{fontSize:14,fontWeight:700,letterSpacing:"-0.3px",color:t.type==="income"?T.green:T.red}}>
          {t.type==="income"?"+":"-"}{rs(t.amount)}</p>
        <p style={{fontSize:10,color:T.muted,marginTop:2}}>{t.date}</p>
      </div>
      {onDel&&<button onClick={onDel} style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer",padding:"0 2px",flexShrink:0,transition:"color .15s"}}
        onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.muted}>×</button>}
    </div>
  );
}

/* ── AI helper ── */
async function callAI(msgs,max=800){
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,messages:msgs}),
  });
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"Error.";
}

/* ── PIN Screen ── */
function PinScreen({mode,pin,onDigit,onBack,onSubmit,error,lang}){
  const s=S[lang];
  const title=mode==="setup1"?s.setPin:mode==="setup2"?s.confirmPin:s.enterPin;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif"}}>
      <div style={{marginBottom:12,fontSize:36}}>🔐</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:T.txt,marginBottom:6}}>{title}</h2>
      <p style={{fontSize:12,color:T.muted,marginBottom:32}}>
        {mode==="setup1"?s.pinHint:mode==="setup2"?s.confirmPin:""}
      </p>
      {/* dots */}
      <div style={{display:"flex",gap:14,marginBottom:error?12:32}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",
            background:i<pin.length?T.gold:"rgba(255,255,255,0.15)",
            transition:"background .2s",boxShadow:i<pin.length?`0 0 10px ${T.gold}66`:""}}/>
        ))}
      </div>
      {error&&<p style={{fontSize:12,color:T.red,marginBottom:20,animation:"shake .3s ease"}}>{error}</p>}
      {/* numpad */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
          k===""
            ?<div key={i}/>
            :<button key={i} className="nk" onClick={()=>k==="⌫"?onBack():onDigit(k)}
              style={{padding:"18px",borderRadius:14,border:"none",background:k==="⌫"?T.raised:T.hi,
                color:k==="⌫"?T.red:T.txt,fontSize:20,fontWeight:600,cursor:"pointer",
                fontFamily:"'Outfit',sans-serif"}}>
              {k}
            </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App(){
  /* ── storage helpers (localStorage for browser) ── */
  const save=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val));}catch{}};
  const load=(key,fallback)=>{try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback;}catch{return fallback;}};

  /* ── loading state ── */
  const [ready,setReady]=useState(false);

  /* lang */
  const [lang,setLang]=useState("en");
  const t=k=>S[lang][k]||k;

  /* PIN */
  const [pinEnabled,setPinEnabled]=useState(false);
  const [appPin,setAppPin]=useState("");
  const [pinLocked,setPinLocked]=useState(false);
  const [pinMode,setPinMode]=useState("setup1");
  const [pinInput,setPinInput]=useState("");
  const [pinTemp,setPinTemp]=useState("");
  const [pinError,setPinError]=useState("");
  const [showPinSetup,setShowPinSetup]=useState(false);

  const handlePinDigit=d=>{
    if(pinInput.length>=4)return;
    const next=pinInput+d;
    setPinInput(next);
    if(next.length===4){
      setTimeout(()=>{
        if(pinMode==="setup1"){setPinTemp(next);setPinInput("");setPinMode("setup2");setPinError("");}
        else if(pinMode==="setup2"){
          if(next===pinTemp){
            setAppPin(next);setPinEnabled(true);setPinLocked(false);
            setShowPinSetup(false);setPinInput("");setPinError("");
            save("mw-pin",{enabled:true,pin:next});
          } else {setPinError(t("pinBad"));setPinInput("");setPinMode("setup1");setPinTemp("");}
        } else if(pinMode==="unlock"){
          if(next===appPin){setPinLocked(false);setPinInput("");setPinError("");}
          else{setPinError(t("pinBad"));setPinInput("");}
        }
      },120);
    }
  };

  /* core data */
  const [txns,setTxns]=useState(INIT_TXNS);
  const [wallets]=useState(INIT_WALLETS);
  const [budgets,setBudgets]=useState(INIT_BUDGETS);
  const [goals,setGoals]=useState(INIT_GOALS);
  const [recList]=useState(INIT_REC);
  const [assets,setAssets]=useState(INIT_ASSETS);
  const [debts,setDebts]=useState(INIT_DEBTS);
  const [nextId,setNextId]=useState(10);

  /* ── Load all data from storage on mount ── */
  useEffect(()=>{
    try{
      setTxns(load("mw-txns",    INIT_TXNS));
      setBudgets(load("mw-budgets", INIT_BUDGETS));
      setGoals(load("mw-goals",   INIT_GOALS));
      setAssets(load("mw-assets",  INIT_ASSETS));
      setDebts(load("mw-debts",   INIT_DEBTS));
      setNextId(load("mw-nextid",  10));
      setLang(load("mw-lang",    "en"));
      const savedPin=load("mw-pin", {enabled:false,pin:""});
      if(savedPin.enabled){
        setPinEnabled(true);setAppPin(savedPin.pin);
        setPinLocked(true);setPinMode("unlock");
      }
    }catch{}
    setReady(true);
  },[]);

  /* ── Auto-save whenever data changes ── */
  useEffect(()=>{if(ready)save("mw-txns",txns);},[txns,ready]);
  useEffect(()=>{if(ready)save("mw-budgets",budgets);},[budgets,ready]);
  useEffect(()=>{if(ready)save("mw-goals",goals);},[goals,ready]);
  useEffect(()=>{if(ready)save("mw-assets",assets);},[assets,ready]);
  useEffect(()=>{if(ready)save("mw-debts",debts);},[debts,ready]);
  useEffect(()=>{if(ready)save("mw-nextid",nextId);},[nextId,ready]);
  useEffect(()=>{if(ready)save("mw-lang",lang);},[lang,ready]);

  /* nav */
  const [view,setView]=useState("home");

  /* add modal */
  const [modal,setModal]=useState(false);
  const [mStep,setMStep]=useState("amount");
  const [mType,setMType]=useState("expense");
  const [mAmt,setMAmt]=useState("");
  const [mCat,setMCat]=useState("Food");
  const [mLabel,setMLabel]=useState("");
  const [mWallet,setMWallet]=useState("cash");
  const [mDate,setMDate]=useState(today());
  const [mRec,setMRec]=useState(false);
  const [mFreq,setMFreq]=useState("monthly");
  const [mNotes,setMNotes]=useState("");
  const [mTagInput,setMTagInput]=useState("");
  const [autoLoad,setAutoLoad]=useState(false);
  const [scanLoad,setScanLoad]=useState(false);
  const fileRef=useRef(null);

  /* search & filter */
  const [searchQ,setSearchQ]=useState("");
  const [filterCat,setFilterCat]=useState("All");
  const [filterTag,setFilterTag]=useState("All");

  /* net worth forms */
  const [assetForm,setAssetForm]=useState({name:"",value:"",icon:"🏦",type:"savings"});
  const [debtForm,setDebtForm]=useState({name:"",value:"",icon:"🏦",type:"loan"});
  const [nextAid,setNextAid]=useState(4);
  const [nextDid,setNextDid]=useState(3);

  /* goals */
  const [goalTab,setGoalTab]=useState("savings");
  const [goalAddAmt,setGoalAddAmt]=useState({});
  const [newGoalForm,setNewGoalForm]=useState(null);
  const [editBud,setEditBud]=useState(false);
  const [budDraft,setBudDraft]=useState({});

  /* AI */
  const [chat,setChat]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const chatEnd=useRef(null);

  /* currency */
  const [cvtAmt,setCvtAmt]=useState("");
  const [cvtFrom,setCvtFrom]=useState("LKR");
  const [cvtTo,setCvtTo]=useState("USD");

  /* computed */
  const income =useMemo(()=>txns.filter(x=>x.type==="income") .reduce((s,x)=>s+x.amount,0),[txns]);
  const expense=useMemo(()=>txns.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0),[txns]);
  const balance=income-expense;
  const savRate=pct(balance,income);

  const catSpend=useMemo(()=>{
    const m={};txns.filter(x=>x.type==="expense").forEach(x=>{m[x.cat]=(m[x.cat]||0)+x.amount;});return m;
  },[txns]);

  const pieData=useMemo(()=>
    Object.entries(catSpend).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}))
  ,[catSpend]);

  const walletBal=useMemo(()=>{
    const m={};wallets.forEach(w=>{m[w.id]=w.start;});
    txns.forEach(x=>{if(m.hasOwnProperty(x.wid))m[x.wid]+=x.type==="income"?x.amount:-x.amount;});
    return m;
  },[txns,wallets]);

  const totalAssets=useMemo(()=>assets.reduce((s,a)=>s+a.value,0),[assets]);
  const totalDebts =useMemo(()=>debts.reduce((s,d)=>s+d.value,0),[debts]);
  const netWorth   =totalAssets-totalDebts;

  const allTags=useMemo(()=>{
    const s=new Set();txns.forEach(x=>x.tags?.forEach(tg=>s.add(tg)));return["All",...s];
  },[txns]);

  const alerts=useMemo(()=>
    budgets.filter(b=>{const sp=catSpend[b.cat]||0;return sp>b.limit*0.8;})
    .map(b=>({...b,spent:catSpend[b.cat]||0,over:catSpend[b.cat]>b.limit}))
  ,[budgets,catSpend]);

  /* today / week spending */
  const todayStr=today();
  const todaySpend=useMemo(()=>txns.filter(x=>x.type==="expense"&&x.date===todayStr).reduce((s,x)=>s+x.amount,0),[txns,todayStr]);
  const weekStart=useMemo(()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());return d.toISOString().slice(0,10);},[]);
  const weekSpend=useMemo(()=>txns.filter(x=>x.type==="expense"&&x.date>=weekStart).reduce((s,x)=>s+x.amount,0),[txns,weekStart]);

  const weeklyData=useMemo(()=>[
    {week:"Wk 1",income:150000,expense:39800},{week:"Wk 2",income:22000,expense:6900},
    {week:"Wk 3",income:0,expense:9350},{week:"Wk 4",income:0,expense:0},
  ],[]);

  const filtered=useMemo(()=>{
    const q=searchQ.toLowerCase();
    return [...txns].reverse().filter(x=>{
      const matchCat=filterCat==="All"||x.cat===filterCat;
      const matchTag=filterTag==="All"||x.tags?.includes(filterTag);
      const matchQ=!q||x.label.toLowerCase().includes(q)||x.cat.toLowerCase().includes(q)||x.tags?.some(tg=>tg.includes(q));
      return matchCat&&matchTag&&matchQ;
    });
  },[txns,searchQ,filterCat,filterTag]);

  const cvtResult=useMemo(()=>{
    const n=parseFloat(cvtAmt)||0;
    if(cvtFrom==="LKR"&&cvtTo!=="LKR")return n/(FX[cvtTo]?.r||1);
    if(cvtFrom!=="LKR"&&cvtTo==="LKR")return n*(FX[cvtFrom]?.r||1);
    if(cvtFrom!=="LKR"&&cvtTo!=="LKR")return n*(FX[cvtFrom]?.r||1)/(FX[cvtTo]?.r||1);
    return n;
  },[cvtAmt,cvtFrom,cvtTo]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[chat]);

  /* modal helpers */
  const openModal=()=>{
    setMType("expense");setMCat("Food");setMAmt("");setMLabel("");setMWallet("cash");
    setMDate(today());setMRec(false);setMFreq("monthly");setMNotes("");setMTagInput("");setMStep("amount");
    setModal(true);
  };
  const numPress=k=>{
    if(k==="⌫")setMAmt(a=>a.slice(0,-1));
    else if(k==="."){if(!mAmt.includes("."))setMAmt(a=>a+".");}
    else{if(mAmt.replace(".","").length<9)setMAmt(a=>a+k);}
  };
  const autoCategory=async()=>{
    if(!mLabel.trim())return;setAutoLoad(true);
    try{
      const r=await callAI([{role:"user",content:`Categorize: "${mLabel}"\nPick ONE: Food,Transport,Shopping,Housing,Health,Entertainment,Education,Other,Income\nReply ONLY the word.`}],50);
      const cat=r.trim().split(/\s+/)[0];
      if(CATS[cat]){setMCat(cat);if(cat==="Income")setMType("income");}
    }finally{setAutoLoad(false);}
  };
  const scanReceipt=async(file)=>{
    setScanLoad(true);
    try{
      const b64=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(",")[1]);fr.onerror=rej;fr.readAsDataURL(file);});
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{
          role:"user",content:[
            {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},
            {type:"text",text:'Extract. Reply ONLY as JSON: {"amount":number,"label":"store name","category":"Food|Transport|Shopping|Health|Entertainment|Education|Other"}'}
          ]
        }]}),
      });
      const d=await r.json();
      const txt=(d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim();
      const p=JSON.parse(txt);
      if(p.amount)setMAmt(String(p.amount));
      if(p.label)setMLabel(p.label);
      if(p.category&&CATS[p.category])setMCat(p.category);
      setMStep("details");
    }catch{alert("Could not read receipt.");}
    finally{setScanLoad(false);}
  };
  const handleSave=()=>{
    const amt=parseFloat(mAmt);
    if(!amt||amt<=0||!mLabel.trim())return;
    const tags=mTagInput.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);
    setTxns(p=>[...p,{id:nextId,type:mType,cat:mCat,label:mLabel.trim(),amount:amt,date:mDate,wid:mWallet,rec:mRec,freq:mRec?mFreq:null,notes:mNotes,tags}]);
    setNextId(n=>n+1);setModal(false);
  };

  /* AI chat */
  const sendChat=async()=>{
    if(!chatInput.trim()||chatLoad)return;
    const msg=chatInput.trim();setChatInput("");
    const ctx=`Sri Lanka (Rs.). Income:${rs(income)} Expense:${rs(expense)} Balance:${rs(balance)} NetWorth:${rs(netWorth)}\nSpending:${pieData.map(p=>`${p.name} ${rs(p.value)}`).join(", ")}`;
    const hist=[...chat,{role:"user",content:msg}];setChat(hist);setChatLoad(true);
    try{
      const reply=await callAI([
        {role:"user",content:`Premium Sri Lankan finance advisor. Data:\n${ctx}\nBe concise, warm, practical. Rs. only. Answer: ${msg}`},
        {role:"assistant",content:"Here's my analysis:"},...hist
      ]);
      setChat(h=>[...h,{role:"assistant",content:reply}]);
    }catch{setChat(h=>[...h,{role:"assistant",content:"Connection error."}]);}
    finally{setChatLoad(false);}
  };

  /* PIN overlay */
  if(!ready) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      height:"100dvh",background:T.bg,gap:16,fontFamily:"'Outfit',sans-serif"}}>
      <div style={{fontSize:44}}>💰</div>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,
        background:`linear-gradient(135deg,${T.txt} 40%,${T.gold})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>My Wallet</p>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.gold,
            animation:"pulse 1.2s ease infinite",animationDelay:`${i*0.2}s`}}/>
        ))}
      </div>
      <p style={{fontSize:12,color:T.muted,marginTop:4}}>Loading your data…</p>
    </div>
  );

  if((pinLocked||showPinSetup)&&(pinMode==="unlock"||pinMode==="setup1"||pinMode==="setup2")){
    return <PinScreen mode={pinMode} pin={pinInput} onDigit={handlePinDigit}
      onBack={()=>setPinInput(p=>p.slice(0,-1))} error={pinError} lang={lang}/>;
  }

  const Nav=({v,icon,label})=>(
    <button onClick={()=>setView(v)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,
      background:"none",border:"none",cursor:"pointer",padding:"6px 12px",
      color:view===v?T.gold:T.muted,fontFamily:"'Outfit',sans-serif",fontSize:10,fontWeight:600,
      letterSpacing:"0.04em",textTransform:"uppercase",transition:"color .2s"}}>
      <span style={{fontSize:19,filter:view===v?`drop-shadow(0 0 6px ${T.gold})`:"none",transition:"filter .2s"}}>{icon}</span>
      {label}
    </button>
  );

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:T.bg,color:T.txt,
      maxWidth:430,margin:"0 auto",minHeight:"100dvh",paddingBottom:76,position:"relative"}}>

      {/* ambient glow */}
      <div style={{position:"fixed",top:-80,left:"50%",transform:"translateX(-50%)",
        width:260,height:260,borderRadius:"50%",pointerEvents:"none",zIndex:0,
        background:"radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 70%)"}}/>

      {/* ── HEADER ── */}
      <div style={{padding:"18px 18px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:1,position:"relative"}}>
        <div>
          <p style={{fontSize:11,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase",fontWeight:500}}>May 2026</p>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:23,fontWeight:700,marginTop:1,
            background:`linear-gradient(135deg,${T.txt} 40%,${T.gold})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t("app")}</h1>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* lang toggle */}
          <button onClick={()=>setLang(l=>l==="en"?"si":"en")} style={{fontSize:11,color:T.gold,background:T.gold+"18",
            border:`1px solid ${T.gold}44`,borderRadius:99,padding:"4px 10px",cursor:"pointer",
            fontFamily:"'Outfit',sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>{t("langBtn")}</button>
          {/* PIN lock toggle */}
          <button onClick={()=>{
            if(!pinEnabled){setPinMode("setup1");setPinInput("");setPinTemp("");setPinError("");setShowPinSetup(true);}
            else if(!pinLocked){setPinLocked(true);setPinMode("unlock");setPinInput("");setPinError("");}
          }} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",color:T.muted}}>
            {pinEnabled?pinLocked?"🔓":"🔒":"🔓"}
          </button>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500,marginBottom:1}}>{t("savRate")}</p>
            <p style={{fontSize:18,fontWeight:700,color:savRate>0?T.green:T.red}}>{savRate}%</p>
          </div>
        </div>
      </div>

      {/* overspending alert */}
      {alerts.length>0&&(
        <div style={{margin:"0 16px 10px",padding:"10px 14px",borderRadius:14,
          background:alerts.some(a=>a.over)?"rgba(240,91,91,0.1)":"rgba(239,168,39,0.1)",
          border:`1px solid ${alerts.some(a=>a.over)?T.red+"44":T.amber+"44"}`,display:"flex",gap:10}}>
          <span style={{fontSize:16}}>🔔</span>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:alerts.some(a=>a.over)?T.red:T.amber}}>
              {alerts.some(a=>a.over)?"Budget Exceeded!":"Nearing Limit"}</p>
            <p style={{fontSize:11,color:T.muted,marginTop:1}}>{alerts.map(a=>`${a.cat} (${pct(a.spent,a.limit)}%)`).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* ══════ HOME ══════ */}
      {view==="home"&&(
        <div style={{padding:"0 16px",zIndex:1,position:"relative",animation:"fadeUp .4s ease"}}>

          {/* Balance hero */}
          <div style={{borderRadius:22,padding:"22px 22px 20px",marginBottom:12,position:"relative",overflow:"hidden",
            background:"linear-gradient(135deg,#1A1408 0%,#0F1117 50%,#0D1420 100%)",
            border:`1px solid rgba(201,168,76,0.22)`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",
              border:"44px solid rgba(201,168,76,0.04)",pointerEvents:"none"}}/>
            <p style={{fontSize:11,color:T.gold,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{t("balance")}</p>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:T.txt,letterSpacing:"-1px",marginBottom:16}}>{rs(balance)}</p>
            <div style={{display:"flex"}}>
              {[[`↑ ${t("income")}`,rs(income),T.green],[`↓ ${t("expense")}`,rs(expense),T.red]].map(([l,v,col])=>(
                <div key={l} style={{flex:1}}>
                  <p style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500,marginBottom:2}}>{l}</p>
                  <p style={{fontSize:15,fontWeight:700,color:col}}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── WIDGETS ── */}
          <div style={{display:"flex",gap:10,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
            {[
              {label:t("today"),   value:rs(todaySpend),   sub:t("spent"), color:T.red,    icon:"📅"},
              {label:t("week"),    value:rs(weekSpend),    sub:t("spent"), color:T.amber,  icon:"📆"},
              {label:t("savRate"), value:savRate+"%",      sub:t("saved"), color:T.green,  icon:"💹"},
              {label:t("netWorth"),value:rs(netWorth),     sub:t("netIncome"),color:T.gold,icon:"📊"},
            ].map(w=>(
              <div key={w.label} className="wc" style={{flex:"0 0 120px",borderRadius:16,padding:"14px 12px",
                background:T.card,border:`1px solid ${w.color}33`,
                boxShadow:`0 4px 16px ${w.color}12`}}>
                <span style={{fontSize:20,display:"block",marginBottom:6}}>{w.icon}</span>
                <p style={{fontSize:10,color:T.muted,fontWeight:500,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{w.label}</p>
                <p style={{fontSize:15,fontWeight:700,color:w.color,letterSpacing:"-0.3px"}}>{w.value}</p>
                <p style={{fontSize:10,color:T.muted,marginTop:1}}>{w.sub}</p>
              </div>
            ))}
          </div>

          {/* Wallets */}
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:8,padding:"0 2px"}}>{t("wallets")}</p>
          <div style={{display:"flex",gap:10,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
            {wallets.map(w=>{
              const bal=walletBal[w.id]||0;
              return(
                <div key={w.id} className="wc" style={{flex:"0 0 128px",borderRadius:16,padding:"14px",
                  background:`linear-gradient(135deg,${w.color}15,${T.card})`,
                  border:`1px solid ${w.color}33`}}>
                  <div style={{fontSize:22,marginBottom:8}}>{w.icon}</div>
                  <p style={{fontSize:11,color:T.muted,fontWeight:500,marginBottom:2}}>{w.name}</p>
                  <p style={{fontSize:14,fontWeight:700,color:bal>=0?T.txt:T.red}}>{rs(bal)}</p>
                </div>
              );
            })}
          </div>

          {/* Spending breakdown */}
          {pieData.length>0&&(
            <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px",marginBottom:12}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:12}}>Spending Breakdown</p>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:106,height:106,flexShrink:0}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={30} strokeWidth={0}>
                        {pieData.map(e=><Cell key={e.name} fill={(CATS[e.name]||CATS.Other).color}/>)}
                      </Pie>
                      <Tooltip formatter={v=>rs(v)} contentStyle={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:10,color:T.txt,fontSize:12}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  {pieData.slice(0,5).map(e=>{
                    const col=(CATS[e.name]||CATS.Other).color;const p=pct(e.value,expense);
                    return(
                      <div key={e.name}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>
                            <span style={{width:6,height:6,borderRadius:2,background:col,display:"inline-block"}}/>{e.name}
                          </span>
                          <span style={{fontSize:11,fontWeight:700,color:T.txt}}>{p}%</span>
                        </div>
                        <div style={{height:3,background:T.faint,borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${p}%`,background:col,borderRadius:99,transition:"width .6s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming recurring */}
          <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px",marginBottom:12}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:10}}>🔁 {t("recurring")}</p>
            {recList.map(r=>{
              const c=CATS[r.cat]||CATS.Other;
              return(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:34,height:34,borderRadius:10,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1}}><p style={{fontSize:12,fontWeight:500}}>{r.label}</p><p style={{fontSize:10,color:T.muted}}>{r.next} · {r.freq}</p></div>
                  <p style={{fontSize:13,fontWeight:700,color:r.type==="income"?T.green:T.red}}>{r.type==="income"?"+":"-"}{rs(r.amount)}</p>
                </div>
              );
            })}
          </div>

          {/* Recent */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"0 2px"}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700}}>{t("recent")}</p>
            <button onClick={()=>setView("txns")} style={{fontSize:11,color:T.gold,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{t("viewAll")}</button>
          </div>
          <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"4px 6px"}}>
            {[...txns].reverse().slice(0,4).map(x=><TxnRow key={x.id} t={x} wallets={wallets}/>)}
          </div>
        </div>
      )}

      {/* ══════ TRANSACTIONS ══════ */}
      {view==="txns"&&(
        <div style={{padding:"0 16px",zIndex:1,position:"relative",animation:"fadeUp .35s ease"}}>
          {/* Smart search */}
          <div style={{position:"relative",marginBottom:10}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:T.muted,pointerEvents:"none"}}>🔍</span>
            <input placeholder={t("search")} value={searchQ}
              onChange={e=>setSearchQ(e.target.value)}
              style={{paddingLeft:38,borderRadius:14}}/>
            {searchQ&&<button onClick={()=>setSearchQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.muted,fontSize:16,cursor:"pointer"}}>×</button>}
          </div>

          {/* Category filter */}
          <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",paddingBottom:6,marginBottom:6}}>
            {["All",...Object.keys(CATS)].map(c=>{
              const active=filterCat===c;const col=(CATS[c]||{color:T.gold}).color;
              return <button key={c} onClick={()=>setFilterCat(c)} style={{flexShrink:0,fontSize:11,padding:"4px 11px",borderRadius:99,whiteSpace:"nowrap",
                border:`1px solid ${active?col:T.border}`,background:active?col+"22":"transparent",color:active?col:T.muted,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,transition:"all .15s"}}>
                {CATS[c]?CATS[c].icon+" ":""}{c}</button>;
            })}
          </div>

          {/* Tag filter */}
          {allTags.length>1&&(
            <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",paddingBottom:10,marginBottom:10,alignItems:"center"}}>
              <span style={{fontSize:10,color:T.muted,flexShrink:0,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{t("filterTag")}</span>
              {allTags.map(tg=>{
                const active=filterTag===tg;
                return <button key={tg} onClick={()=>setFilterTag(tg)} className="tag-chip"
                  style={{flexShrink:0,fontSize:11,padding:"3px 10px",borderRadius:99,whiteSpace:"nowrap",
                    border:`1px solid ${active?T.teal:T.border}`,background:active?T.teal+"22":"transparent",
                    color:active?T.teal:T.muted,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,transition:"all .15s"}}>
                  {tg==="All"?t("allTags"):"#"+tg}</button>;
              })}
            </div>
          )}

          <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"4px 6px"}}>
            {filtered.length===0&&<p style={{textAlign:"center",color:T.muted,fontSize:13,padding:"32px 0"}}>{t("noTxn")}</p>}
            {filtered.map(x=><TxnRow key={x.id} t={x} wallets={wallets} anim
              onDel={()=>setTxns(p=>p.filter(z=>z.id!==x.id))}/>)}
          </div>
        </div>
      )}

      {/* ══════ GOALS (sub-tabbed) ══════ */}
      {view==="goals"&&(
        <div style={{padding:"0 16px",zIndex:1,position:"relative",animation:"fadeUp .35s ease"}}>

          {/* Sub-tab pills */}
          <div style={{display:"flex",gap:8,marginBottom:18,background:T.card,borderRadius:14,padding:5,border:`1px solid ${T.border}`}}>
            {[["savings","🎯","Savings"],["budget","💰","Budget"],["worth","📊","Net Worth"]].map(([tab,ic,lb])=>(
              <button key={tab} onClick={()=>setGoalTab(tab)}
                style={{flex:1,padding:"9px 4px",borderRadius:10,border:"none",cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,transition:"all .2s",
                  background:goalTab===tab?`linear-gradient(135deg,${T.gold},#E8C56A)`:T.raised,
                  color:goalTab===tab?"#000":T.muted,
                  boxShadow:goalTab===tab?`0 4px 14px ${T.gold}33`:""}}>{ic} {lb}</button>
            ))}
          </div>

          {/* ── SAVINGS GOALS ── */}
          {goalTab==="savings"&&(
            <div style={{animation:"fadeUp .3s ease"}}>
              {/* Summary bar */}
              <div style={{borderRadius:18,padding:"18px",marginBottom:16,
                background:"linear-gradient(135deg,#0D1A12,#0F1117)",border:`1px solid ${T.green}33`}}>
                <p style={{fontSize:11,color:T.green,textTransform:"uppercase",letterSpacing:"0.09em",fontWeight:600,marginBottom:8}}>Savings Progress</p>
                <div style={{display:"flex",gap:0}}>
                  {[
                    ["Total Saved",  rs(goals.reduce((s,g)=>s+g.current,0)), T.green],
                    ["Total Target", rs(goals.reduce((s,g)=>s+g.target,0)),  T.gold],
                    ["Overall",      pct(goals.reduce((s,g)=>s+g.current,0),goals.reduce((s,g)=>s+g.target,0))+"%", T.txt],
                  ].map(([l,v,col])=>(
                    <div key={l} style={{flex:1}}>
                      <p style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500,marginBottom:3}}>{l}</p>
                      <p style={{fontSize:14,fontWeight:700,color:col}}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal cards */}
              {goals.map(g=>{
                const p=pct(g.current,g.target);
                const rem=g.target-g.current;
                const daysLeft=Math.max(0,Math.ceil((new Date(g.deadline)-new Date())/(1000*60*60*24)));
                const monthlyNeed=daysLeft>0?Math.ceil(rem/(daysLeft/30)):0;
                return(
                  <div key={g.id} style={{background:T.card,borderRadius:20,border:`1px solid ${g.color}33`,
                    padding:"18px",marginBottom:12,boxShadow:`0 4px 24px ${g.color}10`}}>
                    {/* Header row */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:44,height:44,borderRadius:14,background:g.color+"22",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{g.icon}</div>
                        <div>
                          <p style={{fontSize:15,fontWeight:700,marginBottom:2}}>{g.name}</p>
                          <p style={{fontSize:11,color:T.muted}}>Due {g.deadline} · {daysLeft}d left</p>
                        </div>
                      </div>
                      <button onClick={()=>setGoals(gs=>gs.filter(x=>x.id!==g.id))}
                        style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}
                        onMouseEnter={e=>e.target.style.color=T.red}
                        onMouseLeave={e=>e.target.style.color=T.muted}>×</button>
                    </div>

                    {/* Progress ring + stats */}
                    <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
                      <ProgressRing p={p} size={72} stroke={6} color={g.color}/>
                      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[
                          ["Saved",  rs(g.current),  g.color],
                          ["Target", rs(g.target),   T.muted],
                          ["Remaining", rs(rem),      T.amber],
                          ["Need/mo",   monthlyNeed>0?rs(monthlyNeed):"✅ Done!", monthlyNeed>0?T.txt:T.green],
                        ].map(([l,v,col])=>(
                          <div key={l} style={{background:T.raised,borderRadius:10,padding:"8px 10px"}}>
                            <p style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:3}}>{l}</p>
                            <p style={{fontSize:13,fontWeight:700,color:col}}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gradient progress bar */}
                    <div style={{height:8,background:T.faint,borderRadius:99,overflow:"hidden",marginBottom:12}}>
                      <div style={{height:"100%",width:`${p}%`,borderRadius:99,transition:"width .8s ease",
                        background:`linear-gradient(90deg,${g.color}99,${g.color})`}}/>
                    </div>

                    {/* Add money row */}
                    <div style={{display:"flex",gap:6}}>
                      <input type="number" placeholder="Add Rs. to this goal"
                        value={goalAddAmt[g.id]||""}
                        onChange={e=>setGoalAddAmt(d=>({...d,[g.id]:e.target.value}))}
                        style={{flex:1,padding:"9px 12px",fontSize:13,borderRadius:12}}/>
                      <button onClick={()=>{
                        const a=parseFloat(goalAddAmt[g.id]);if(!a||a<=0)return;
                        setGoals(gs=>gs.map(x=>x.id===g.id?{...x,current:Math.min(x.current+a,x.target)}:x));
                        setGoalAddAmt(d=>({...d,[g.id]:""}));
                      }} style={{padding:"9px 18px",borderRadius:12,border:"none",
                        background:`linear-gradient(135deg,${g.color},${g.color}bb)`,
                        color:"#000",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",
                        boxShadow:`0 4px 14px ${g.color}44`}}>+ Add</button>
                    </div>

                    {/* Quick add chips */}
                    <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                      {[1000,5000,10000,25000].map(q=>(
                        <button key={q} onClick={()=>{
                          setGoals(gs=>gs.map(x=>x.id===g.id?{...x,current:Math.min(x.current+q,x.target)}:x));
                        }} style={{padding:"4px 10px",borderRadius:99,border:`1px solid ${g.color}44`,
                          background:g.color+"12",color:g.color,fontSize:11,fontWeight:600,cursor:"pointer",
                          fontFamily:"'Outfit',sans-serif",transition:"all .15s"}}>+{q>=1000?q/1000+"k":q}</button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add new goal form */}
              <div style={{background:T.card,borderRadius:20,border:`1px solid ${T.border}`,padding:"16px",marginTop:4}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:12}}>+ New Savings Goal</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <input placeholder="Goal name (e.g. Car)" value={newGoalForm?.name||""}
                    onChange={e=>setNewGoalForm(f=>({...f||{},name:e.target.value}))}
                    style={{fontSize:13,padding:"9px 12px",borderRadius:12}}/>
                  <input placeholder="Icon (emoji)" value={newGoalForm?.icon||""}
                    onChange={e=>setNewGoalForm(f=>({...f||{},icon:e.target.value}))}
                    style={{fontSize:13,padding:"9px 12px",borderRadius:12}}/>
                  <input type="number" placeholder="Target Rs."
                    value={newGoalForm?.target||""}
                    onChange={e=>setNewGoalForm(f=>({...f||{},target:e.target.value}))}
                    style={{fontSize:13,padding:"9px 12px",borderRadius:12}}/>
                  <input type="date" value={newGoalForm?.deadline||""}
                    onChange={e=>setNewGoalForm(f=>({...f||{},deadline:e.target.value}))}
                    style={{fontSize:13,padding:"9px 12px",borderRadius:12}}/>
                </div>
                {/* color picker */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  {[T.green,T.blue,T.gold,T.purple,T.pink,T.amber,T.teal,T.red].map(col=>(
                    <button key={col} onClick={()=>setNewGoalForm(f=>({...f||{},color:col}))}
                      style={{width:26,height:26,borderRadius:"50%",border:`2.5px solid ${newGoalForm?.color===col?"#fff":"transparent"}`,
                        background:col,cursor:"pointer",transition:"border .15s",flexShrink:0}}/>
                  ))}
                </div>
                <button onClick={()=>{
                  if(!newGoalForm?.name||!newGoalForm?.target)return;
                  setGoals(p=>[...p,{
                    id:Date.now(),name:newGoalForm.name,icon:newGoalForm.icon||"🎯",
                    target:parseFloat(newGoalForm.target),current:0,
                    color:newGoalForm.color||T.gold,deadline:newGoalForm.deadline||"2026-12-31"
                  }]);
                  setNewGoalForm(null);
                }} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
                  background:`linear-gradient(135deg,${T.gold},#E8C56A)`,color:"#000",
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  Create Goal 🎯
                </button>
              </div>
            </div>
          )}

          {/* ── BUDGET GOALS ── */}
          {goalTab==="budget"&&(
            <div style={{animation:"fadeUp .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>💰 {t("budget")}</p>
                <button onClick={()=>{
                  if(editBud){setBudgets(p=>p.map(b=>({...b,limit:parseFloat(budDraft[b.cat])||b.limit})));setEditBud(false);}
                  else{const d={};budgets.forEach(b=>d[b.cat]=b.limit);setBudDraft(d);setEditBud(true);}
                }} style={{fontSize:11,color:T.gold,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700}}>
                  {editBud?"SAVE ✓":"EDIT →"}
                </button>
              </div>
              <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px"}}>
                {budgets.map(b=>{
                  const spent=catSpend[b.cat]||0;const p=pct(spent,b.limit);
                  const col=p>=100?T.red:p>=80?T.amber:T.green;const c=CATS[b.cat]||CATS.Other;
                  return(
                    <div key={b.cat} style={{marginBottom:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                          {c.icon} {b.cat}
                          {p>=100&&<span style={{fontSize:10,color:T.red,fontWeight:700,background:T.red+"18",padding:"1px 6px",borderRadius:99}}>OVER</span>}
                          {p>=80&&p<100&&<span style={{fontSize:10,color:T.amber,fontWeight:700,background:T.amber+"18",padding:"1px 6px",borderRadius:99}}>NEAR</span>}
                        </span>
                        {editBud
                          ? <input type="number" value={budDraft[b.cat]||""} onChange={e=>setBudDraft(d=>({...d,[b.cat]:e.target.value}))} style={{width:90,padding:"4px 8px",fontSize:12,borderRadius:8}}/>
                          : <span style={{fontSize:12,color:col,fontWeight:600}}>{rs(spent)} / {rs(b.limit)}</span>}
                      </div>
                      <div style={{height:6,background:T.faint,borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,background:col,borderRadius:99,transition:"width .6s"}}/>
                      </div>
                      <p style={{fontSize:10,color:T.muted,marginTop:3}}>{p}% used · {rs(Math.max(0,b.limit-spent))} remaining</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NET WORTH ── */}
          {goalTab==="worth"&&(
            <div style={{animation:"fadeUp .3s ease"}}>
              <div style={{borderRadius:20,padding:"20px",marginBottom:14,
                background:`linear-gradient(135deg,${netWorth>=0?"#0D1A12":"#1A0D0D"},${T.card})`,
                border:`1px solid ${netWorth>=0?T.green+"33":T.red+"33"}`}}>
                <p style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:500,marginBottom:8}}>{t("netWorth")}</p>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:netWorth>=0?T.green:T.red,letterSpacing:"-1px",marginBottom:16}}>{rs(netWorth)}</p>
                <div style={{display:"flex"}}>
                  {[[t("totalAssets"),rs(totalAssets),T.green],[t("totalDebts"),rs(totalDebts),T.red]].map(([l,v,col])=>(
                    <div key={l} style={{flex:1}}>
                      <p style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500,marginBottom:2}}>{l}</p>
                      <p style={{fontSize:15,fontWeight:700,color:col}}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:8}}>✅ {t("assets")}</p>
              <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"10px 12px",marginBottom:10}}>
                {assets.map(a=>(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
                    <p style={{flex:1,fontSize:13,fontWeight:500}}>{a.name}</p>
                    <p style={{fontSize:14,fontWeight:700,color:T.green}}>{rs(a.value)}</p>
                    <button onClick={()=>setAssets(p=>p.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}
                      onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.muted}>×</button>
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginTop:10}}>
                  <input placeholder={t("namePh")} value={assetForm.name} onChange={e=>setAssetForm(f=>({...f,name:e.target.value}))} style={{fontSize:12,padding:"8px 10px",borderRadius:10}}/>
                  <input type="number" placeholder={t("valuePh")} value={assetForm.value} onChange={e=>setAssetForm(f=>({...f,value:e.target.value}))} style={{fontSize:12,padding:"8px 10px",borderRadius:10}}/>
                  <button onClick={()=>{
                    if(!assetForm.name||!assetForm.value)return;
                    setAssets(p=>[...p,{id:nextAid,name:assetForm.name,icon:"💚",value:parseFloat(assetForm.value),type:"savings"}]);
                    setNextAid(n=>n+1);setAssetForm({name:"",value:"",icon:"🏦",type:"savings"});
                  }} style={{padding:"8px 10px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${T.green},#1AA877)`,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer"}}>Add</button>
                </div>
              </div>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:8}}>❌ {t("debts")}</p>
              <div style={{background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"10px 12px"}}>
                {debts.map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:22,flexShrink:0}}>{d.icon}</span>
                    <p style={{flex:1,fontSize:13,fontWeight:500}}>{d.name}</p>
                    <p style={{fontSize:14,fontWeight:700,color:T.red}}>{rs(d.value)}</p>
                    <button onClick={()=>setDebts(p=>p.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}
                      onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.muted}>×</button>
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginTop:10}}>
                  <input placeholder={t("namePh")} value={debtForm.name} onChange={e=>setDebtForm(f=>({...f,name:e.target.value}))} style={{fontSize:12,padding:"8px 10px",borderRadius:10}}/>
                  <input type="number" placeholder={t("valuePh")} value={debtForm.value} onChange={e=>setDebtForm(f=>({...f,value:e.target.value}))} style={{fontSize:12,padding:"8px 10px",borderRadius:10}}/>
                  <button onClick={()=>{
                    if(!debtForm.name||!debtForm.value)return;
                    setDebts(p=>[...p,{id:nextDid,name:debtForm.name,icon:"❤️",value:parseFloat(debtForm.value),type:"loan"}]);
                    setNextDid(n=>n+1);setDebtForm({name:"",value:"",icon:"🏦",type:"loan"});
                  }} style={{padding:"8px 10px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${T.red},#C04040)`,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ AI ══════ */}
      {view==="ai"&&(
        <div style={{zIndex:1,position:"relative",animation:"fadeUp .35s ease"}}>
          {/* Currency converter */}
          <div style={{margin:"0 16px 12px",background:T.card,borderRadius:18,border:`1px solid ${T.border}`,padding:"14px"}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,marginBottom:12}}>💱 {t("currency")}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"end"}}>
              <div>
                <Lbl t={t("from")}/>
                <select value={cvtFrom} onChange={e=>setCvtFrom(e.target.value)} style={{marginBottom:6}}>
                  <option value="LKR">🇱🇰 LKR</option>
                  {Object.keys(FX).map(k=><option key={k} value={k}>{k}</option>)}
                </select>
                <input type="number" placeholder="Amount" value={cvtAmt} onChange={e=>setCvtAmt(e.target.value)} style={{fontSize:14}}/>
              </div>
              <div style={{fontSize:20,color:T.gold,marginBottom:10,textAlign:"center"}}>⇄</div>
              <div>
                <Lbl t={t("to")}/>
                <select value={cvtTo} onChange={e=>setCvtTo(e.target.value)} style={{marginBottom:6}}>
                  <option value="LKR">🇱🇰 LKR</option>
                  {Object.keys(FX).map(k=><option key={k} value={k}>{k}</option>)}
                </select>
                <div style={{background:T.raised,borderRadius:12,padding:"12px 14px",fontSize:15,fontWeight:700,color:T.gold,border:`1px solid ${T.border2}`}}>
                  {cvtAmt?cvtResult.toLocaleString("en-IN",{maximumFractionDigits:4}):"—"}
                </div>
              </div>
            </div>
            {cvtAmt&&<p style={{fontSize:10,color:T.muted,marginTop:8,textAlign:"center"}}>Indicative rates · May 2026</p>}
          </div>

          {/* Chat */}
          <div style={{display:"flex",flexDirection:"column",height:"calc(100dvh - 290px)"}}>
            <div style={{padding:"0 16px 8px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${T.gold},#E8C56A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✨</div>
              <div>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>{t("aiName")}</p>
                <p style={{fontSize:11,color:T.green,fontWeight:500}}>● {t("online")}</p>
              </div>
            </div>
            {chat.length===0&&(
              <div style={{padding:"0 16px 10px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {["📊 Analyze my spending","💡 How to reduce expenses?","🎯 Check my budget status","💰 Tips to grow savings"].map(q=>(
                    <button key={q} onClick={()=>setChatInput(q.slice(3))} style={{textAlign:"left",padding:"9px 13px",border:`1px solid ${T.border}`,borderRadius:12,background:T.card,color:T.txt,fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .15s"}}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{flex:1,overflowY:"auto",padding:"0 16px 8px",display:"flex",flexDirection:"column",gap:8}}>
              {chat.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp .3s ease"}}>
                  {m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${T.gold},#E8C56A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginRight:7,alignSelf:"flex-end"}}>✨</div>}
                  <div style={{maxWidth:"78%",padding:"10px 13px",
                    borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                    background:m.role==="user"?`linear-gradient(135deg,${T.gold},#E8C56A)`:T.card,
                    color:m.role==="user"?"#000":T.txt,fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",
                    fontWeight:m.role==="user"?600:400,border:m.role==="assistant"?`1px solid ${T.border}`:"none"}}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoad&&<div style={{display:"flex",alignItems:"flex-end",gap:7}}>
                <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${T.gold},#E8C56A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✨</div>
                <div style={{padding:"10px 14px",borderRadius:"18px 18px 18px 4px",background:T.card,border:`1px solid ${T.border}`,display:"flex",gap:4}}>
                  {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.gold,animation:"pulse 1.2s ease infinite",animationDelay:`${i*0.2}s`}}/>)}
                </div>
              </div>}
              <div ref={chatEnd}/>
            </div>
            <div style={{padding:"8px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,background:T.bg}}>
              <input placeholder={`${t("aiName")}…`} value={chatInput}
                onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}/>
              <button onClick={sendChat} disabled={chatLoad||!chatInput.trim()} style={{width:42,height:42,borderRadius:12,flexShrink:0,border:"none",cursor:"pointer",
                background:chatLoad||!chatInput.trim()?T.raised:`linear-gradient(135deg,${T.gold},#E8C56A)`,
                color:chatLoad||!chatInput.trim()?T.muted:"#000",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>→</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ ADD MODAL ══════ */}
      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={()=>setModal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)"}}/>
          <div style={{position:"relative",background:T.card,borderRadius:"24px 24px 0 0",border:`1px solid ${T.border2}`,animation:"slideUp .3s ease",maxHeight:"92dvh",overflowY:"auto"}}>
            <div style={{textAlign:"center",padding:"12px 0 0"}}>
              <div style={{width:36,height:4,borderRadius:99,background:T.border2,display:"inline-block"}}/>
            </div>
            <div style={{padding:"10px 16px 0"}}>
              {/* type */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[["expense","💸","Expense",T.red],["income","💰","Income",T.green],["transfer","🔄","Transfer",T.blue]].map(([tp,ic,lb,col])=>(
                  <button key={tp} onClick={()=>{setMType(tp);setMCat(tp==="income"?"Income":"Food");}}
                    style={{padding:"9px 0",borderRadius:12,border:`1.5px solid ${mType===tp?col:T.border}`,
                      background:mType===tp?col+"18":T.raised,color:mType===tp?col:T.muted,
                      fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s"}}>
                    {ic} {lb}
                  </button>
                ))}
              </div>

              {mStep==="amount"&&(
                <div>
                  <div style={{textAlign:"center",padding:"8px 0 14px"}}>
                    <p style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,
                      color:mAmt?T.txt:T.muted,letterSpacing:"-1px"}}>
                      {mAmt?`Rs. ${parseFloat(mAmt).toLocaleString("en-IN")}`:"Rs. 0"}</p>
                  </div>
                  {/* quick amounts */}
                  <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:10,marginBottom:12}}>
                    {QUICK.map(q=>(
                      <button key={q} className="qa" onClick={()=>setMAmt(String(q))}
                        style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontSize:12,
                          border:`1px solid ${T.border2}`,background:T.raised,color:T.muted,
                          cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600,transition:"all .15s"}}>
                        {q>=1000?q/1000+"k":q}
                      </button>
                    ))}
                  </div>
                  {/* numpad */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(k=>(
                      <button key={k} className="nk" onClick={()=>numPress(k)}
                        style={{padding:"15px",borderRadius:14,border:"none",background:k==="⌫"?T.raised:T.hi,
                          color:k==="⌫"?T.red:T.txt,fontSize:20,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                        {k}
                      </button>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{const f=e.target.files?.[0];if(f)scanReceipt(f);e.target.value="";}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                    <button onClick={()=>fileRef.current?.click()} disabled={scanLoad}
                      style={{padding:"12px",borderRadius:14,border:`1px solid ${T.border2}`,background:T.raised,
                        color:scanLoad?T.muted:T.txt,fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      {scanLoad?<span style={{width:14,height:14,border:`2px solid ${T.gold}`,borderTop:"2px solid transparent",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/>:"📸"}
                      {scanLoad?"Scanning…":t("scan")}
                    </button>
                    <button onClick={()=>{if(parseFloat(mAmt)>0)setMStep("details");}}
                      disabled={!parseFloat(mAmt)}
                      style={{padding:"12px",borderRadius:14,border:"none",
                        background:parseFloat(mAmt)?`linear-gradient(135deg,${T.gold},#E8C56A)`:T.raised,
                        color:parseFloat(mAmt)?"#000":T.muted,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"}}>
                      {t("next")}
                    </button>
                  </div>
                </div>
              )}

              {mStep==="details"&&(
                <div>
                  <button onClick={()=>setMStep("amount")} style={{fontSize:12,color:T.muted,background:"none",border:"none",cursor:"pointer",marginBottom:12,fontFamily:"'Outfit',sans-serif"}}>← {rs(parseFloat(mAmt)||0)}</button>
                  {/* category grid */}
                  <Lbl t={t("cat")}/>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                    {Object.entries(CATS)
                      .filter(([k])=>mType==="income"?k==="Income":k!=="Income")
                      .map(([k,v])=>(
                        <button key={k} className="cb" onClick={()=>setMCat(k)}
                          style={{padding:"10px 4px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${mCat===k?v.color:T.border}`,background:mCat===k?v.color+"22":T.raised,textAlign:"center"}}>
                          <div style={{fontSize:20,marginBottom:3}}>{v.icon}</div>
                          <p style={{fontSize:9,color:mCat===k?v.color:T.muted,fontWeight:600,lineHeight:1}}>{k}</p>
                        </button>
                    ))}
                  </div>
                  {/* wallet */}
                  <Lbl t={t("wlt")}/>
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    {wallets.map(w=>(
                      <button key={w.id} onClick={()=>setMWallet(w.id)}
                        style={{flex:1,padding:"9px 4px",borderRadius:12,border:`1.5px solid ${mWallet===w.id?w.color:T.border}`,background:mWallet===w.id?w.color+"18":T.raised,cursor:"pointer",textAlign:"center"}}>
                        <div style={{fontSize:18}}>{w.icon}</div>
                        <p style={{fontSize:10,color:mWallet===w.id?w.color:T.muted,fontWeight:600,marginTop:2}}>{w.name}</p>
                      </button>
                    ))}
                  </div>
                  {/* desc + AI */}
                  <Lbl t={t("desc")}/>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <input placeholder="e.g. Keells groceries…" value={mLabel} onChange={e=>setMLabel(e.target.value)} style={{flex:1}}/>
                    <button onClick={autoCategory} disabled={autoLoad||!mLabel.trim()} style={{padding:"0 12px",borderRadius:12,border:"none",flexShrink:0,
                      background:autoLoad?T.raised:`linear-gradient(135deg,${T.gold},#E8C56A)`,color:autoLoad?T.muted:"#000",
                      cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:11,opacity:!mLabel.trim()?0.4:1,transition:"all .2s"}}>
                      {autoLoad?"…":"✨ AI"}
                    </button>
                  </div>
                  {/* tags */}
                  <Lbl t={t("tags")}/>
                  <input placeholder={t("tagsHint")} value={mTagInput}
                    onChange={e=>setMTagInput(e.target.value)} style={{marginBottom:6}}/>
                  {mTagInput&&(
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
                      {mTagInput.split(",").map(tg=>tg.trim()).filter(Boolean).map(tg=>(
                        <span key={tg} style={{fontSize:11,color:T.teal,background:T.teal+"18",padding:"2px 8px",borderRadius:99}}>#{tg}</span>
                      ))}
                    </div>
                  )}
                  {/* date */}
                  <Lbl t={t("date")}/>
                  <input type="date" value={mDate} onChange={e=>setMDate(e.target.value)} style={{marginBottom:12}}/>
                  {/* recurring */}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:mRec?10:12,background:T.raised,borderRadius:12,padding:"11px 13px"}}>
                    <span style={{fontSize:15}}>🔁</span>
                    <span style={{flex:1,fontSize:13,fontWeight:500}}>Recurring</span>
                    <button onClick={()=>setMRec(r=>!r)} style={{width:42,height:24,borderRadius:99,border:"none",background:mRec?T.green:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:mRec?21:3,transition:"left .2s"}}/>
                    </button>
                  </div>
                  {mRec&&<div style={{display:"flex",gap:6,marginBottom:12}}>
                    {["daily","weekly","monthly","yearly"].map(f=>(
                      <button key={f} onClick={()=>setMFreq(f)} style={{flex:1,padding:"7px 4px",borderRadius:10,
                        border:`1px solid ${mFreq===f?T.gold:T.border}`,background:mFreq===f?"rgba(201,168,76,0.12)":T.raised,
                        color:mFreq===f?T.gold:T.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"capitalize",transition:"all .15s"}}>
                        {f}
                      </button>
                    ))}
                  </div>}
                  {/* notes */}
                  <Lbl t={t("notes")}/>
                  <textarea rows={2} placeholder="Any notes…" value={mNotes} onChange={e=>setMNotes(e.target.value)} style={{marginBottom:16}}/>
                  {/* save */}
                  <button onClick={handleSave} disabled={!mLabel.trim()||!parseFloat(mAmt)}
                    style={{width:"100%",padding:"14px",borderRadius:14,border:"none",
                      background:!mLabel.trim()||!parseFloat(mAmt)?T.raised
                        :mType==="income"?`linear-gradient(135deg,${T.green},#1AA877)`
                        :mType==="transfer"?`linear-gradient(135deg,${T.blue},#3A6CC8)`
                        :`linear-gradient(135deg,${T.gold},#E8C56A)`,
                      color:!mLabel.trim()||!parseFloat(mAmt)?T.muted:"#000",
                      cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,
                      transition:"all .25s",marginBottom:8}}>
                    {t("saveTxn")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:"rgba(8,10,15,0.95)",backdropFilter:"blur(20px)",
        borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",
        alignItems:"center",padding:"8px 0 14px",zIndex:100}}>
        <Nav v="home"  icon="📊" label={t("home")}/>
        <Nav v="txns"  icon="🔍" label={t("txns")}/>
        <button onClick={openModal} className="fab" style={{width:52,height:52,borderRadius:16,border:"none",
          background:`linear-gradient(135deg,${T.gold},#E8C56A)`,color:"#000",fontSize:26,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",marginTop:-18,flexShrink:0,fontWeight:700,
          boxShadow:`0 0 0 4px ${T.bg},0 8px 24px ${T.gold}55`,transition:"transform .15s"}}>+</button>
        <Nav v="goals" icon="🎯" label={t("goals")}/>
        <Nav v="ai"    icon="✨" label={t("ai")}/>
      </div>
    </div>
  );
}
