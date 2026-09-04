import "./style.css";

const ICONS = "/assets/icons";
const SOUNDS = "/assets/sounds";

let myPiece, myObstacle=[], clouds=[], myBackground, planes=[], anotherPlanes=[], build=[];
let mySound, myMusic;
let score=document.getElementById("score");
let q = 0;
function startMove(){
	area.start();
	myMusic = new Sound(`${SOUNDS}/First fight.mp3`);
	//myMusic.Play();
	myPiece = new component(50,50,`${ICONS}/iron-man.png`,0,area.canvas.height/2,"image");
	myBackground = new  component(1000,500,`${ICONS}/bluesky4.png`,0,0,"background");
	mySound = new Sound(`${SOUNDS}/love me again.mp3`);
}
function Sound(src){
	this.sound=document.createElement("audio");
	this.sound.src=src;
	this.sound.setAttribute("preload","auto");
	this.sound.setAttribute("controls","none");
	this.sound.style.display="none";
	document.body.appendChild(this.sound);
	this.Play = function(){
		this.sound.play();// try to fix
	}
	this.stop = function(){
		this.sound.pause();
	}
}
let area = {
	canvas: document.createElement("canvas"),
	start: function(){
		this.canvas.width= 1000;
		this.canvas.height = 500;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateArea,20);
		this.frameNo = 0;
		window.addEventListener("keydown", function(e){
			area.key = (area.key || []);
			area.key[e.keyCode] = true;
		});
		window.addEventListener("keyup", function(e){
			area.key[e.keyCode] = false;
		});
	},
	clear: function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	},
	stop: function(){
		clearInterval(this.interval);
	}
}
function everyInterval(n){
	if((area.frameNo / n) % 1 ==0) return true;
	else return false;
}

