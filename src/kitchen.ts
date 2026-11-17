// Strictly typed additions around the existing, preserved single-file app.
type MealType = 'breakfast' | 'lunch' | 'dinner';
interface Ingredient { amt: string; name: string }
interface Step { title: string; content: string; timerSeconds?: number }
interface Grocery { s: string; i: string; n: string }
interface Meal { id: string; servings?: number; revision?: string; name: string; type: MealType; ptype: string; prep?: boolean; note?: string; adapt?: string; url?: string; protein?: string; fiber?: string; ingredients: Ingredient[]; steps: Step[]; grocery: Grocery[]; isCustom?: boolean }
interface PlanDay { date: string; b: string; l: string; lPrep: boolean; d: string; isOut: boolean; skipBreakfast: boolean; skipLunch: boolean; skipDinner: boolean }
interface MealPlan { startDate: string; endDate: string; weekType: string; days: PlanDay[]; preparedMeals?: Record<string,number>; stockedItems?: string[]; bowlVegetable?: string; chickenCut?: string; bowlServings?: Record<string,number>; notes?: string; prepByDate?: Record<string,string> }
interface CookChecks { ingredientsDone: Record<string, boolean>; stepsDone: Record<string, boolean> }
declare const BUILTIN_MEALS: Record<string, Meal>;
declare let customRecipes: Meal[];
declare let plan: MealPlan;
declare let currentWeek: string;
declare let activeDay: number;
declare let checkedItems: Record<string, boolean>;
declare let cookState: CookChecks;
declare let getAllMeals: () => Record<string, Meal>;
declare function getMeal(id: string): Meal | null;
declare function save(): void;
declare let derivedGroceryList: () => Record<string,Array<{item:string;note:string}>>;
declare let customGrocery: Record<string,Array<{item:string;note?:string}>>;
declare function renderAll(): void;
declare function renderRecipes(): void;
declare let renderHome: () => void;
declare function showScreen(name: string): void;
declare function dateStr(date: Date): string;
declare function parseDate(date: string): Date;
declare function addDays(date: Date, count: number): Date;
declare function today(): string;
declare function formatFull(date: string): string;
declare let openCookMode: (id: string) => void;
declare let toggleCookIngredient: (index: number) => void;
declare let toggleCookStep: (index: number) => void;
declare let closeCookMode: () => void;
type Json = null | string | number | boolean | Json[] | { [key: string]: Json };
interface Preference { kind: string; text: string }
interface RecipeRequest { id: string; url: string; text: string; note: string; created: string }
interface Timer { key: string; title: string; end: number | null; remaining: number; duration: number }
const kitchen = (() => {
  function el(id: string): HTMLElement { const node = document.getElementById(id); if (!node) throw new Error(`Missing interface element: ${id}`); return node; }
  function input(id: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement { const node = el(id); if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) return node; throw new Error(`Missing input: ${id}`); }
  function esc(text: string): string { return text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char] ?? char)); }
  function record(value: Json | undefined): value is { [key: string]: Json } { return value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value); }
  function load(key: string): Json { try { const value: Json = JSON.parse(localStorage.getItem(key) ?? 'null'); return value; } catch { return null; } }
  function store(key: string, value: string): boolean { try { localStorage.setItem(key, value); return true; } catch { toast('Could not save. Your browser storage may be full. Export a backup.'); return false; } }
  const servingOverrides: Record<string, number> = {};
  const storedServings = load('kitchen.servings.v1');
  if(record(storedServings)) for(const [id,count] of Object.entries(storedServings)) if(typeof count==='number'&&Number.isInteger(count)&&count>0&&count<=100) servingOverrides[id]=count;
  function servingCount(meal:Meal):number|null{return servingOverrides[meal.id]??meal.servings??(meal.id.startsWith('go_')?2:null);}
  function servingLabel(meal:Meal):string{const count=servingCount(meal);return count===null?'Servings not specified':`Makes ${count} ${count===1?'serving':'servings'}${meal.id.startsWith('go_')&&count===2?' (dinner + lunch)':''}`;}
  function showServings(meal:Meal):void{el('cook-meta-row').textContent=servingLabel(meal);input('k-servings-count').value=String(servingCount(meal)??'');}
  let toastTimeout = 0;
  function toast(text: string): void { el('k-toast').textContent = text; window.clearTimeout(toastTimeout); toastTimeout = window.setTimeout(() => { el('k-toast').textContent = ''; }, 5500); }
  const defaultPreferences: Preference[] = [
    {kind:'Avoid',text:'Peanuts and peanut-based ingredients; cilantro; bell peppers; spicy peppers and chili heat; olives; tuna; cherry tomatoes.'},
    {kind:'Flavor',text:'Black pepper is welcome. Smoked paprika, not hot. Small amounts of rice vinegar and Dijon are fine; avoid vinegar-forward dressings and honey-mustard flavors.'},
    {kind:'Love',text:'Asian flavors, cold breakfasts, crunchy lunches. Japanese barbecue chicken or salmon with rice and a vegetable is a weekly go-to.'},
    {kind:'Routine',text:'Substantial weekday lunches prepared ahead; dinner leftovers welcome. Quick Tuesday and Thursday dinners.'},
    {kind:'Practical',text:'Cook for one, reuse ingredients, prefer convenient sauces. Confident cook with oven, stove, air fryer, microwave and rice cooker.'}
  ];
  const storedPreferences = load('kitchen.preferences.v1');
  let preferences: Preference[] = Array.isArray(storedPreferences) ? storedPreferences.flatMap(item => record(item) && typeof item.kind === 'string' && typeof item.text === 'string' ? [{kind:item.kind,text:item.text}] : []) : defaultPreferences;
  const storedRequests = load('kitchen.requests.v1');
  let requests: RecipeRequest[] = Array.isArray(storedRequests) ? storedRequests.flatMap(item => record(item) && typeof item.id === 'string' && typeof item.url === 'string' && typeof item.text === 'string' && typeof item.note === 'string' && typeof item.created === 'string' ? [{id:item.id,url:item.url,text:item.text,note:item.note,created:item.created}] : []) : [];
  const timers: Timer[] = [];
  const storedTimers = load('kitchen.timers.v1');
  if (Array.isArray(storedTimers)) for (const item of storedTimers) { if (record(item) && typeof item.key === 'string' && typeof item.title === 'string' && (typeof item.end === 'number' || item.end === null) && typeof item.remaining === 'number' && typeof item.duration === 'number') timers.push({key:item.key,title:item.title,end:item.end,remaining:item.remaining,duration:item.duration}); }
  let editingPreference: number | null = null;
  let currentMealId = '';
  let returnFocus: HTMLElement | null = null;
  let wake: WakeLockSentinel | null = null;
  let wantsWake = false;
  let draftPlan: MealPlan | null = null;
  const iconPaths: Record<string,string> = {home:'M3 10 12 3l9 7v11H3ZM9 21v-8h6v8',plan:'M8 2v4m8-4v4M3 9h18M4 4h16v18H4Z',grocery:'m3 3 2 2 3 12h11l3-9H6M9 21h.01M18 21h.01',recipes:'M12 5c-3-3-7-2-10-1v16c3-1 7-2 10 1m0-16c3-3 7-2 10-1v16c-3-1-7-2-10 1Zm0 0v16',preferences:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6'};
  function icon(name: string): string { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[name] ?? ''}" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function installShell(): void {
    document.querySelector('.home-title')?.replaceChildren();
    const heading = document.querySelector('.home-title'); if (heading) heading.innerHTML = 'Meal planner';
    const homeHeader = document.querySelector('.home-header');
    homeHeader?.insertAdjacentHTML('beforeend','<div class="home-actions"><button class="k-button primary" data-k="plan">New plan</button><button class="k-button" data-k="request">+ Add a recipe</button></div>');
    document.querySelector('.home-body')?.insertAdjacentHTML('afterbegin','<div id="k-plan-age" class="k-note"></div>');
    const labels: Record<string,string> = {home:'Kitchen',plan:'Plan',grocery:'Shop',recipes:'Recipes'};
    for (const [name,label] of Object.entries(labels)) el(`nav-${name}`).innerHTML = `<div class="nav-icon">${icon(name)}</div><div>${label}</div>`;
    document.querySelector('.bottom-nav')?.insertAdjacentHTML('beforeend',`<button class="nav-btn" id="nav-preferences" onclick="showScreen('preferences')"><div class="nav-icon">${icon('preferences')}</div><div>Preferences</div></button>`);
    const sub = document.querySelector('.recipes-sub'); if(sub) sub.textContent = 'Saved recipes and adaptations.';
    document.querySelector('.recipes-filter-row')?.insertAdjacentHTML('beforebegin','<div class="k-search"><label for="k-search" class="k-eyebrow">Search recipes</label><input id="k-search" type="search" placeholder="Search recipe names and notes"></div>');
    document.querySelector('.recipes-header')?.insertAdjacentHTML('beforeend','<div class="k-inline"><button class="k-button primary" data-k="request">+ Recipe or video</button></div>');
    document.querySelector('.plan-header')?.insertAdjacentHTML('beforeend','<div class="k-inline"><button class="k-button primary" data-k="plan">Build a new plan</button></div>');
    document.querySelector('.add-recipe-btn')?.setAttribute('hidden','');
    document.body.insertAdjacentHTML('beforeend',`<div class="screen" id="screen-preferences"><header class="k-page-header"><h1>Preferences</h1><p class="k-note">Food preferences and recipe requests.</p></header><section class="k-panel"><h2>Food preferences</h2><p class="k-note">These stay in this browser and travel with recipe requests you copy. Saved recipes remain yours to review.</p><ul class="k-list" id="k-preferences"></ul><form id="k-preference-form" class="k-form" style="margin-top:24px"><label>What kind of preference?<select id="k-pref-kind"><option>Love</option><option>Avoid</option><option>Flavor</option><option>Routine</option><option>Practical</option></select></label><label>Your preference<textarea id="k-pref-text" required maxlength="1500" rows="3" placeholder="For example: keep dressings separate so lunch stays crunchy"></textarea></label><button class="k-button primary" type="submit">Save preference</button></form></section><section class="k-panel"><h2>Recipe inbox</h2><p class="k-note">Save a link now. Copy a request to this chat to have it adapted. Automatic processing is not connected yet.</p><button class="k-button sun" data-k="request">+ Add a recipe or video</button><ul class="k-list" id="k-requests"></ul></section><section class="k-panel"><h2>Backup</h2><p class="k-note">Download your recipes, plan, preferences and cooking progress. Browser data does not automatically sync across devices.</p><div class="k-inline"><button class="k-button" data-k="backup">Download backup</button></div></section></div><div id="k-toast" class="k-toast" role="status" aria-live="polite"></div>
    <dialog class="k-dialog" id="k-request-dialog"><div class="k-dialog-top"><h2>Add a recipe</h2><button class="k-button small" data-k="close-request" aria-label="Close recipe form">Close</button></div><p class="k-note">Save a recipe or video link with any changes you want.</p><form class="k-form" id="k-request-form"><label>Recipe or video link<input id="k-request-url" type="url" placeholder="https://…" maxlength="3000"></label><label>Recipe text or video notes (optional)<textarea id="k-request-text" rows="5" maxlength="30000" placeholder="Ingredients, steps, captions, or what caught your eye"></textarea></label><label>Notes or requested changes (optional)<textarea id="k-request-note" rows="2" maxlength="3000" placeholder="Love the crispy chicken; could this work for lunch?"></textarea></label><p id="k-request-status" class="k-status" role="status"></p><button class="k-button primary" type="submit">Save to recipe inbox</button><p class="k-note">This saves a request, not a finished recipe. Copy it from your inbox and send it to this chat for adaptation.</p></form></dialog>
    <dialog class="k-dialog" id="k-plan-dialog"><div class="k-dialog-top"><h2>New plan</h2><button class="k-button small" data-k="close-plan">Close</button></div><p class="k-note">A local draft from your saved recipes, favoring ready-ahead lunches and shared ingredients. Review it before replacing your plan.</p><form id="k-plan-form" class="k-form"><div class="k-grid2"><label>Start<input id="k-plan-start" type="date" required></label><label>Through<input id="k-plan-end" type="date" required></label></div><label>Ingredients to use up<input id="k-plan-use" placeholder="Chicken, broccoli, cucumber…" maxlength="1000"></label><div class="k-grid2"><label>Your barbecue bowl<select id="k-plan-protein"><option value="chicken">Chicken</option><option value="salmon">Salmon</option><option value="none">Skip this time</option></select></label><label>Vegetable for the bowl<input id="k-plan-veg" value="Broccoli" required maxlength="100"></label></div><label class="k-checkbox"><input id="k-plan-leftovers" type="checkbox" checked>Use the barbecue bowl for next-day lunch</label><fieldset style="border:1px solid var(--border);border-radius:14px;padding:14px"><legend>Weekend meals</legend><label class="k-checkbox"><input id="k-plan-weekend-breakfast" type="checkbox" checked>Breakfast at home</label><label class="k-checkbox"><input id="k-plan-weekend-lunch" type="checkbox" checked>Lunch at home</label><label class="k-checkbox"><input id="k-plan-weekend-dinner" type="checkbox" checked>Dinner at home</label><p class="k-note">You can adjust each day after saving.</p></fieldset><p id="k-plan-status" class="k-status" role="status"></p><button class="k-button primary" type="submit">Preview my plan</button></form><div id="k-plan-preview" class="k-plan-preview"></div><div class="k-inline"><button class="k-button primary" data-k="accept-plan" id="k-accept-plan" hidden>Use this plan</button><button class="k-button" data-k="copy-plan">Copy planning request for chat</button></div></dialog>`);
    const cookOverlay = el('cook-overlay'); cookOverlay.setAttribute('role','dialog'); cookOverlay.setAttribute('aria-modal','true'); cookOverlay.setAttribute('aria-labelledby','cook-title');
    document.querySelector('.cook-header')?.insertAdjacentHTML('afterend','<div class="k-cook-toolbar"><span id="k-cook-progress" class="k-progress"></span><button class="k-button small" data-k="wake" id="k-wake">Keep screen awake</button><button class="k-button small" data-k="reset-cook">Start fresh</button></div><div class="k-banner" id="k-timer-banner" role="status" hidden></div>');
    document.querySelector('.k-cook-toolbar')?.insertAdjacentHTML('afterend','<form id="k-servings-form" class="k-servings-form"><label for="k-servings-count">Recipe servings</label><input id="k-servings-count" type="number" min="1" max="100" step="1" required placeholder="Not specified"><button type="submit" class="k-button small">Save servings</button><p class="k-note">For the ingredient amounts shown. Changing this number does not scale the recipe.</p></form>');
    el('k-servings-form').addEventListener('submit',event=>{event.preventDefault();const count=Number(input('k-servings-count').value);const meal=getMeal(currentMealId);if(!meal||!Number.isInteger(count)||count<1||count>100)return;const next={...servingOverrides,[currentMealId]:count};if(store('kitchen.servings.v1',JSON.stringify(next))){servingOverrides[currentMealId]=count;showServings(meal);filterCards();toast('Serving count saved for this recipe. Ingredient amounts are unchanged.');}});
    el('k-search').addEventListener('input',filterCards);
    document.querySelector('.recipe-cards') && new MutationObserver(filterCards).observe(el('recipe-cards'),{childList:true});
    el('k-preference-form').addEventListener('submit',event => { event.preventDefault(); const text = input('k-pref-text').value.trim(); if(!text) return; const replacement = {kind:input('k-pref-kind').value,text}; const next = editingPreference === null ? [...preferences,replacement] : preferences.map((pref,index)=>index===editingPreference?replacement:pref); if(store('kitchen.preferences.v1',JSON.stringify(next))){ preferences=next; editingPreference=null; input('k-pref-text').value=''; renderPreferences(); toast('Preference saved. Include it in your next adaptation.'); } });
    el('k-request-form').addEventListener('submit',saveRequest);
    el('k-plan-form').addEventListener('submit',event => {event.preventDefault(); previewPlan();});
    document.addEventListener('click',handleAction);
    document.addEventListener('keydown',event => { if(!el('cook-overlay').classList.contains('show')) return; if(event.key==='Escape') closeCookMode(); if(event.key==='Tab'){ const focusable=Array.from(el('cook-overlay').querySelectorAll('button,a[href]')).filter(node=>node instanceof HTMLElement && node.getClientRects().length>0); const first=focusable[0],last=focusable[focusable.length-1]; if(event.shiftKey&&document.activeElement===first&&last instanceof HTMLElement){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last&&first instanceof HTMLElement){event.preventDefault();first.focus();} } });
    for(const id of ['k-plan-start','k-plan-end','k-plan-use','k-plan-protein','k-plan-veg','k-plan-leftovers','k-plan-weekend-breakfast','k-plan-weekend-lunch','k-plan-weekend-dinner']) el(id).addEventListener('input',invalidateDraft);
    document.addEventListener('visibilitychange',()=>{tick();if(document.visibilityState==='visible'&&wantsWake) void acquireWake();});
    renderPreferences(); renderRequests(); updateAge();
  }
  function filterCards(): void {
    const query=input('k-search').value.toLowerCase();
    for(const card of el('recipe-cards').children){
      if(!(card instanceof HTMLElement))continue;
      const meal=card.dataset.mealId?getMeal(card.dataset.mealId):null;
      if(meal){const meta=card.querySelector('.rc-meta');if(meta)meta.textContent=[meal.protein?meal.protein+' protein':'',meal.fiber?meal.fiber+' fiber':'',meal.note??''].filter(Boolean).join(' · ');let label=card.querySelector('.rc-servings');if(!label){label=document.createElement('p');label.className='rc-servings';card.querySelector('.rc-name')?.insertAdjacentElement('afterend',label);}label.textContent=servingLabel(meal);}
      card.hidden=!card.textContent?.toLowerCase().includes(query);
    }
  }
  function renderPreferences(): void { el('k-preferences').innerHTML=preferences.map((pref,index)=>`<li><span class="k-pill">${esc(pref.kind)}</span><p>${esc(pref.text)}</p><div class="k-inline"><button class="k-button small" data-k="edit-pref" data-index="${index}">Edit</button><button class="k-button small danger" data-k="remove-pref" data-index="${index}">Remove</button></div></li>`).join(''); }
  function renderRequests(): void { el('k-requests').innerHTML=requests.map((request,index)=>`<li class="k-request"><span class="k-pill">Awaiting adaptation</span><p>${esc(request.note||request.text.slice(0,110)||request.url)}</p>${request.url?`<a href="${esc(request.url)}" target="_blank" rel="noopener noreferrer">Open source</a>`:''}<div class="k-inline"><button class="k-button small" data-k="copy-request" data-index="${index}">Copy request for chat</button><button class="k-button small danger" data-k="remove-request" data-index="${index}">Remove</button></div></li>`).join('')||'<li>No recipe requests saved.</li>'; }
  function dialog(id:string,open:boolean):void{const node=el(id);if(node instanceof HTMLDialogElement){if(open)node.showModal();else node.close();}}
  function saveRequest(event:SubmitEvent):void{event.preventDefault();const url=input('k-request-url').value.trim(),text=input('k-request-text').value.trim(),note=input('k-request-note').value.trim();if(!url&&!text){el('k-request-status').textContent='Add a source link or some recipe text.';return;}if(url&&!safeUrl(url)){el('k-request-status').textContent='Use a valid https:// or http:// source link.';return;}const next=[{id:crypto.randomUUID(),url,text,note,created:new Date().toISOString()},...requests];if(!store('kitchen.requests.v1',JSON.stringify(next)))return;requests=next;renderRequests();dialog('k-request-dialog',false);showScreen('preferences');toast('Saved. Copy the request from your inbox to have it adapted.');}
  function safeUrl(url:string):boolean{try{const parsed=new URL(url);return parsed.protocol==='https:'||parsed.protocol==='http:';}catch{return false;}}
  function preferencePrompt():string{return preferences.map(pref=>`${pref.kind}: ${pref.text}`).join('\n');}
  async function copy(text:string):Promise<void>{try{await navigator.clipboard.writeText(text);toast('Copied. Paste this into your meal-planning chat.');}catch{toast('Clipboard unavailable. Download a backup to keep your requests.');}}
  function updateAge():void{el('k-plan-age').textContent=plan.endDate<today()?'Your saved plan has ended. Build a new stretch whenever you are ready.':(plan.notes??'');}
  function invalidateDraft():void{draftPlan=null;el('k-accept-plan').hidden=true;el('k-plan-preview').replaceChildren();}
  function checked(id:string):boolean{const node=el(id);return node instanceof HTMLInputElement&&node.checked;}
  function bowl(protein:string,vegetable:string):Meal {
    const id=`go_${protein}`;
    const servings=plan.bowlServings?.[id]??2;
    return {
      id,servings,name:`Japanese Barbecue ${protein==='salmon'?'Salmon':'Chicken'} Bowl`,type:'dinner',ptype:protein,prep:true,url:'#',
      note:servings===1?'Your weekly go-to · dinner':'Your weekly go-to · dinner + next-day lunch',
      adapt:`Your own meal template, not a sourced recipe. Use your preferred mild Japanese barbecue sauce and ${vegetable.toLowerCase()}. Keep crunchy components separate until serving.`,
      ingredients:[
        {amt:protein==='salmon'?`${servings} ${servings===1?'fillet':'fillets'}`:servings===2?'1 lb':'As needed',name:protein==='chicken'?(plan.chickenCut??'chicken'):protein},
        {amt:`${servings*2} tbsp`,name:'Japanese barbecue sauce (your preferred mild version)'},
        {amt:`${servings} ${servings===1?'cup':'cups'} cooked`,name:'rice'},
        {amt:`${servings} ${servings===1?'cup':'cups'}`,name:vegetable}
      ],
      steps:[
        {title:'Make the rice',content:'Cook rice using your usual method, or heat a rice pouch.'},
        {title:'Cook your protein',content:`Cook ${protein} using your preferred method. Brush or toss with Japanese barbecue sauce near the end so the sauce does not burn.`},
        {title:'Prepare the vegetable',content:`Prepare ${vegetable.toLowerCase()} however you enjoy it: roast, steam, stir-fry, or serve crunchy if appropriate.`},
        {title:servings===1?'Serve dinner':'Build dinner and pack lunch',content:servings===1?'Serve the protein with rice, the vegetable, and sauce.':'Serve with rice and the vegetable. Pack the next-day lunch separately; keep crisp components and extra sauce separate. Refrigerate prepared food promptly and reheat as appropriate.'}
      ],
      grocery:[
        {s:'Proteins',i:protein==='salmon'?'Salmon fillet':(plan.chickenCut??'Chicken'),n:servings===1?'Barbecue bowl dinner':'Barbecue bowl · dinner + next-day lunch'},
        {s:'Produce',i:vegetable,n:'Barbecue bowl vegetable'},
        {s:'Pantry',i:'Japanese barbecue sauce',n:'Preferred mild version'},
        {s:'Pantry',i:'Jasmine rice',n:'Barbecue bowl'}
      ]
    };
  }
  function addGoToTemplates():void{for(const protein of ['chicken','salmon']){const id=`go_${protein}`;if(!BUILTIN_MEALS[id])BUILTIN_MEALS[id]=bowl(protein,'Vegetable of your choice');}}
  function previewPlan():void{
    invalidateDraft();const start=input('k-plan-start').value,end=input('k-plan-end').value;const span=(parseDate(end).getTime()-parseDate(start).getTime())/86400000;
    if(!start||!end||start>end||!Number.isFinite(span)||span>30){el('k-plan-status').textContent='Choose an ordered date range of up to 31 days for this draft.';return;}
    const all=Object.values(getAllMeals()).filter(meal=>meal.ingredients.length&&meal.steps.length);const breakfasts=all.filter(meal=>meal.type==='breakfast');const lunches=all.filter(meal=>meal.type==='lunch'&&meal.prep);const dinners=all.filter(meal=>meal.type==='dinner'&&!meal.id.startsWith('go_'));
    if(!breakfasts.length||!lunches.length||!dinners.length){el('k-plan-status').textContent='Add complete breakfast, make-ahead lunch and dinner recipes first.';return;}
    const use=input('k-plan-use').value.toLowerCase().split(',').map(term=>term.trim()).filter(Boolean);const used=new Map<string,number>();const shared=new Set<string>();
    function pick(pool:Meal[],quick:boolean):Meal{const sorted=[...pool].sort((a,b)=>score(b)-score(a));const chosen=sorted[0];if(!chosen)throw new Error('No recipes available');used.set(chosen.id,(used.get(chosen.id)??0)+1);chosen.grocery.forEach(item=>shared.add(item.i.toLowerCase()));return chosen;function score(meal:Meal):number{const haystack=meal.ingredients.map(item=>item.name).join(' ').toLowerCase();return use.reduce((sum,term)=>sum+(haystack.includes(term)?6:0),0)+meal.grocery.filter(item=>shared.has(item.i.toLowerCase())).length*.7-(used.get(meal.id)??0)*7+(quick&&/quick|20 min|one pan|25 min/.test(meal.note??'')?3:0);}}
    const protein=input('k-plan-protein').value;const days:PlanDay[]=[];let previousDinner='';let pendingBowl:Meal|null=null;
    if(protein!=='none'){const vegetable=input('k-plan-veg').value.trim();if(!vegetable||!/[\p{L}\p{N}]/u.test(vegetable)||!/^[\p{L}\p{N} ,()-]+$/u.test(vegetable)){el('k-plan-status').textContent='Enter a vegetable name using letters, numbers, spaces or parentheses.';return;}pendingBowl=bowl(protein,vegetable);}
    for(let date=parseDate(start);dateStr(date)<=end;date=addDays(date,1)){
      const weekend=date.getDay()===0||date.getDay()===6;const breakfast=pick(breakfasts,false);const dinner=days.length===0&&pendingBowl?pendingBowl:pick(dinners,date.getDay()===2||date.getDay()===4);const leftover=checked('k-plan-leftovers')&&previousDinner.startsWith('go_');const lunchId=leftover?previousDinner:pick(lunches,false).id;
      days.push({date:dateStr(date),b:breakfast.id,l:lunchId,lPrep:true,d:dinner.id,isOut:false,skipBreakfast:weekend&&!checked('k-plan-weekend-breakfast'),skipLunch:weekend&&!checked('k-plan-weekend-lunch'),skipDinner:weekend&&!checked('k-plan-weekend-dinner')});previousDinner=weekend&&!checked('k-plan-weekend-dinner')?'':dinner.id;
    }
    draftPlan={startDate:start,endDate:end,weekType:currentWeek,days};
    el('k-plan-preview').innerHTML=days.map(day=>`<article><strong>${esc(formatFull(day.date))}</strong>Breakfast: ${day.skipBreakfast?'Out / skipped':esc(getMeal(day.b)?.name??'')}<br>Lunch: ${day.skipLunch?'Out / skipped':esc(getMeal(day.l)?.name??'')}<br>Dinner: ${day.skipDinner?'Out / skipped':esc(getMeal(day.d)?.name??'')}</article>`).join('');
    el('k-plan-status').textContent='Draft only. Uses recipe overlap, not AI adaptation. Review meals against any new preferences before saving.';el('k-accept-plan').hidden=false;
  }
  function planPrompt():string{return `Plan meals from ${input('k-plan-start').value} through ${input('k-plan-end').value}.\nUse up: ${input('k-plan-use').value||'No specific ingredients'}.\nBarbecue bowl: ${input('k-plan-protein').value}, vegetable: ${input('k-plan-veg').value}. Next-day bowl leftovers: ${checked('k-plan-leftovers')}.\nWeekend meals at home: breakfast ${checked('k-plan-weekend-breakfast')}, lunch ${checked('k-plan-weekend-lunch')}, dinner ${checked('k-plan-weekend-dinner')}. Ask about exceptions per day if needed.\nPreferences:\n${preferencePrompt()}\nUse shared ingredients and substantial prepared-ahead weekday lunches. Return the plan, complete groceries, and prep schedule.`;}
  function cookStorageKey():string{const revision=getMeal(currentMealId)?.revision;return `kitchen.cook.${currentMealId}${revision?`.${revision}`:""}`;}
  function cookChecks():void{const meal=getMeal(currentMealId);if(!meal)return;store(cookStorageKey(),JSON.stringify(cookState));el('k-cook-progress').textContent=`${Object.values(cookState.stepsDone).filter(Boolean).length} of ${meal.steps.length} steps done · progress saved`;}
  function restoreChecks():void{const data=load(cookStorageKey());cookState={ingredientsDone:{},stepsDone:{}};if(record(data)){for(const key of ['ingredientsDone','stepsDone']){const entries=data[key];if(record(entries))for(const [index,value] of Object.entries(entries))if(typeof value==='boolean'){if(key==='ingredientsDone')cookState.ingredientsDone[index]=value;else cookState.stepsDone[index]=value;}}}}
  function paintChecks():void{const meal=getMeal(currentMealId);if(!meal)return;meal.ingredients.forEach((_,index)=>{const node=el(`cook-ing-${index}`);const done=!!cookState.ingredientsDone[index];node.classList.toggle('done',done);node.setAttribute('aria-pressed',String(done));node.querySelector('.cook-ing-check')?.classList.toggle('checked',done);});meal.steps.forEach((_,index)=>{const node=el(`cook-step-${index}`);node.classList.toggle('done',!!cookState.stepsDone[index]);const button=node.querySelector('[data-k="step"]');if(button){button.textContent=cookState.stepsDone[index]?'Done — undo':'Mark step done';button.setAttribute('aria-pressed',String(!!cookState.stepsDone[index]));}});cookChecks();}
  function timerKey(index:number):string{return `${currentMealId}:${index}`;}
  function seconds(timer:Timer):number{return timer.end===null?timer.remaining:Math.max(0,Math.ceil((timer.end-Date.now())/1000));}
  function timeLabel(total:number):string{const hours=Math.floor(total/3600);const minutes=Math.floor(total%3600/60);return `${hours?`${hours}:`:''}${String(minutes).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}
  function saveTimers():void{store('kitchen.timers.v1',JSON.stringify(timers));}
  function tick():void{const meal=getMeal(currentMealId);if(meal)meal.steps.forEach((step,index)=>{if(!step.timerSeconds)return;const timer=timers.find(item=>item.key===timerKey(index));const total=timer?seconds(timer):step.timerSeconds;const clock=document.getElementById(`k-clock-${index}`);if(clock)clock.textContent=total===0?'Ready!':timeLabel(total);const button=document.getElementById(`k-timer-${index}`);if(button)button.textContent=timer?.end!==null&&timer?.end!==undefined&&total>0?'Pause':total===0?'Restart timer':'Start timer';document.getElementById(`k-timer-row-${index}`)?.classList.toggle('complete',!!timer&&total===0);});const completed=timers.filter(timer=>timer.end!==null&&seconds(timer)===0);const banner=el('k-timer-banner');banner.hidden=completed.length===0;banner.textContent=completed.length?`Timer finished: ${completed.map(timer=>timer.title).join(', ')}. Check your food before continuing.`:'';}
  function toggleTimer(index:number,reset:boolean):void{const step=getMeal(currentMealId)?.steps[index];if(!step?.timerSeconds)return;let timer=timers.find(item=>item.key===timerKey(index));if(!timer){timer={key:timerKey(index),title:step.title,end:null,remaining:step.timerSeconds,duration:step.timerSeconds};timers.push(timer);}const remaining=seconds(timer);if(reset){timer.end=null;timer.remaining=timer.duration;}else if(timer.end!==null&&remaining>0){timer.remaining=remaining;timer.end=null;}else{timer.remaining=remaining>0?remaining:timer.duration;timer.end=Date.now()+timer.remaining*1000;}saveTimers();tick();}
  async function acquireWake():Promise<void>{if(!('wakeLock' in navigator)){toast('Screen wake lock is unavailable in this browser.');wantsWake=false;return;}try{wake=await navigator.wakeLock.request('screen');if(!wantsWake){await wake.release();wake=null;return;}el('k-wake').textContent='Screen kept awake';wake.addEventListener('release',()=>{wake=null;el('k-wake').textContent='Keep screen awake';});}catch{toast('Could not keep the screen awake. Try again while this page is visible.');}}
  function installCookMode():void{
    openCookMode=(id:string):void=>{const meal=getMeal(id);if(!meal)return;returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;currentMealId=id;restoreChecks();el('cook-title').textContent=meal.name;el('cook-source').textContent=meal.note??'';showServings(meal);const adapt=el('cook-adapt-note');adapt.hidden=!meal.adapt;adapt.style.display=meal.adapt?'block':'none';adapt.textContent=meal.adapt?`Adaptations: ${meal.adapt}`:'';
      el('cook-ing-list').innerHTML=meal.ingredients.map((ingredient,index)=>`<button class="cook-ing-row" id="cook-ing-${index}" data-k="ingredient" data-index="${index}" aria-pressed="false"><span class="cook-ing-check" aria-hidden="true"><span class="check-mark">✓</span></span><span class="cook-ing-amt">${esc(ingredient.amt)}</span><span class="cook-ing-name">${esc(ingredient.name)}</span></button>`).join('')||'<p class="k-empty">This saved recipe has no ingredients yet.</p>';
      el('cook-steps').innerHTML=meal.steps.map((step,index)=>`<article class="cook-step" id="cook-step-${index}"><span class="cook-step-num">${index+1}</span><div class="cook-step-body"><h3 class="cook-step-title">${esc(step.title)}</h3><p class="cook-step-content">${esc(step.content)}</p>${step.timerSeconds?`<div class="k-timer-row" id="k-timer-row-${index}"><span class="k-timer-clock" id="k-clock-${index}" aria-label="Time remaining"></span><button class="k-button small" data-k="timer" data-index="${index}" id="k-timer-${index}">Start timer</button><button class="k-button small" data-k="reset-timer" data-index="${index}">Reset</button></div>`:''}<button class="k-button small" data-k="step" data-index="${index}" aria-pressed="false">Mark step done</button></div></article>`).join('')||'<p class="k-empty">This saved recipe has no steps yet.</p>';
      const link=el('cook-original-link');if(link instanceof HTMLAnchorElement){link.hidden=!meal.url||!safeUrl(meal.url);link.style.display=link.hidden?'none':'block';if(meal.url&&safeUrl(meal.url))link.href=meal.url;link.rel='noopener noreferrer';}
      el('cook-overlay').classList.add('show');el('cook-overlay').scrollTop=0;for(const node of document.querySelectorAll('.screen,.bottom-nav'))if(node instanceof HTMLElement)node.inert=true;paintChecks();tick();const close=document.querySelector('.cook-close-btn');if(close instanceof HTMLElement)close.focus();};
    toggleCookIngredient=(index:number):void=>{cookState.ingredientsDone[index]=!cookState.ingredientsDone[index];paintChecks();};
    toggleCookStep=(index:number):void=>{cookState.stepsDone[index]=!cookState.stepsDone[index];paintChecks();};
    closeCookMode=():void=>{el('cook-overlay').classList.remove('show');for(const node of document.querySelectorAll('.screen,.bottom-nav'))if(node instanceof HTMLElement)node.inert=false;wantsWake=false;if(wake)void wake.release();returnFocus?.focus();};
  }
  function downloadBackup():void{const data:Record<string,string>={};for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key&&(key.startsWith('meal')||key.startsWith('kitchen.')))data[key]=localStorage.getItem(key)??'';}const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exported:new Date().toISOString(),storage:data},null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`my-kitchen-${today()}.json`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function handleAction(event:MouseEvent):void{if(!(event.target instanceof Element))return;const target=event.target.closest('[data-k]');if(!(target instanceof HTMLElement))return;const action=target.dataset.k;const index=Number(target.dataset.index??'-1');
    if(action==='request'){dialog('k-request-dialog',true);}
    if(action==='close-request')dialog('k-request-dialog',false);
    if(action==='plan'){invalidateDraft();input('k-plan-start').value=today();input('k-plan-end').value=dateStr(addDays(new Date(),4));dialog('k-plan-dialog',true);}
    if(action==='close-plan')dialog('k-plan-dialog',false);
    if(action==='accept-plan'&&draftPlan){const protein=input('k-plan-protein').value;if(protein!=='none'){const meal=bowl(protein,input('k-plan-veg').value.trim());customRecipes=customRecipes.filter(recipe=>recipe.id!==meal.id);customRecipes.push({...meal,isCustom:true});}plan=draftPlan;activeDay=0;checkedItems={};save();renderAll();updateAge();dialog('k-plan-dialog',false);showScreen('plan');toast('Your plan is ready. Review each day and check Shop for groceries.');draftPlan=null;}
    if(action==='copy-plan')void copy(planPrompt());
    if(action==='remove-pref'||action==='edit-pref'){const preference=preferences[index];if(!preference)return;if(action==='edit-pref'){input('k-pref-kind').value=preference.kind;input('k-pref-text').value=preference.text;input('k-pref-text').focus();editingPreference=index;return;}editingPreference=null;const next=preferences.filter((_,position)=>position!==index);if(store('kitchen.preferences.v1',JSON.stringify(next))){preferences=next;renderPreferences();}}
    if(action==='remove-request'){const next=requests.filter((_,position)=>position!==index);if(store('kitchen.requests.v1',JSON.stringify(next))){requests=next;renderRequests();}}
    if(action==='copy-request'){const request=requests[index];if(request)void copy(`Adapt this recipe for me.\nSource: ${request.url||'Pasted recipe'}\n${request.text}\nWhat appeals to me / requested changes: ${request.note}\n\nMy preferences:\n${preferencePrompt()}\n\nKeep the original appeal, explain substitutions, reuse ingredients where practical, and return full ingredients, steps, groceries and Cook Mode guidance. Do not invent missing source details.`);}
    if(action==='ingredient')toggleCookIngredient(index);if(action==='step')toggleCookStep(index);if(action==='timer')toggleTimer(index,false);if(action==='reset-timer')toggleTimer(index,true);
    if(action==='reset-cook'){if(window.confirm('Clear the ingredient and step checks for this recipe? Timers will be kept.')){cookState={ingredientsDone:{},stepsDone:{}};paintChecks();}}
    if(action==='wake'){wantsWake=!wantsWake;if(wantsWake)void acquireWake();else if(wake)void wake.release();}
    if(action==='backup')downloadBackup();
  }
  const originalRenderHome=renderHome;
  renderHome=():void=>{originalRenderHome();const reminder=plan.prepByDate?.[today()];if(reminder){el('prep-text').textContent=reminder;el('prep-reminder').style.display='flex';}};
  // Inventory belongs to this plan only. Preserve browser recipes, including custom additions.
  const originalAllMeals=getAllMeals;
  getAllMeals=():Record<string,Meal>=>{const all=originalAllMeals();if(plan.bowlVegetable)for(const protein of ['chicken','salmon'])all[`go_${protein}`]=bowl(protein,plan.bowlVegetable);return all;};
  derivedGroceryList=():Record<string,Array<{item:string;note:string}>>=>{
    const prepared={...plan.preparedMeals};const needed=new Set<string>();
    for(const day of plan.days){if(day.isOut)continue;for(const [id,skip] of [[day.b,day.skipBreakfast],[day.l,day.skipLunch],[day.d,day.skipDinner]] satisfies Array<[string,boolean]>){if(skip)continue;const remaining=prepared[id]??0;if(remaining>0){prepared[id]=remaining-1;continue;}needed.add(id);}}
    const stocked=new Set((plan.stockedItems??[]).map(item=>item.toLowerCase()));const seen=new Map<string,Grocery>();
    for(const id of needed)for(const ingredient of getMeal(id)?.grocery??[]){const key=ingredient.i.toLowerCase();if(!stocked.has(key)&&!seen.has(key))seen.set(key,ingredient);}
    const sections:Record<string,Array<{item:string;note:string}>>={};
    for(const ingredient of seen.values()){const items=sections[ingredient.s]??[];items.push({item:ingredient.i,note:ingredient.n});sections[ingredient.s]=items;}
    const additions=customGrocery[`${currentWeek}_custom`]??[];if(additions.length)sections['My additions']=additions.map(item=>({item:item.item,note:item.note??''}));
    return sections;
  };
  installShell();addGoToTemplates();installCookMode();save();renderAll();window.setInterval(tick,1000);
  return { toast };
})();










