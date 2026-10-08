(function(){
  "use strict";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(x){return x.toLocaleString("en-US");}
  function $(id){return document.getElementById(id);}

  // Ticker: duplicate items for a seamless loop (copies hidden from assistive tech)
  var track=$("tickerTrack");
  if(track){Array.prototype.slice.call(track.children).forEach(function(li){var c=li.cloneNode(true);c.setAttribute("aria-hidden","true");track.appendChild(c);});}

  // Ever-rising counter: starts just shy of a billion, so it crosses one while you watch
  var el=$("fanCount"),ms=$("milestone");
  var n=999999950,paused=false,billion=false;
  function paint(){
    if(el) el.textContent=fmt(n);
    if(!billion&&n>=1000000000){billion=true;if(ms) ms.textContent="🎉 One billion! Tab is being very normal about it.";var r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,140);}
  }
  setInterval(function(){if(paused) return;n+=Math.floor(Math.random()*4)+1;paint();},700);

  // Pause control for everything that moves or updates on its own
  var pb=$("pauseBtn");
  if(pb) pb.addEventListener("click",function(){
    paused=!paused;document.body.classList.toggle("paused",paused);
    pb.setAttribute("aria-pressed",String(paused));pb.textContent=paused?"Play motion":"Pause motion";
    if(ms) ms.textContent=paused?"Paused at "+fmt(n)+" fans. The fans did not pause.":"Counting again.";
  });

  // Confetti, blue-bubble edition
  var canvas=$("confetti"),ctx=canvas.getContext("2d");
  var parts=[],running=false,colors=["#2f8cff","#ffffff","#a78bff","#ffd166","#9cc8ff","#0a63e8"];
  function size(){var d=window.devicePixelRatio||1;canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);}
  size();addEventListener("resize",size);
  function burst(x,y,count){
    if(reduce||paused) return;
    for(var i=0;i<count;i++){
      var a=Math.random()*Math.PI*2,s=4+Math.random()*9;
      parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-6,w:6+Math.random()*6,h:8+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:colors[i%colors.length],life:0,icon:Math.random()<.07});
    }
    if(!running){running=true;requestAnimationFrame(tick);}
  }
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=parts.length-1;i>=0;i--){
      var p=parts[i];p.vy+=.28;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life++;
      if(p.y>innerHeight+40||p.life>260){parts.splice(i,1);continue;}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      if(p.icon){ctx.font="22px serif";ctx.fillText("\u{1F4AC}",-11,8);}
      else{ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
      ctx.restore();
    }
    if(parts.length){requestAnimationFrame(tick);}else{running=false;ctx.clearRect(0,0,innerWidth,innerHeight);}
  }
  function center(e){var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}

  // Hype machine: you send a compliment, Tab replies fast
  var ins=["you’re peak","best texter alive","3 fan clubs in ONE night??","the counter is crazy","never left me on read","fan club president reporting for duty","you deserve every bit of this glaze","ok but who’s next"];
  var outs=["Stop, I’m blushing 🥹","Adding that to my own fan club","Replied in 0.4s, for you","The typing indicator is crying","Framing this text","The raccoon says thank you too ☕","Glaze received. Glaze returned. 👑","You. It’s always you 👀"];
  var sent=0,busy=false;
  var hb=$("hypeBtn"),hl=$("hypeLine"),th=$("thread");
  function add(cls,text){var m=document.createElement("p");m.className="msg "+cls;m.textContent=text;th.appendChild(m);while(th.children.length>6) th.removeChild(th.firstChild);return m;}
  if(hb) hb.addEventListener("click",function(){
    if(busy) return;
    busy=true;
    var i=sent%ins.length;sent++;
    add("in",ins[i]);
    var c=center(hb);burst(c[0],c[1],110);
    var t0=performance.now();
    var typing=add("typing in","• • •");typing.setAttribute("aria-label","Tab is typing");
    setTimeout(function(){
      typing.remove();
      var secs=((performance.now()-t0)/1000).toFixed(1);
      add("out",outs[i]);
      hl.textContent=sent===1?"Tab replied in "+secs+" seconds. Industry average: “I’ll get back to you.”":sent+" compliments, "+sent+" replies, 0 left on read.";
      n+=1000*sent;paint();busy=false;
    },reduce?150:650+Math.random()*350);
  });

  // Join
  var jb=$("joinBtn"),jm=$("joined"),cn=$("cardNo"),joined=false;
  if(jb) jb.addEventListener("click",function(){
    var c=center(jb);burst(c[0],c[1],180);
    if(!joined){joined=true;n+=1;paint();
      var s=String(n).padStart(12,"0");
      if(cn) cn.textContent="MEMBER Nº "+s.slice(0,4)+" "+s.slice(4,8)+" "+s.slice(8);
      jm.textContent="Welcome, Fan #"+fmt(n)+". Tab will text you back in under a minute. Probably faster.";
      jb.textContent="You’re in. Press again to celebrate";}
    else{jm.textContent="Still a fan. Still texted back. Still under a minute.";}
  });

  setTimeout(function(){burst(innerWidth/2,innerHeight*0.3,90);},600);
})();
