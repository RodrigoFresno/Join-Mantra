(()=>{const $=id=>document.getElementById(id);const landing=$('landing'),posterScreen=$('posterScreen'),sheet=$('posterSheet'),manifesto=$('manifesto'),phoneScreen=$('phoneScreen'),join=$('join'),turnPoster=$('turnPoster'),phoneClosed=$('phoneClosed'),back=$('back'),digits=$('digits'),status=$('status'),player=$('player'),ring=$('ring'),phoneWrap=$('phoneWrap'),manifestoAudio=$('manifestoAudio');let number='',calling=false,ringTimer=null;const code='08008886448';
const introVideo=document.querySelector('.intro-video');
function keepIntroVideoPlaying(){
 if(!introVideo||!landing||landing.classList.contains('hidden'))return;
 introVideo.muted=true;introVideo.defaultMuted=true;introVideo.playsInline=true;introVideo.loop=true;
 if(introVideo.paused){const attempt=introVideo.play();if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});}
}
if(introVideo){
 introVideo.addEventListener('loadeddata',keepIntroVideoPlaying);
 introVideo.addEventListener('canplay',keepIntroVideoPlaying);
 introVideo.addEventListener('ended',()=>{introVideo.currentTime=0;keepIntroVideoPlaying();});
 window.addEventListener('pageshow',keepIntroVideoPlaying);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)keepIntroVideoPlaying();});
 document.addEventListener('pointerdown',keepIntroVideoPlaying,{capture:true,passive:true});
 keepIntroVideoPlaying();
}
let phoneAudioContext=null;
function phoneSound(type,key){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  if(!phoneAudioContext)phoneAudioContext=new AC();
  const ctx=phoneAudioContext;
  if(ctx.state!=='running')ctx.resume().catch(()=>{});
  const now=ctx.currentTime;
  const tone=(freq,duration,delay=0,wave='sine',volume=.045)=>{
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(freq,now+delay);
   gain.gain.setValueAtTime(.0001,now+delay);
   gain.gain.exponentialRampToValueAtTime(volume,now+delay+.008);
   gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now+delay);osc.stop(now+delay+duration+.015);
  };
  const click=(delay=0)=>{
   tone(1450,.025,delay,'square',.018);
   tone(520,.035,delay+.006,'triangle',.025);
  };
  if(type==='key'){
   const tones={'1':[697,1209],'2':[697,1336],'3':[697,1477],'4':[770,1209],'5':[770,1336],'6':[770,1477],'7':[852,1209],'8':[852,1336],'9':[852,1477],'*':[941,1209],'0':[941,1336],'#':[941,1477]};
   const pair=tones[key];if(pair){tone(pair[0],.105,0,'sine',.035);tone(pair[1],.105,0,'sine',.035);}click(.006);
  }else if(type==='on'){
   click();tone(660,.12,.035,'triangle',.035);tone(990,.19,.16,'sine',.04);
  }else if(type==='off'){
   click();tone(740,.13,.035,'triangle',.032);tone(440,.2,.17,'sine',.035);
  }else if(type==='click')click();
 }catch(e){console.warn('Phone sound unavailable',e)}
}
// Simple, self-contained paper turn: no external flip library/CDN dependency.
let posterTurnStarted=false, paperAudioContext=null;
join.addEventListener('click',()=>{landing.classList.add('hidden');posterScreen.classList.remove('hidden');posterTurnStarted=false;});
async function paperSound(){
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  if(!paperAudioContext)paperAudioContext=new C();const ctx=paperAudioContext;
  if(ctx.state!=='running')await ctx.resume();
  const now=ctx.currentTime;
  // Two gentle, short filtered noise swishes for a natural paper rustle.
  for(const part of [{delay:0,duration:.62,level:.34,low:2100,high:650},{delay:.085,duration:.32,level:.19,low:3800,high:1250}]){
   const len=Math.floor(ctx.sampleRate*part.duration),buf=ctx.createBuffer(1,len,ctx.sampleRate),data=buf.getChannelData(0);
   for(let i=0;i<len;i++){const t=i/len;data[i]=(Math.random()*2-1)*(.85+.15*Math.sin(Math.PI*t))*Math.pow(1-t,.12);}
   const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buf;filter.type='bandpass';filter.frequency.setValueAtTime(part.low,now+part.delay);filter.frequency.exponentialRampToValueAtTime(part.high,now+part.delay+part.duration);filter.Q.value=.55;
   gain.gain.setValueAtTime(.0001,now+part.delay);gain.gain.linearRampToValueAtTime(part.level,now+part.delay+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+part.delay+part.duration);
   src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(now+part.delay);src.stop(now+part.delay+part.duration);
  }
 }catch(e){console.warn('Paper sound could not play',e)}
}

