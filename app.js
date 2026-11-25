(function(){
"use strict";
var D=window.OHS,IL=D.illus||{},main=document.getElementById("main");
var topicById={};D.topics.forEach(function(t){topicById[t.id]=t});
var store={get:function(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var TOK="\\(?[A-Za-z0-9][A-Za-z0-9.'\\/&()%+\\-]*";
var LATIN=new RegExp(TOK+"(?: "+TOK+")*","g");
function el(tag,attrs,kids){var e=document.createElement(tag);
  if(attrs)for(var k in attrs){if(k==="class")e.className=attrs[k];else if(k==="text")e.textContent=attrs[k];else if(k.slice(0,2)==="on")e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}
  (kids||[]).forEach(function(c){if(c==null)return;e.appendChild(typeof c==="string"?document.createTextNode(c):c)});return e}
function cnt(s,c){return s.split(c).length-1}
function ill(id,cls){var d=el("div",{class:cls||"illus"});if(IL[id])d.innerHTML=IL[id];return d}
function icon(name,cls){var d=el("span",{class:cls||"ico-svg","aria-hidden":"true"});if(IL.icon&&IL.icon[name])d.innerHTML=IL.icon[name];return d}
function mixed(tag,str,cls){var e=el(tag,cls?{class:cls}:null);var last=0,m;LATIN.lastIndex=0;
  while((m=LATIN.exec(str))){var run=m[0],pre="",post="";
    while(run.length&&cnt(run,")")>cnt(run,"(")&&run.slice(-1)===")"){post=")"+post;run=run.slice(0,-1)}
    while(run.length&&cnt(run,"(")>cnt(run,")")&&run.charAt(0)==="("){pre+="(";run=run.slice(1)}
    if(m.index>last)e.appendChild(document.createTextNode(str.slice(last,m.index)));
    if(pre)e.appendChild(document.createTextNode(pre));
    if(/[A-Za-z(.]/.test(run))e.appendChild(el("span",{class:"en",text:run}));else if(run)e.appendChild(document.createTextNode(run));
    if(post)e.appendChild(document.createTextNode(post));
    last=m.index+m[0].length}
  if(last<str.length)e.appendChild(document.createTextNode(str.slice(last)));return e}
function norm(s){return String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي")}

/* search index */
var index=[];
D.glossary.forEach(function(g,i){index.push({g:"مصطلحات",t:g[1]+" — "+g[2],s:g[3],h:"#/glossary/t/"+i,k:norm(g.join(" "))})});
D.topics.forEach(function(t){var txt=[t.ar,t.en,t.intro,t.warn];t.sections.forEach(function(s){txt.push(s.h);txt=txt.concat(s.items)});
  index.push({g:"ملخصات",t:t.ar+" — "+t.en,s:t.intro,h:"#/topics/"+t.id,k:norm(txt.join(" "))})});
D.questions.forEach(function(q,i){index.push({g:"أسئلة مقابلات",t:q[1],s:q[2],h:"#/interview/"+q[0]+"/"+i,k:norm(q.slice(1).join(" "))})});

var qin=document.getElementById("q"),box=document.getElementById("results");
function runSearch(){var v=norm(qin.value.trim());box.textContent="";
  if(v.length<2){box.hidden=true;return}
  var words=v.split(/\s+/),hits=index.filter(function(x){return words.every(function(w){return x.k.indexOf(w)>-1})});
  box.hidden=false;
  if(!hits.length){box.appendChild(el("div",{class:"res-g",text:"مفيش نتائج. جرّب كلمة تانية."}));return}
  var by={};hits.forEach(function(h){(by[h.g]=by[h.g]||[]).push(h)});
  Object.keys(by).forEach(function(g){box.appendChild(el("div",{class:"res-g",text:g+" ("+by[g].length+")"}));
    by[g].slice(0,8).forEach(function(h){var a=el("a",{href:h.h,class:"res"});a.appendChild(mixed("span",h.t));a.appendChild(mixed("small",h.s));a.addEventListener("click",function(){box.hidden=true;qin.value=""});box.appendChild(a)})})}
qin.addEventListener("input",runSearch);
qin.addEventListener("keydown",function(e){if(e.key==="Escape"){box.hidden=true}});
document.addEventListener("click",function(e){if(!e.target.closest(".search-wrap"))box.hidden=true});

function page(nodes){main.textContent="";nodes.forEach(function(n){main.appendChild(n)});window.scrollTo(0,0)}

/* theme toggle */
var themeBtn=el("button",{id:"themeBtn",type:"button","aria-label":"تبديل الوضع الليلي","aria-pressed":"false"});
function drawTheme(){var dk=document.documentElement.getAttribute("data-theme")==="dark";themeBtn.textContent="";themeBtn.appendChild(icon(dk?"sun":"moon"));themeBtn.setAttribute("aria-pressed",String(dk))}
themeBtn.addEventListener("click",function(){var dk=document.documentElement.getAttribute("data-theme")!=="dark";document.documentElement.setAttribute("data-theme",dk?"dark":"light");store.set("theme",dk?"dark":"light");drawTheme()});
document.querySelector(".top-in").appendChild(themeBtn);drawTheme();

/* views */
function home(){
  var cards=[
   ["#/glossary","glossary","قاموس المصطلحات","أكتر من "+(Math.floor(D.glossary.length/10)*10)+" مصطلح إنجليزي بمعناه العربي، مصنف حسب الموضوع."],
   ["#/topics","topics","ملخصات الأبواب",D.topics.length+" بابًا: كهرباء، ارتفاع، سقالات، رافعات، أماكن محصورة وغيرها."],
   ["#/interview","interview","أسئلة المقابلات",D.questions.length+" سؤال مقسمة حسب الموضوع مع نموذج إجابة بالإنجليزي والعربي."],
   ["#/sources","sources","المصادر والنطاق","من أين جاءت المعلومات وحدودها."]];
  var g=el("div",{class:"grid"},cards.map(function(c){var a=el("a",{class:"card",href:c[0]},[el("div",{class:"ico ico-b"}),el("h3",{text:c[2]}),el("p",{text:c[3]})]);a.querySelector(".ico").appendChild(icon(c[1]));return a}));
  var tg=el("div",{class:"grid"},D.topics.map(function(t){return el("a",{class:"card tcard",href:"#/topics/"+t.id},[ill(t.id,"thumb"),el("h3",{text:t.ar}),mixed("p",t.en)])}));
  var hero=el("div",{class:"hero"},[el("div",{class:"hero-t"},[
    el("h1",{text:"دليل الصحة والسلامة المهنية"}),
    el("p",{class:"lead",text:"موقع تعليمي بالعربي للمصطلحات الإنجليزية، وملخصات الأبواب المهمة بالرسومات التوضيحية، وأسئلة المقابلات حسب كل موضوع. ابدأ بالبحث فوق أو اختر قسمًا."}),
    el("div",{class:"bar"},[el("a",{class:"btn glow",href:"#/topics",text:"ابدأ الملخصات"}),el("a",{class:"btn ghost",href:"#/interview",text:"تدرّب على المقابلات"})])]),
    ill("hero","hero-ill")]);
  page([hero,
    g,el("h2",{text:"الأبواب"}),tg,
    el("div",{class:"warn",text:"ملاحظة: المحتوى تعليمي عام. الأرقام المذكورة أمثلة من معايير OSHA الأمريكية، وليست مراجعة للمتطلبات السعودية أو أي دولة أخرى. تحقق من اللوائح المطبقة وإجراءات الموقع."})]);
}

function glossary(sel){
  var cat=store.get("gcat")||"all",term=null;
  if(sel!=null){term=+sel;cat="all"}
  var list=el("div"),count=el("div",{class:"count"}),local=el("input",{type:"search",id:"gf",placeholder:"فلتر داخل القاموس",style:"padding:8px 12px;border:1px solid #e1ddd3;border-radius:10px;font:inherit;min-width:200px"});
  var chips=el("div",{class:"chips"});
  function render(){list.textContent="";var f=norm(local.value.trim()),n=0;
    D.glossary.forEach(function(g,i){
      if(term!=null&&i!==term)return;
      if(cat!=="all"&&g[0]!==cat)return;
      if(f&&norm(g.join(" ")).indexOf(f)<0)return;n++;
      list.appendChild(el("div",{class:"term"},[el("div",{class:"e en",text:g[1]}),mixed("div",g[2],"a"),mixed("div",g[3],"n"),el("div",{class:"tag",text:D.categories[g[0]]})]))});
    count.textContent=n+" مصطلح";if(!n)list.appendChild(el("p",{text:"مفيش نتائج."}))}
  function drawChips(){chips.textContent="";[["all","الكل"]].concat(Object.keys(D.categories).map(function(k){return [k,D.categories[k]]})).forEach(function(c){
    chips.appendChild(el("button",{class:"chip",type:"button","aria-pressed":String(cat===c[0]),text:c[1],onclick:function(){cat=c[0];term=null;store.set("gcat",cat);drawChips();render()}}))})}
  local.addEventListener("input",function(){term=null;render()});
  drawChips();render();
  page([el("h1",{text:"قاموس المصطلحات"}),el("p",{class:"lead",text:"المصطلحات الإنجليزية الشائعة في السفتي ومعناها بالعربي. المعنى المختصر للتعلم، والتعريف الرسمي في المعيار المطبق."}),chips,el("div",{class:"bar"},[local,count]),list]);
}

function topicList(){
  page([el("h1",{text:"ملخصات الأبواب"}),el("p",{class:"lead",text:"ملخص لكل باب مهم مع رسمة توضيحية والتنبيهات والمراجع. اختر باب."}),
   el("div",{class:"grid"},D.topics.map(function(t){return el("a",{class:"card tcard",href:"#/topics/"+t.id},[ill(t.id,"thumb"),el("h3",{text:t.ar}),mixed("p",t.en),mixed("p",t.intro.slice(0,110)+"...")])}))]);
}
function topicView(id){
  var t=topicById[id];if(!t){return topicList()}
  var i=D.topics.indexOf(t),prev=D.topics[i-1],next=D.topics[i+1],nodes=[
    el("a",{href:"#/topics",text:"← كل الأبواب"}),
    el("div",{class:"topic-hero"},[el("div",{class:"topic-hero-t"},[el("h1",{text:t.ar}),mixed("p",t.en,"lead"),mixed("p",t.intro)]),ill(id,"illus big")])];
  t.sections.forEach(function(s){var sec=el("div",{class:"sec"},[el("h3",{text:s.h}),el("ul",{},s.items.map(function(it){return mixed("li",it)}))]);nodes.push(sec)});
  nodes.push(mixed("div",t.warn,"warn"));
  var related=D.questions.filter(function(q){return q[0]===id}).length;
  nodes.push(el("p",{},[el("a",{class:"btn",href:"#/interview/"+id,text:"أسئلة المقابلات لهذا الباب ("+related+")"})]));
  nodes.push(el("h3",{text:"المراجع"}));
  nodes.push(el("ul",{class:"refs"},t.refs.map(function(r){return el("li",{},[el("a",{href:r[1],target:"_blank",rel:"noopener noreferrer"},[mixed("span",r[0])])])})));
  nodes.push(el("div",{class:"bar"},[prev?el("a",{class:"btn alt",href:"#/topics/"+prev.id,text:"→ "+prev.ar}):null,next?el("a",{class:"btn alt",href:"#/topics/"+next.id,text:next.ar+" ←"}):null]));
  page(nodes);
}

function interview(topic,focus){
  var rev=store.get("rev")||{},cur=topic||"all",open={};
  var list=el("div"),count=el("div",{class:"count"}),chips=el("div",{class:"chips"});
  function render(){list.textContent="";var n=0,r=0;
    D.questions.forEach(function(q,i){
      if(cur!=="all"&&q[0]!==cur)return;n++;if(rev[i])r++;
      var ans=el("div",{class:"qa"},[el("span",{class:"lab",text:"نموذج إجابة (English)"}),el("div",{class:"en",text:q[3],dir:"ltr",style:"display:block"}),el("span",{class:"lab",text:"الإجابة بالعربي"}),mixed("div",q[4]),
        el("div",{class:"bar"},[el("button",{type:"button",class:"btn alt",text:rev[i]?"✓ تمت المراجعة (إلغاء)":"علّم كمراجَع",onclick:function(){rev[i]=!rev[i];store.set("rev",rev);render()}})])]);
      var head=el("button",{type:"button",class:"qh","aria-expanded":String(!!open[i]),onclick:function(){open[i]=!open[i];render()}},[el("span",{class:"qn",text:"سؤال "+(n)+" · "+topicById[q[0]].ar}),el("span",{class:"qe en",text:q[1],dir:"ltr"}),el("span",{text:q[2]})]);
      var box=el("div",{class:"q"+(rev[i]?" rev":""),id:"q"+i},[head]);if(open[i])box.appendChild(ans);list.appendChild(box)});
    count.textContent=n+" سؤال · تمت مراجعة "+r;}
  if(focus!=null){open[focus]=true;}
  function drawChips(){chips.textContent="";[["all","كل الأبواب"]].concat(D.topics.map(function(t){return [t.id,t.ar]})).forEach(function(c){
    chips.appendChild(el("button",{class:"chip",type:"button","aria-pressed":String(cur===c[0]),text:c[1],onclick:function(){cur=c[0];open={};drawChips();render();history.replaceState(null,"","#/interview"+(cur==="all"?"":"/"+cur))}}))})}
  var showAll=el("button",{class:"btn alt",type:"button",text:"اظهر كل الإجابات",onclick:function(){D.questions.forEach(function(q,i){if(cur==="all"||q[0]===cur)open[i]=true});render()}});
  var hideAll=el("button",{class:"btn alt",type:"button",text:"اخفِ الإجابات",onclick:function(){open={};render()}});
  var rnd=el("button",{class:"btn",type:"button",text:"سؤال عشوائي",onclick:function(){var pool=[];D.questions.forEach(function(q,i){if(cur==="all"||q[0]===cur)pool.push(i)});var i=pool[Math.floor(Math.random()*pool.length)];open={};render();var b=document.getElementById("q"+i);b.scrollIntoView({block:"center"});b.querySelector("button").focus()}});
  var reset=el("button",{class:"btn alt",type:"button",text:"مسح علامات المراجعة",onclick:function(){rev={};store.set("rev",rev);render()}});
  drawChips();render();
  page([el("h1",{text:"أسئلة المقابلات"}),el("p",{class:"lead",text:"أسئلة مقسمة حسب الباب. حاول تجاوب بصوت عالٍ بالإنجليزي قبل ما تفتح الإجابة. الإجابات نماذج، وجاوب بخبرتك وبإجراءات جهة العمل."}),chips,el("div",{class:"bar"},[rnd,showAll,hideAll,reset,count]),list]);
  if(focus!=null){var b=document.getElementById("q"+focus);if(b)b.scrollIntoView({block:"center"})}
}

function sources(){
  var all=[];D.topics.forEach(function(t){t.refs.forEach(function(r){all.push([t.ar,r])})});
  page([el("h1",{text:"المصادر والنطاق"}),
   el("div",{class:"warn",text:"هذا الموقع تعليمي. الأرقام والتعريفات مأخوذة بشكل أساسي من لوائح OSHA الأمريكية (الإنشاءات 29 CFR 1926 والصناعة العامة 29 CFR 1910) كأمثلة، ومعيار ISO 45001 للإطار العام. لم تتم مراجعتها مقابل أنظمة المملكة العربية السعودية أو أي جهة أخرى. تتغير اللوائح، فتأكد من النسخة الحالية ومن إجراءات جهة العمل."}),
   el("p",{text:"استخدم الموقع للمذاكرة والتحضير للمقابلات فقط، وليس كإجراء تنفيذ لعمل فعلي. قبل أي عمل خطر، اتبع التصريح والإجراء المعتمد في موقعك ومشرف السلامة."}),
   el("h2",{text:"المراجع حسب الباب"}),
   el("ul",{class:"refs"},all.map(function(a){return el("li",{},[a[0]+": ",el("a",{href:a[1][1],target:"_blank",rel:"noopener noreferrer"},[mixed("span",a[1][0])])])})),
   el("h2",{text:"ملاحظات"}),
   el("ul",{},[el("li",{text:"تعريف الـ IDLH والتنفس في الأماكن المحصورة مبني على متطلبات OSHA، والأجواء ناقصة الأكسجين المصنفة IDLH لا يكفي فيها خط هواء وحده."}),el("li",{text:"المصطلحات العربية قد تختلف بين الدول والشركات. ما يظهر هنا ترجمة تعليمية شائعة."}),el("li",{text:"للإضافة أو التعديل: افتح ملفات js/data-*.js وعدّل القوائم."})])]);
}

function route(){
  var h=location.hash.replace(/^#\/?/,""),p=h.split("/");box.hidden=true;
  var sec=p[0]||"home";
  document.querySelectorAll(".nav a").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-nav")===sec)});
  if(sec==="glossary")glossary(p[1]==="t"?p[2]:null);
  else if(sec==="topics")p[1]?topicView(p[1]):topicList();
  else if(sec==="interview")interview(p[1]&&topicById[p[1]]?p[1]:null,p[2]!=null?+p[2]:null);
  else if(sec==="sources")sources();
  else home();
  main.focus({preventScroll:true});
}
window.addEventListener("hashchange",route);route();
})();
