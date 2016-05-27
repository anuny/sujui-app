define(function(require, exports, module) {
	var DESKTOP={
		config:{
			element:{
				desktop:$('#desktop'),
				background:$('#desktop .background'),
				desktopIcon:$('#desktop .ico'),
				icons:$('#desktop>.ico>ul>li')
			},
			icons:{
				width:100,
				height:100,
				animate:true,
				animateSpeed:300,
				icoPosition:[]
			}
		},
		icons:{
			sort:function(config){
				var CONFIG=DESKTOP.config,
				CONFIGICON=CONFIG.icons,
				ELEMENT=CONFIG.element,
				width=config.width||CONFIGICON.width,
				height=config.height||CONFIGICON.height,
				desktopIcon= ELEMENT.desktopIcon,
				icons=ELEMENT.icons,
				animate=config.hasOwnProperty('animate')?config.animate:CONFIGICON.animate,
				animateSpeed=config.animateSpeed||CONFIGICON.animateSpeed,
				hoverStyle=config.hoverStyle||'current',
				clickStyle=config.clickStyle||'click',
				dbclickStyle=config.dblclickStyle||'dbclick',
				rightclickStyle=config.rightclickStyle||'dbclick',
				n=parseInt(desktopIcon.outerHeight()/height);
				function Click(){
				}
				function dblClick(){
				}
				function rightClick(){
				}
				icons.each(function(i) {
					var thisIco=$(this),
					thisLeft=parseInt(i/n)*width+15,
					thisTop=i%n*height+15,
					iconStyle={'left':thisLeft+'px','top':thisTop+'px','opacity':1};
					animate?thisIco.animate(iconStyle,animateSpeed):thisIco.css(iconStyle);
					ELEMENT.icons[i].index=i;
					CONFIGICON.icoPosition[i]={'left':thisLeft,'top':thisTop};
					DESKTOP.icons.drag(icons[i]);
					thisIco.on('hover',function(){
						thisIco.addClass(hoverStyle).siblings('li').removeClass(hoverStyle);
					},function(){
						thisIco.removeClass(hoverStyle)
					})
					.on('mousedown',function(e){
						thisIco.addClass(clickStyle).siblings('li').removeClass(clickStyle)	;
						if(1 == e.which){ 
						   Click()
						}else if(3 == e.which){
							rightClick()
						}; 
					})
					.on('dblclick',function(){
						thisIco.addClass(dbclickStyle).siblings('li').removeClass(dbclickStyle);
						dblClick();
					});
					ELEMENT.desktop.on('mouseup',function(){
						icons.removeClass(clickStyle).removeClass(dbclickStyle);
					})
				});
			},
			drag:function(ico){
				var icons=DESKTOP.config.element.icons,
				icoPosition=DESKTOP.config.icons.icoPosition,
				iconMX = 0,
				iconMY = 0,
				minZindex = 1;
				ico.onmousedown = function(event){
					if(3 == event.which) return ;
					var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
					var scrollLeft = document.documentElement.scrollLeft||document.body.scrollLeft;
					ico.style.zIndex = minZindex++;
					//当鼠标按下时计算鼠标与拖拽对象的距离
					iconMX = event.clientX +scrollLeft-ico.offsetLeft;
					iconMY = event.clientY +scrollTop-ico.offsetTop;
					document.onmousemove=function(event){
						//当鼠标拖动时计算div的位置
						var l = event.clientX -iconMX +scrollLeft;
						var t = event.clientY -iconMY + scrollTop;
						ico.style.left = l + "px";
						ico.style.top = t + "px";
						for(var i=0;i<icons.length;i++){
							icons[i].className = "";
						};
						var oNear = findMin(ico);
						if(oNear){
							oNear.className = "active";
						}
					};
					document.onmouseup = function(){
						document.onmousemove = null;//当鼠标弹起时移出移动事件
						document.onmouseup = null;//移出up事件，清空内存
						//检测是否普碰上，在交换位置
						var oNear = findMin(ico);
						if(oNear){
							oNear.className = "";
							oNear.style.zIndex = minZindex++;
							ico.style.zIndex = minZindex++;
							startMove(oNear,icoPosition[ico.index]);
							startMove(ico,icoPosition[oNear.index]);
							//交换index
							oNear.index += ico.index;
							ico.index = oNear.index - ico.index;
							oNear.index = oNear.index - ico.index;
						}else{
	
							startMove(ico,icoPosition[ico.index]);
						}
					};
					clearInterval(ico.timer);
					return false;//低版本出现禁止符号
				};
				//碰撞检测
				function colTest(ico_a,ico_b){
					var t1 = ico_a.offsetTop;
					var r1 = ico_a.offsetWidth+ico_a.offsetLeft;
					var b1 = ico_a.offsetHeight+ico_a.offsetTop;
					var l1 = ico_a.offsetLeft;
					var t2 = ico_b.offsetTop;
					var r2 = ico_b.offsetWidth+ico_b.offsetLeft;
					var b2 = ico_b.offsetHeight+ico_b.offsetTop;
					var l2 = ico_b.offsetLeft;
					return(t1>b2||r1<l2||b1<t2||l1>r2)?false:true;
				}
				//勾股定理求距离
				function getDis(ico_a,ico_b){
					var a = ico_a.offsetLeft-ico_b.offsetLeft;
					var b = ico_a.offsetTop-ico_b.offsetTop;
					return Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
				}
				//找到距离最近的
				function findMin(ico){
					var minDis = 999999999;
					var minIndex = -1;
					for(var i=0;i<icons.length;i++){
						if(ico==icons[i])continue;
						if(colTest(ico,icons[i])){
							var dis = getDis(ico,icons[i]);
							if(dis<minDis){
								minDis = dis;
								minIndex = i;
							}
						}
					};
					return (minIndex==-1)?null:icons[minIndex]
				}	
			
			
				function getStyle(ico,attr){//解决JS兼容问题获取正确的属性值
					return ico.currentStyle?ico.currentStyle[attr]:getComputedStyle(ico,false)[attr];
				};
				
				function startMove(ico,thisPosition,fun){
					clearInterval(ico.timer);
					ico.timer = setInterval(function(){
						var isStop = true;
						for(var attr in thisPosition){
							var iCur = 0;
							//判断运动的是不是透明度值
							iCur =parseInt(attr=="opacity"?(parseFloat(getStyle(ico,attr))*100):getStyle(ico,attr));
							var ispeed = (thisPosition[attr]-iCur)/8;
							//运动速度如果大于0则向下取整，如果小于0想上取整；
							ispeed = ispeed>0?Math.ceil(ispeed):Math.floor(ispeed);
							//判断所有运动是否全部完成
							if(iCur!=thisPosition[attr]){
								isStop = false;
							};
							//运动开始
							if(attr=="opacity"){
								ico.style.filter = "alpha:(opacity:"+(thisPosition[attr]+ispeed)+")";
								ico.style.opacity = (thisPosition[attr]+ispeed)/100;
							}else{
								ico.style[attr] = iCur+ispeed+"px";
							}
						};
						//判断是否全部完成
						isStop&&(clearInterval(ico.timer),fun&&fun())
					},30);
				}
			}
		},
		background:function(){
			var num = 100;
			var w = window.innerWidth;
			var h = window.innerHeight;
			var max = 100;
			var _x = 0;
			var _y = 0;
			var _z = 150;
			var dtr = function(d) {
				return d * Math.PI / 180;
			};
			var canvas ;
			DESKTOP.config.element.background.append('<canvas id="background-canv"></canvas>')
			var rnd = function() {
				return Math.sin(Math.floor(Math.random() * 360) * Math.PI / 180);
			};
			var dist = function(p1, p2, p3) {
				return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
			};
			
			var cam = {
				obj: {
					x: _x,
					y: _y,
					z: _z
				},
				dest: {
					x: 0,
					y: 0,
					z: 1
				},
				dist: {
					x: 0,
					y: 0,
					z: 200
				},
				ang: {
					cplane: 0,
					splane: 0,
					ctheta: 0,
					stheta: 0
				},
				zoom: 1,
				disp: {
					x: w / 2,
					y: h / 2,
					z: 0
				},
				upd: function() {
					cam.dist.x = cam.dest.x - cam.obj.x;
					cam.dist.y = cam.dest.y - cam.obj.y;
					cam.dist.z = cam.dest.z - cam.obj.z;
					cam.ang.cplane = -cam.dist.z / Math.sqrt(cam.dist.x * cam.dist.x + cam.dist.z * cam.dist.z);
					cam.ang.splane = cam.dist.x / Math.sqrt(cam.dist.x * cam.dist.x + cam.dist.z * cam.dist.z);
					cam.ang.ctheta = Math.sqrt(cam.dist.x * cam.dist.x + cam.dist.z * cam.dist.z) / Math.sqrt(cam.dist.x * cam.dist.x + cam.dist.y * cam.dist.y + cam.dist.z * cam.dist.z);
					cam.ang.stheta = -cam.dist.y / Math.sqrt(cam.dist.x * cam.dist.x + cam.dist.y * cam.dist.y + cam.dist.z * cam.dist.z);
				}
			};
			
			var trans = {
				parts: {
					sz: function(p, sz) {
						return {
							x: p.x * sz.x,
							y: p.y * sz.y,
							z: p.z * sz.z
						};
					},
					rot: {
						x: function(p, rot) {
							return {
								x: p.x,
								y: p.y * Math.cos(dtr(rot.x)) - p.z * Math.sin(dtr(rot.x)),
								z: p.y * Math.sin(dtr(rot.x)) + p.z * Math.cos(dtr(rot.x))
							};
						},
						y: function(p, rot) {
							return {
								x: p.x * Math.cos(dtr(rot.y)) + p.z * Math.sin(dtr(rot.y)),
								y: p.y,
								z: -p.x * Math.sin(dtr(rot.y)) + p.z * Math.cos(dtr(rot.y))
							};
						},
						z: function(p, rot) {
							return {
								x: p.x * Math.cos(dtr(rot.z)) - p.y * Math.sin(dtr(rot.z)),
								y: p.x * Math.sin(dtr(rot.z)) + p.y * Math.cos(dtr(rot.z)),
								z: p.z
							};
						}
					},
					pos: function(p, pos) {
						return {
							x: p.x + pos.x,
							y: p.y + pos.y,
							z: p.z + pos.z
						};
					}
				},
				pov: {
					plane: function(p) {
						return {
							x: p.x * cam.ang.cplane + p.z * cam.ang.splane,
							y: p.y,
							z: p.x * -cam.ang.splane + p.z * cam.ang.cplane
						};
					},
					theta: function(p) {
						return {
							x: p.x,
							y: p.y * cam.ang.ctheta - p.z * cam.ang.stheta,
							z: p.y * cam.ang.stheta + p.z * cam.ang.ctheta
						};
					},
					set: function(p) {
						return {
							x: p.x - cam.obj.x,
							y: p.y - cam.obj.y,
							z: p.z - cam.obj.z
						};
					}
				},
				persp: function(p) {
					return {
						x: p.x * cam.dist.z / p.z * cam.zoom,
						y: p.y * cam.dist.z / p.z * cam.zoom,
						z: p.z * cam.zoom,
						p: cam.dist.z / p.z
					};
				},
				disp: function(p, disp) {
					return {
						x: p.x + disp.x,
						y: -p.y + disp.y,
						z: p.z + disp.z,
						p: p.p
					};
				},
				steps: function(_obj_, sz, rot, pos, disp) {
					var _args = trans.parts.sz(_obj_, sz);
					_args = trans.parts.rot.x(_args, rot);
					_args = trans.parts.rot.y(_args, rot);
					_args = trans.parts.rot.z(_args, rot);
					_args = trans.parts.pos(_args, pos);
					_args = trans.pov.plane(_args);
					_args = trans.pov.theta(_args);
					_args = trans.pov.set(_args);
					_args = trans.persp(_args);
					_args = trans.disp(_args, disp);
					return _args;
				}
			};
			
			(function() {
				"use strict";
				var threeD = function(param) {
					this.transIn = {};
					this.transOut = {};
					this.transIn.vtx = (param.vtx);
					this.transIn.sz = (param.sz);
					this.transIn.rot = (param.rot);
					this.transIn.pos = (param.pos);
				};
			
				threeD.prototype.vupd = function() {
					this.transOut = trans.steps(
			
					this.transIn.vtx, this.transIn.sz, this.transIn.rot, this.transIn.pos, cam.disp);
				};
			
				var Build = function() {
					this.vel = 0.04;
					this.lim = 360;
					this.diff = 200;
					this.initPos = 100;
					this.toX = _x;
					this.toY = _y;
					this.go();
				};
			
				Build.prototype.go = function() {
					this.canvas = document.getElementById("background-canv");
					canvas = this.canvas;
					this.canvas.width = window.innerWidth;
					this.canvas.height = window.innerHeight;
					this.$ = this.canvas.getContext("2d");
					this.$.globalCompositeOperation = 'source-over';
					this.varr = [];
					this.dist = [];
					this.calc = [];
			
					for (var i = 0,
					len = num; i < len; i++) {
						this.add();
					}
			
					this.rotObj = {
						x: 0,
						y: 0,
						z: 0
					};
					this.objSz = {
						x: w / 5,
						y: h / 5,
						z: w / 5
					};
				};
			
				Build.prototype.add = function() {
					this.varr.push(new threeD({
						vtx: {
							x: rnd(),
							y: rnd(),
							z: rnd()
						},
						sz: {
							x: 0,
							y: 0,
							z: 0
						},
						rot: {
							x: 20,
							y: -20,
							z: 0
						},
						pos: {
							x: this.diff * Math.sin(360 * Math.random() * Math.PI / 180),
							y: this.diff * Math.sin(360 * Math.random() * Math.PI / 180),
							z: this.diff * Math.sin(360 * Math.random() * Math.PI / 180)
						}
					}));
					this.calc.push({
						x: 360 * Math.random(),
						y: 360 * Math.random(),
						z: 360 * Math.random()
					});
				};
			
				Build.prototype.upd = function() {
					cam.obj.x += (this.toX - cam.obj.x) * 0.05;
					cam.obj.y += (this.toY - cam.obj.y) * 0.05;
				};
			
				Build.prototype.draw = function() {
					this.$.clearRect(0, 0, this.canvas.width, this.canvas.height);
					cam.upd();
					this.rotObj.x += 0.1;
					this.rotObj.y += 0.1;
					this.rotObj.z += 0.1;
			
					for (var i = 0; i < this.varr.length; i++) {
						for (var val in this.calc[i]) {
							if (this.calc[i].hasOwnProperty(val)) {
								this.calc[i][val] += this.vel;
								if (this.calc[i][val] > this.lim) this.calc[i][val] = 0;
							}
						}
			
						this.varr[i].transIn.pos = {
							x: this.diff * Math.cos(this.calc[i].x * Math.PI / 180),
							y: this.diff * Math.sin(this.calc[i].y * Math.PI / 180),
							z: this.diff * Math.sin(this.calc[i].z * Math.PI / 180)
						};
						this.varr[i].transIn.rot = this.rotObj;
						this.varr[i].transIn.sz = this.objSz;
						this.varr[i].vupd();
						if (this.varr[i].transOut.p < 0) continue;
						var g = this.$.createRadialGradient(this.varr[i].transOut.x, this.varr[i].transOut.y, this.varr[i].transOut.p, this.varr[i].transOut.x, this.varr[i].transOut.y, this.varr[i].transOut.p * 2);
						this.$.globalCompositeOperation = 'lighter';
						g.addColorStop(0, 'hsla(255, 255%, 255%, 1)');
						g.addColorStop(.5, 'hsla(' + (i + 2) + ',85%, 40%,1)');
						g.addColorStop(1, 'hsla(' + (i) + ',85%, 40%,.5)');
						this.$.fillStyle = g;
						this.$.beginPath();
						this.$.arc(this.varr[i].transOut.x, this.varr[i].transOut.y, this.varr[i].transOut.p * 2, 0, Math.PI * 2, false);
						this.$.fill();
						this.$.closePath();
					}
				};
				Build.prototype.anim = function() {
					window.requestAnimationFrame = (function() {
						return window.requestAnimationFrame ||
						function(callback, element) {
							window.setTimeout(callback, 1000 / 60);
						};
					})();
					var anim = function() {
						this.upd();
						this.draw();
						window.requestAnimationFrame(anim);
					}.bind(this);
					window.requestAnimationFrame(anim);
				};
			
				Build.prototype.run = function() {
					this.anim();
			
					window.addEventListener('mousemove',
					function(e) {
						this.toX = (e.clientX - this.canvas.width / 2) * -0.8;
						this.toY = (e.clientY - this.canvas.height / 2) * 0.8;
					}.bind(this));
					window.addEventListener('touchmove',
					function(e) {
						e.preventDefault();
						this.toX = (e.touches[0].clientX - this.canvas.width / 2) * -0.8;
						this.toY = (e.touches[0].clientY - this.canvas.height / 2) * 0.8;
					}.bind(this));
					/*window.addEventListener('mousedown',
					function(e) {
						for (var i = 0; i < 100; i++) {
							this.add();
						}
					}.bind(this));
					window.addEventListener('touchstart',
					function(e) {
						e.preventDefault();
						for (var i = 0; i < 100; i++) {
							this.add();
						}
					}.bind(this));*/
				};
				var app = new Build();
				app.run();
			})();
			window.addEventListener('resize',
			function() {
				canvas.width = w = window.innerWidth;
				canvas.height = h = window.innerHeight;
			},
			false);
		}
	};
	
	
	return {
		icons:DESKTOP.icons.sort,
		background:DESKTOP.background
		}
});