function startManifestoAudio(){if(!manifestoAudio)return;manifestoAudio.loop=true;manifestoAudio.play().catch(e=>console.warn('Manifesto audio playback blocked until interaction',e));}
function pauseManifestoAudio(){if(manifestoAudio)manifestoAudio.pause();}
function revealManifesto(){posterScreen.classList.add('hidden');manifesto.classList.remove('hidden');manifesto.scrollTop=0;window.scrollTo(0,0);startManifestoAudio();}
const posterFlipHost=$('posterFlip');
const turnButton=document.createElement('button');turnButton.type='button';turnButton.className='poster-turn-button';turnButton.setAttribute('aria-label','Virar página e abrir manifesto');turnButton.textContent='';posterFlipHost.appendChild(turnButton);
turnButton.addEventListener('click',()=>{
 if(posterTurnStarted)return;posterTurnStarted=true;turnButton.disabled=true;
 paperSound();sheet.classList.remove('simple-turn');void sheet.offsetWidth;sheet.classList.add('simple-turn');
 sheet.addEventListener('animationend',function onEnd(e){if(e.animationName==='mantraSoftPaperTurn'){sheet.removeEventListener('animationend',onEnd);revealManifesto();}}, {once:false});
 // Failsafe in case a browser suppresses animationend.
 setTimeout(()=>{if(posterTurnStarted&&!posterScreen.classList.contains('hidden'))revealManifesto();},1750);
});
phoneClosed.addEventListener('click',()=>{phoneSound('on');pauseManifestoAudio();manifesto.classList.add('hidden');phoneScreen.classList.remove('hidden');phoneScreen.scrollTop=0;phoneWrap.classList.add('opening');number='';digits.textContent='READY';status.textContent='';setTimeout(()=>phoneWrap.classList.remove('opening'),750)});
function stop(){calling=false;clearTimeout(ringTimer);ring.pause();ring.currentTime=0;player.pause();player.currentTime=0;player.onended=null;ring.onended=null;}
function returnToManifesto(){stop();phoneScreen.classList.add('hidden');manifesto.classList.remove('hidden');startManifestoAudio();phoneWrap.classList.remove('closing','opening');manifesto.scrollTop=0;window.scrollTo({top:0,behavior:'instant'});number='';refresh();status.textContent='';}
back.addEventListener('click',()=>{phoneSound('off');returnToManifesto()});function refresh(){digits.textContent=number||'READY';}
function feedback(el){el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),170)}
document.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>{if(calling)return;phoneSound('key',b.dataset.key);number+=b.dataset.key;refresh();status.textContent='';feedback(b)}));
$('clear').addEventListener('click',e=>{phoneSound('click');feedback(e.currentTarget);if(calling)stop();number='';refresh();status.textContent='NUMBER CLEARED'});
$('end').addEventListener('click',e=>{phoneSound('click');feedback(e.currentTarget);if(calling||player.currentTime>0){stop();status.textContent='CALL ENDED'}else{status.textContent='READY';number='';refresh()}});
$('call').addEventListener('click',async e=>{phoneSound('click');feedback(e.currentTarget);if(calling)return;if(number.replace(/\D/g,'')!==code){status.textContent='NUMBER NOT RECOGNIZED';return}calling=true;status.textContent='CALLING…';try{ring.currentTime=0;await ring.play()}catch(e){};ringTimer=setTimeout(()=>{if(!calling)return;ring.pause();ring.currentTime=0;status.textContent='CONNECTED';const n=Math.floor(Math.random()*7)+1;player.src=`assets/audio/${n}.mp3`;player.play().catch(()=>status.textContent='AUDIO READY')},Math.max(1800,(ring.duration||2)*1000));player.onended=()=>{calling=false;status.textContent='CALL ENDED'};});
['menu','navUp','navLeft','navCenter','navRight','navDown'].forEach(id=>$(id)?.addEventListener('click',e=>{feedback(e.currentTarget);status.textContent=id==='menu'?'MANTRA MENU': 'READY'}));
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=19',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));})();
