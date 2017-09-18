/*
 * 组件api说明
 * 	1、依赖move.js，组件前一定要引入move.js
 * 	2、轮播图需要有一个父级，这个父级一定要给一个id
 * 我的总结：
 * 1、写组件一定要window.Carousel=Carousel;记得在末尾加上这一句
 * 2、所有事件里面的功能都单独写成一个函数，放在原型身上，当要用的时候就去调一下这个函数，避免互相影响
 */

;(function(window,undefined){
	var Carousel=function(){
		this.settings={
			id:'pic',				//轮播图父级的id，必需传的参数
			autoplay:true,			//自动播放，true为自动，false为不自动，默认为true
			intervalTime:1000,		//间隔时间，运动后停顿的时间，默认1s
			loop:true,				//循环播放，true为循环，false为不循环，默认为true
			totalNum:5,				//图片总量
			moveNum:1,				//单次运动的图片数量（图片总量必须为运动数量的整倍数）
			circle:true,			//小圆点功能，true为显示，false为不显示，默认显示
			moveWay:'opacity'		//运动方式，opacity为透明度过渡，position为位置过渡
		};
	};
	Carousel.prototype={
		constructor:Carousel,
		init:function(opt){
			var opt=opt||this.settings;
			
			for(var attr in opt){
				this.settings[attr]=opt[attr];
			};
			this.createDom();
		},
		createDom:function(){
			var This=this;
			this.box=document.getElementById(this.settings.id);
			//创建上一个按钮
			this.prevBtn=document.createElement('div');
			this.prevBtn.className='prev';
			this.prevBtn.onclick=function(){
				This.prev();
				//调用自定义事件
				This.trigger('leftClick');
			}

			this.box.appendChild(this.prevBtn);
			
			//创建下一个按钮
			this.nextBtn=document.createElement('div');
			this.nextBtn.className='next';
			this.nextBtn.onclick=function(){
				This.next();
				This.trigger('rightClick');//调用自定义事件
			};
		
			this.box.appendChild(this.nextBtn);
			
			//创建圆点的父级
			this.circleWrap=document.createElement('div');
			this.circleWrap.className='circle';
			this.circles=[];
			//生成圆点
			for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
				var span=document.createElement('span');
				span.index=i;
				
				span.onmouseenter=function(){
					This.cn=this.index;
					This[This.settings.moveWay+'Fn']();
					
				};
				this.circleWrap.appendChild(span);
				this.circles.push(span);
			};
			this.circles[0].className='active'
			
			if(this.settings.circle){
				this.box.appendChild(this.circleWrap)
			};
			this.moveInit()
		},
		//运动的初始参数，页面加载完的初始状态，把这些和运动的过程分开写，减少错误
		moveInit:function(){
			this.cn=0;//当前索引值
			this.ln=0;//上一个索引值
			this.canClick=true;//阻止用户连续点击出现错误
			this.endNum=this.settings.totalNum/this.settings.moveNum;//运动停止的条件(8/4=2)
			this.opacityItem=this.box.children[0].children;//运动透明度的元素(banner图)
			//运动position的元素
			this.positionWrap=this.box.children[0].children[0];//运动position的元素的父级
			this.positionItem=this.positionWrap.children;//运动position的元素
			
			
			//判断何种运动
			switch(this.settings.moveWay){
				case 'opacity':
				for(var i=0;i<this.opacityItem.length;i++){
					this.opacityItem[i].style.opacity=0;
					this.opacityItem[i].style.transition='.3s opacity'
				}
				this.opacityItem[0].style.opacity=1;
				break;
				case 'position':
				//取元素真实宽度，包含margin的
				var leftMargin=parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
				var rightMargin=parseInt(getComputedStyle(this.positionItem[0]).marginRight);
				this.singleWidth=leftMargin+this.positionItem[0].offsetWidth+rightMargin;
				
				//当loop为true。则需要循环切换
				if(this.settings.loop){
					this.positionWrap.innerHTML+=this.positionWrap.innerHTML;
				}
				//需要循环就改变父级的宽度
				this.positionWrap.style.width=this.singleWidth*this.positionItem.length+'px';
				break
			}
			if(this.settings.autoplay){
				this.autoPlay();
			}
		},
		//运动的函数单独写，在点击的时候调一下就好了
		//这个是透明度运动
		opacityFn:function(){
			if(this.cn<0){
				//当图片运动到该方向的最后一张，判断是否需要循环
				if(this.settings.loop){
					this.cn=this.endNum-1
				}else{
					this.cn=0;
					this.canClick=true;
				}
			}
			
			if(this.cn>this.endNum-1){
				if(this.settings.loop){
					this.cn=0;
				}else{
					this.cn=this.endNum-1;
					this.canClick=true;
				}
			}
			
			this.opacityItem[this.ln].style.opacity=0;
			this.circles[this.ln].className='';
			
			this.opacityItem[this.cn].style.opacity=1;
			this.circles[this.cn].className='active';
			
			this.ln=this.cn;
			
			
			var This=this;
			var em=0;//避免addEventListener事件多次触发，给一个条件
			this.opacityItem[this.cn].addEventListener('transitionend',function(){
				em++
				if(em==1){
					This.canClick=true;//在当前运动完成以后再改变This.canClick的值为true，才能进行下一次的运动，可以避免疯狂点击页面出错
				}
				This.endFn();//调用自定义事件
			});
		},
		//这个是位置运动
		positionFn:function(){
			if(this.cn<0){
				//当图片运动到该方向的最后一张，判断是否需要循环
				if(this.settings.loop){
					this.positionWrap.style.left=-this.positionWrap.offsetWidth/2+'px';
					this.cn=this.endNum-1
				}else{
					this.cn=0;
				}
			}
			
			if(this.cn>this.endNum-1 && !this.settings.loop){
					this.cn=this.endNum-1;
			}
			var This=this;
			move(this.positionWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},300,'linear',function(){
				
				if(This.cn==This.endNum){
					//这个条件成立，说明现在已经到了第二份的第一屏了
					this.style.left=0;
					This.cn=0;
				}
				This.endFn();//调用自定义事件
				This.canClick=true;
				This.ln=This.cn;
				
			});
			
			
		},
		prev:function(){
			if(!this.canClick){
				return
			}
			this.canClick=false;
			this.cn--;
			
			this[this.settings.moveWay+'Fn']();
		},
		next:function(){
			if(!this.canClick){
				return
			}
			this.canClick=false;
			this.cn++;
			this[this.settings.moveWay+'Fn']();
		},
		//定义自定义事件
		on:function(type,listener){
			this.events=this.events||{};
			this.events[type]=this.events[type]||[];
			this.events[type].push(listener);
		},
		//自定义事件触发器
		trigger:function(type){
			if(this.events&&this.events[type]){
				for(var i=0;i<this.events[type].length;i++){
					this.events[type][i].call(this);
				};
			};
		},
		//添加自定义事件,该事件针对运动到了最后要触发的事件
		endFn:function(){
			if(!this.settings.loop){
				if(this.cn==0){
					this.trigger('leftEnd');
				};
				if(this.cn==this.endNum-1){
					this.trigger('rightEnd');
				};
				
			};
		},
		autoPlay:function(){
			var This=this;
			this.timer=setInterval(function(){
				This.next();
			},this.settings.intervalTime);
			this.box.onmouseenter=function(){
				clearInterval(This.timer);
				This.timer=null;
			}
			this.box.onmouseleave=function(){
				This.autoPlay()
			}
		}
	}
	
	window.Carousel=Carousel;
})(window,undefined)
