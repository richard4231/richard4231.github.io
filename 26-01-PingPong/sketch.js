"use strict"

var _audioCtx = null;
var t,
    counter,pos,oldpos,step,n,nn,r_k,dimx,R,ping,nping,npong,pong,r,
    schale,kor,
    fontA,
    s,x_,y_,
    speed,nspeed,
    blob,
    speedSlider,pingSlider,pongSlider,nSlider,myCanvas,
    soundCheckbox, soundOn = false,
    showhelp=false,
    SPEED_INV=80;

function drawKreis(k,rr){
   var x,y
   x=Math.round(Math.sin(k*2*Math.PI/n)*R);
   y=Math.round(Math.cos(k*2*Math.PI/n)*R);
   ellipse(x+width/2,y+height/2, rr, rr);
}

// Hintergrund Kreise
function kreiseZeichnen(){   
  noFill();
  stroke(229);
  var anzahlKreise = 44; // 10 mehr als vorher
  var abstand = 14;
  for (var i=0; i<anzahlKreise; i++){
     ellipse(width/2,height/2, 160+i*abstand, 160+i*abstand);
   }
}

function LinienZeichnen(){
  var x1,y1,x2,y2
  noFill();
  stroke(209);
  R = 60;
  var maxRadius = 160 + (44-1)*14; // wie größter Kreis
  for (var i=0; i<n; i++){
      x1=sin(i*2*PI/n)*(R+20);
      y1=cos(i*2*PI/n)*(R+20);  
      x2=sin(i*2*PI/n)*(maxRadius/2);
      y2=cos(i*2*PI/n)*(maxRadius/2); 
     line(width/2+x1,height/2+y1,width/2+x2,height/2+y2);   
   }
}

function initdraw(){  
  fill(color(255,140));
   smooth();
   stroke(0);
   strokeWeight(1);
  for (var i=0; i<n; i++){
       drawKreis(i,r_k);
  }
}

// Initialisierung den Hintergrund
function initbackground(){
 blob = color(160,160,160);
 kor=0;
 schale=0;
 background(255);
 smooth();
 noStroke();
 kreiseZeichnen();
 LinienZeichnen();
 fill(color(44,44,44));
 textAlign(LEFT);
 textSize(22);
 // s = "Press h for help";
 // text(s, 10, 790); 
}

// Anzeige oben links
function pingpongvalue(){
  // Anzeige auf Canvas entfernt, Werte werden im Value-Panel angezeigt
}

function setup(){
    // START init variables
    ping=3;
    pong=4;
    speed=3;
    pos=0;
    counter=1;
    step=1;
    n=8;
    r_k=22;
    myCanvas = createCanvas(800, 800);
    myCanvas.parent('canvasWrapper');
    initbackground();
    initdraw();
    s=counter.toString();
    pingpongvalue();

    // Panel-Elemente referenzieren
    speedSlider = select('#slidergamespeed');
    nSlider = select('#slidernumber');
    pingSlider = select('#sliderpingnumber');
    pongSlider = select('#sliderpongnumber');
    soundCheckbox = select('#soundCheckbox');

    // Label-Elemente
    let speedLabel = select('#labelgamespeed');
    let nLabel = select('#labelnumber');
    let pingLabel = select('#labelpingnumber');
    let pongLabel = select('#labelpongnumber');
    let valueN = select('#value_n');
    let valuePing = select('#value_ping');
    let valuePong = select('#value_pong');
    let valuePingPong = select('#value_pingpong');
  // PingPong-Zahl initial setzen
  valuePingPong.html(ping * pong);
    // Sound-Checkbox
    soundCheckbox.changed(() => {
      soundOn = soundCheckbox.elt.checked;
    });

    // Regler korrekt initialisieren (speed=3)
    speedSlider.value(3);
    speedLabel.html(3);
    setspeed(Math.round(1.0/3*SPEED_INV));

    // Event-Listener für Panel
    speedSlider.input(() => {
      speedLabel.html(speedSlider.value());
      setspeed(Math.round(1.0/speedSlider.value()*SPEED_INV));
    });
    nSlider.input(() => {
      nLabel.html(nSlider.value());
      setnumber(nSlider.value());
      valueN.html(nSlider.value());
      valuePingPong.html(pingSlider.value() * pongSlider.value());
    });
    pingSlider.input(() => {
      pingLabel.html(pingSlider.value());
      setpingnumber(pingSlider.value());
      valuePing.html(pingSlider.value());
      valuePingPong.html(pingSlider.value() * pongSlider.value());
    });
    pongSlider.input(() => {
      pongLabel.html(pongSlider.value());
      setpongnumber(pongSlider.value());
      valuePong.html(pongSlider.value());
      valuePingPong.html(pingSlider.value() * pongSlider.value());
    });

    // Initialwerte im Value-Panel setzen
    valueN.html(n);
    valuePing.html(ping);
    valuePong.html(pong);

    select("#btn_restart").mousePressed(restart);
    smooth();
}