function component(width, height, color, x, y,type){
 	this.type=type;
 	if(this.type=="image" || this.type== "background" || this.type=="cloud" || this.type=="plane" || this.type=="build"){
 		this.image= new Image();
 		this.image.src=color; 
 	}
 	this.width=width;
 	this.height=height;
 	this.speedX=0;
 	this.speedY=0;
 	this.x=x;
 	this.y=y;
 	this.update =  function(){
 		const ctx = area.context;
	 	if(this.type=="image" || this.type=="background"){
	 		ctx.drawImage(this.image, this.x,this.y,this.width,this.height);
	 		if(this.type=="background") ctx.drawImage(this.image,this.x+this.width,this.y,this.width,this.height);
	 	}
	 	else{
	 		if(this.type=="cloud") ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
	 		else if(this.type=="plane") ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
	 		else if(this.type=="build") ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
	 		else{
	 			ctx.fillStyle=color;
	 			ctx.fillRect(this.x,this.y,this.width,this.height);
	 		}
 		} 		
 	}
 	this.newPos = function(){
	 	this.x+=this.speedX;
	 	this.y+=this.speedY;
 	}
 	this.crashWith= function (obj){
 		let myleft = this.x;
 		let myright = this.x+ this.width;
 		let mytop = this.y;
 		let mybottom=this.y+this.height;
 		let objleft = obj.x;
 		let objright = obj.x+obj.width;
 		let objtop = obj.y;
 		let objbottom = obj.y + obj.height;
 		let crash=true;
 		if(mybottom < objtop || mytop > objbottom || myright<objleft || myleft>objright) crash = false;
 		return crash;
 	}
 	this.Pos = () => {if(this.type=="background") if(this.x==-(this.width)) this.x=0;}
}
function updateArea(){
 	let x,y;
 	myMusic.Play();
 	for(var i=0;i<myObstacle.length;i++){
		if(myPiece.crashWith(myObstacle[i])){
			myMusic.stop();
			mySound.Play();
	 		area.stop();
	 		return;
	 	}
 	}
 	for(var i=0;i<clouds.length;i++){
	 	if(myPiece.crashWith(clouds[i])){
	 		myMusic.stop();
	 		mySound.Play();
	 		area.stop();	
	 		return;
	 	}
 	}
 	for(var i=0;i<planes.length;i++){
	 	if(myPiece.crashWith(planes[i])){
	 		myMusic.stop();
	 		mySound.Play();
	 		area.stop();
	 		return;
	 	}
 	}
 	for(var i=0;i<anotherPlanes.length;i++){
	 	if(myPiece.crashWith(anotherPlanes[i])){
	 		myMusic.stop();
	 		mySound.Play();
	 		area.stop();
	 		return;
	 	}
 	}
 	for(var i=0;i<build.length;i++){
	 	if(myPiece.crashWith(build[i])){
	 		myMusic.stop();
	 		mySound.Play();
	 		area.stop();
	 		return;
	 	}
 	}
	area.clear();
	area.frameNo +=1;
	//myBackground.x+=-1;
	myBackground.Pos();
	myBackground.update();
	if(area.frameNo == 1 || everyInterval(myPiece.width*10)){
	 	x = area.canvas.width;
	 	y = area.canvas.height-320;
	 	myObstacle.push(new component(100,60,`${ICONS}/cloud.png`,x,y,"cloud"));
	}
	if(area.frameNo == 1 || everyInterval(myPiece.width*8)){
	 	x = area.canvas.width;
	 	y = area.canvas.height-450;
	 	clouds.push(new component(100,60,`${ICONS}/cloud.png`,x,y,"cloud"));
	}
	if(area.frameNo == 1 || everyInterval(myPiece.width*11)){
	 	x = area.canvas.width;
	 	y = area.canvas.height-370;
	 	planes.push(new component(80,30,`${ICONS}/plane.png`,x,y,"plane"));
	}
	if(area.frameNo == 1 || everyInterval(myPiece.width*15)){
	 	x = area.canvas.width;
	 	y = area.canvas.height-490;
	 	anotherPlanes.push(new component(100,30,`${ICONS}/plane.png`,x,y,"plane"));
	}
	if(area.frameNo == 1 || everyInterval(myPiece.width*2)){
	 	x = area.canvas.width;
	 	const minHeight=20;
	 	const maxHeight=300;
	 	const height=Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
	 	const minGap=20;
	 	const maxGap=300;
	 	const gap=Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
	 	build.push(new component(60,height,`${ICONS}/build.png`,x,500-height,"build"));
	}
	for(let i=0; i<myObstacle.length;i++){
	 	myObstacle[i].x+=-3;
	 	myObstacle[i].update();
	}
	for(let i=0; i<clouds.length;i++){
	 	clouds[i].x+=-3;
	 	clouds[i].update();
	}
	for(let i=0; i<planes.length;i++){
	 	planes[i].x+=-3;
	 	planes[i].update();
	}
	for(let i=0; i<anotherPlanes.length;i++){
	 	anotherPlanes[i].x+=-6;
	 	anotherPlanes[i].update();
	}
	for(let i=0; i<build.length;i++){
	 	build[i].x+=-2;
	 	build[i].update();
	}
  	myPiece.newPos();
	myPiece.speedX=0;//
	myPiece.speedY=0;//
	if(area.key && area.key[37]) {
		myPiece.image.src=`${ICONS}/iron-man(move-left).png`;
		myPiece.x=Math.max(myPiece.x,0);
		myPiece.speedX-=4;
	}
	if(area.key && area.key[38]) {
		myPiece.image.src=`${ICONS}/iron-man.png`;
		myPiece.y=Math.max(myPiece.y,0);
		myPiece.speedY-=4;
	}
	if(area.key && area.key[39]) {
		myPiece.image.src=`${ICONS}/iron-man(move).png`;
		myPiece.x=Math.min(myPiece.x,area.canvas.width-myPiece.width);
		myPiece.speedX+=4;
	}
	if(area.key && area.key[40]) {
		myPiece.image.src=`${ICONS}/iron-man(down).png`;
		myPiece.y = Math.min(myPiece.y,area.canvas.height-myPiece.height);
		myPiece.speedY+=4;
	}
	myPiece.update();
}
function moveUp() { myPiece.speedY -= 1; }
function moveDown() { myPiece.speedY += 1; }
function moveRight() { myPiece.speedX += 1; }
function moveLeft() { myPiece.speedX -= 1; }
function stopMove() { myPiece.speedX = 0; myPiece.speedY = 0; }

startMove();
