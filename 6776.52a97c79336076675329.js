(self.webpackChunkfurniture_studio=self.webpackChunkfurniture_studio||[]).push([[6776],{6776:(e,t,r)=>{"use strict";r.r(t),r.d(t,{createSwipeBackGesture:()=>s});var n=r(1843),a=r(8520);r(6953);const s=(e,t,r,s,i)=>{const u=e.ownerDocument.defaultView;return(0,a.createGesture)({el:e,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:e=>e.startX<=50&&t(),onStart:r,onMove:e=>{s(e.deltaX/u.innerWidth)},onEnd:e=>{const t=u.innerWidth,r=e.deltaX/t,a=e.velocityX,s=a>=0&&(a>.2||e.deltaX>t/2),o=(s?1-r:r)*t;let c=0;if(o>5){const e=o/Math.abs(a);c=Math.min(e,540)}i(s,r<=0?.01:(0,n.j)(0,r,.9999),c)}})}}}]);