function writeNum(){
    if ((counter%ping==0)&&(counter%pong==0)){
      s="PiPo";
      blob = color(230,0,0);
      kor=0;
      if (soundOn) playPiPoSound();
    }else{ 
     if (counter%ping==0) {
       s="Ping";
       blob = color(0,0,160);
       kor=3;
       step= step*(-1);
       schale=schale+1;
       if (soundOn) playPingSound();
     }else { 
       if(counter%pong==0){
         s="Pong";
         blob = color(0,160,0);
         kor=3;
         step = step*(-1);
         schale=schale+1;
         if (soundOn) playPongSound();
       }else{
         s=counter.toString();   
         blob = color(160,160,160);  
         kor=0;
       }
     }
    }
// Einfache Ping/Pong/PiPo Sounds mit Web Audio API
function playPingSound() {
  var ctx = getAudioCtx();
  var o = ctx.createOscillator();
  var g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = 660;
  g.gain.value = 0.12;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.08);
}

function playPongSound() {
  var ctx = getAudioCtx();
  var o = ctx.createOscillator();
  var g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = 440;
  g.gain.value = 0.12;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.08);
}

function playPiPoSound() {
  var ctx = getAudioCtx();
  var o = ctx.createOscillator();
  var g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = 880;
  g.gain.value = 0.18;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.13);
}

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}
} 
  
function drawcurve(){
    var r,w1,w2;
    r=R+20+schale*7;
    stroke(98);
    noFill();
    w1=(pos-step)*2*Math.PI/n;
    w2=pos*2*Math.PI/n;
    if (w1 > w2){
      arc(width/2,height/2, r*2, r*2,2.5*PI-w1,2.5*PI-w2);
    } else {
      arc(width/2,height/2, r*2, r*2,2.5*PI-w2,2.5*PI-w1);
    }
}
//Punkte Zeichnen
function drawblob(){
  var r,x,y
  r=R+20+schale*7;
  x=Math.round(Math.sin(pos*2*Math.PI/n)*(r-kor));
  y=Math.round(Math.cos(pos*2*Math.PI/n)*(r-kor)); 
  fill(blob);
  noStroke();
  ellipse(x+width/2,y+height/2, 8, 8);
}


// Main LOOP
function draw(){
  // Panel-gesteuerte Werte werden direkt über Events gesetzt
  if (frameCount%speed==0){
    fill(color(255,255,255));
    drawKreis(pos,r_k*0.90);
    counter = counter + 1;
    pos = pos+step;
    fill(color(117,215,0));
    drawKreis(pos,r_k*0.90);
    drawcurve();
    writeNum();
    drawblob();
    x_=width/2-20;
    y_=height/2+10;
    fill(255);
    noStroke();
    rect(x_,y_-30,58,50);
    fill(44);
    text(s,x_,y_);
  }
}

// Methods
function incnumber(){
  n++;
  n = constrain(n, 1, 35);
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function setnumber(numb){
  n=numb;
  n = constrain(n, 1, 35);
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function decnumber(){
  n--;
  n = constrain(n, 1, 35);
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function incping(){
  ping++;
  
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function setpingnumber(pingnumb){
  ping=pingnumb
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function decping(){
  ping--;
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function incpong(){
  pong++;
  n = constrain(n, 1, 35);
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function setpongnumber(pongnumb){
  pong=pongnumb
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function restart(){
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function decpong(){
  pong--;
  n = constrain(n, 1, 35);
  counter = 1;pos=0;step=1;
  initbackground();
  initdraw();
  pingpongvalue();
}

function setspeed(sp){
  // speed = Math.round(1.0/sp * SPEED_INV);
  speed = sp;
  pingpongvalue();
}

