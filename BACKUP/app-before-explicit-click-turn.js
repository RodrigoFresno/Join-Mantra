(()=>{const $=id=>document.getElementById(id);const landing=$('landing'),posterScreen=$('posterScreen'),sheet=$('posterSheet'),manifesto=$('manifesto'),phoneScreen=$('phoneScreen'),join=$('join'),turnPoster=$('turnPoster'),phoneClosed=$('phoneClosed'),back=$('back'),digits=$('digits'),status=$('status'),player=$('player'),ring=$('ring'),phoneWrap=$('phoneWrap');let number='',calling=false,ringTimer=null;const code='08008886448';
join.addEventListener('click',()=>{landing.classList.add('hidden');posterScreen.classList.remove('hidden');setTimeout(initPosterFlip,80);});
// StPageFlip: folha física (drag/corner), sem animação CSS de 360° ou flip programático.
let pageFlip=null, posterFlipReady=false, paperAudioContext=null, paperSoundPlayed=false;
function paperSound(){try{
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 if(!paperAudioContext)paperAudioContext=new C();const ctx=paperAudioContext;
 if(ctx.state==='suspended')ctx.resume();
 const now=ctx.currentTime;
 // Rustle soft: short filtered-noise burst with a gentle envelope.
 const len=Math.floor(ctx.sampleRate*.42),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<len;i++){const t=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.5);}
 const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=buf;filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.65;
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.055,now+.035);gain.gain.exponentialRampToValueAtTime(.0001,now+.38);
 src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(now);src.stop(now+.4);
 }catch(e){}}
function revealManifesto(){posterScreen.classList.add('hidden');manifesto.classList.remove('hidden');window.scrollTo(0,0);}
function initPosterFlip(){
 if(posterFlipReady||!window.StPageFlip)return;const host=$('posterFlip');if(!host)return;
 pageFlip=new StPageFlip(host,{width:1600,height:2252,size:'stretch',minWidth:320,maxWidth:1600,minHeight:460,maxHeight:2252,drawShadow:true,flippingTime:900,usePortrait:false,showPageCorners:true,disableFlipByClick:false,swipeDistance:10,autoSize:true,backgroundColor:'#08051e',mobileScrollSupport:false,clickEventForward:true});
 pageFlip.loadFromHTML(host.querySelectorAll('.poster-page'));
 pageFlip.on('changeState',e=>{if(e.data==='flipping'&&!paperSoundPlayed){paperSoundPlayed=true;paperSound();}});
 pageFlip.on('flip',e=>{paperSoundPlayed=false;const idx=Number(e.data);if(idx>=1){setTimeout(revealManifesto,120);}});
 posterFlipReady=true;
}
posterScreen.addEventListener('transitionend',initPosterFlip);

phoneClosed.addEventListener('click',()=>{manifesto.classList.add('hidden');phoneScreen.classList.remove('hidden');phoneScreen.scrollTop=0;phoneWrap.classList.add('opening');number='';digits.textContent='READY';status.textContent='';setTimeout(()=>phoneWrap.classList.remove('opening'),750)});
function stop(){calling=false;clearTimeout(ringTimer);ring.pause();ring.currentTime=0;player.pause();player.currentTime=0;player.onended=null;ring.onended=null;}
function returnToManifesto(){stop();phoneScreen.classList.add('hidden');manifesto.classList.remove('hidden');phoneWrap.classList.remove('closing','opening');manifesto.scrollTop=0;window.scrollTo({top:0,behavior:'instant'});number='';refresh();status.textContent='';}
back.addEventListener('click',returnToManifesto);function refresh(){digits.textContent=number||'READY';}
function feedback(el){el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),170)}
document.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>{if(calling)return;number+=b.dataset.key;refresh();status.textContent='';feedback(b)}));
$('clear').addEventListener('click',e=>{feedback(e.currentTarget);if(calling)stop();number='';refresh();status.textContent='NUMBER CLEARED'});
$('end').addEventListener('click',e=>{feedback(e.currentTarget);if(calling||player.currentTime>0){stop();status.textContent='CALL ENDED'}else{status.textContent='READY';number='';refresh()}});
$('call').addEventListener('click',async e=>{feedback(e.currentTarget);if(calling)return;if(number.replace(/\D/g,'')!==code){status.textContent='NUMBER NOT RECOGNIZED';return}calling=true;status.textContent='CALLING…';try{ring.currentTime=0;await ring.play()}catch(e){};ringTimer=setTimeout(()=>{if(!calling)return;ring.pause();ring.currentTime=0;status.textContent='CONNECTED';const n=Math.floor(Math.random()*6)+1;player.src=`assets/audio/${n}.mp3`;player.play().catch(()=>status.textContent='AUDIO READY')},Math.max(1800,(ring.duration||2)*1000));player.onended=()=>{calling=false;status.textContent='CALL ENDED'};});
['menu','navUp','navLeft','navCenter','navRight','navDown'].forEach(id=>$(id)?.addEventListener('click',e=>{feedback(e.currentTarget);status.textContent=id==='menu'?'MANTRA MENU': 'READY'}));
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));})();
