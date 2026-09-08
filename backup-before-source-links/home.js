const canvas=document.querySelector('#growth');
const ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let w=0,h=0,px=0,py=0,targetX=0,targetY=0,start=performance.now();
function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);if(reduced)draw(start+5000)}
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();targetX=(e.clientX-r.left-w/2)/w;targetY=(e.clientY-r.top-h/2)/h});
canvas.addEventListener('pointerleave',()=>{targetX=0;targetY=0});
function draw(now){ctx.clearRect(0,0,w,h);px+=(targetX-px)*.045;py+=(targetY-py)*.045;const t=reduced?5:(now-start)/1000;const grow=Math.min(t/3,1);const scale=Math.min(w/520,h/540);ctx.save();ctx.translate(w*.5,h*.88);ctx.scale(scale,scale);
const glow=ctx.createRadialGradient(0,-220,20,0,-220,260);glow.addColorStop(0,'#b4ef5a12');glow.addColorStop(1,'#b4ef5a00');ctx.fillStyle=glow;ctx.fillRect(-280,-520,560,560);
ctx.strokeStyle='#63764b';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(0,6,150,24,0,0,Math.PI*2);ctx.stroke();
function branch(x,y,len,angle,depth,seed){if(depth===0)return;const progress=Math.max(0,Math.min(1,grow*7-(6-depth)));const sway=Math.sin(t*.65+seed)*.025+px*.24;const a=angle+sway;const nx=x+Math.cos(a)*len*progress,ny=y+Math.sin(a)*len*progress;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a-.15)*len*.5,y+Math.sin(a-.15)*len*.5,nx,ny);ctx.strokeStyle=depth>3?'#8ca66b':'#c3f56b';ctx.lineWidth=depth*.55;ctx.stroke();if(progress<1)return;if(depth<=3){ctx.save();ctx.translate(nx,ny);ctx.rotate(a+py*.3);ctx.beginPath();ctx.ellipse(0,-5,16-depth*2,4.5,0,0,Math.PI*2);ctx.fillStyle=depth===1?'#d6ff8c':'#8bc34b';ctx.fill();ctx.restore()}branch(nx,ny,len*.75,a-.46,depth-1,seed+1.7);branch(nx,ny,len*.72,a+.5,depth-1,seed+3.2)}
branch(0,0,105,-Math.PI/2,6,1);ctx.restore();if(!reduced)requestAnimationFrame(draw)}
new ResizeObserver(resize).observe(canvas);resize();if(!reduced)requestAnimationFrame(draw);
