
const c=document.getElementById('c'),x=c.getContext('2d');function R(){c.width=innerWidth;c.height=innerHeight}onresize=R;R();
let bx=c.width/2,by=120,vy=0,score=0;
function tap(){vy=-10;score++;s.textContent=score}
addEventListener('pointerdown',tap);
function f(){vy+=0.5;by+=vy;if(by>c.height-20){score=0;s.textContent=0;by=120;vy=0}
x.clearRect(0,0,c.width,c.height);x.beginPath();x.arc(bx,by,20,0,7);x.fillStyle='white';x.fill();requestAnimationFrame(f)}
f();
