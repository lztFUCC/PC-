window.yx={
	g:function(name){
		return document.querySelector(name);
	},
	ga:function(name){
		return document.querySelectorAll(name);
	},
	addEvent:function(obj,ev,fn){
		if(obj.addEventListener){
			obj.addEventListener(ev,fn);
		}else{
			obj.attachEvent('on'+ev,fn);
		}
	},
	removeEvent:function(obj,ev,fn){
		if(obj.removeEventListener){
			obj.removeEventListener(ev,fn);
		}else{
			obj.detachEvent('on'+ev,fn);
		}
	},
	
	//获取某个元素距离HTML标签的距离
	getTopValue:function(obj){
		var top=0;
		while(obj.offsetParent){
			//obj.offsetParent：判断传进来的元素，离他最近的父级有没有定位
			//top+=obj.offsetTop：就把这个元素离这个父级的高度给top，没有的话就是取他离HTML的距离。
			//obj=obj.offsetParent：用这个父级替换掉原来的元素
			//因为是加等于，所以会一直执行到条件判断的元素没有父级为止，也就是到html才会停
			top+=obj.offsetTop;
			obj=obj.offsetParent;
		};
		return top;
	},
	
	//倒计时
	cutTime:function(target){	
		var currentDate=new Date();
		var v=Math.abs(target-currentDate);
		
		return {
			d:parseInt(v/(24*3600000)),
			h:parseInt(v%(24*3600000)/3600000),
			m:parseInt(v%(24*3600000)%3600000/60000),
			s:parseInt(v%(24*3600000)%3600000%60000/1000)
		};
	},
	//给时间补0
	format:function(v){		
		return v<10?'0'+v:v;
	},
	formatDate:function(time){
		var d=new Date(time);
		return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
	},
	//把url后面的参数解析成对象
	parseUrl:function(url){
		var reg=/(\w+)=(\w+)/ig;
		var result={};
		
		url.replace(reg,function(a,b,c){
			result[b]=c;
		});
		return result;
	},
	
	//公用方法
	public:{
		//导航功能
		navFn:function(){
			var nav=yx.g('.nav');
			var lis=yx.ga('.navBar li');
			var subNav=yx.g('.subNav');
			var uls=yx.ga('.subNav ul')
			var newLis=[];
			
			
			for(var i=1;i<lis.length-3;i++){
				newLis.push(lis[i]);
			}
			
			for(var i=0;i<newLis.length;i++){
				newLis[i].index=uls[i].index=i;
				newLis[i].onmouseenter=uls[i].onmouseenter=function(){
					newLis[this.index].className='active';
					subNav.style.opacity=1;
					uls[this.index].style.display='block';
				};
				newLis[i].onmouseleave=uls[i].onmouseleave=function(){
					newLis[this.index].className='';
					subNav.style.opacity=0;
					uls[this.index].style.display='none';
				};
			};
			
			//往下翻调出吸顶导航
			yx.addEvent(window,'scroll',setNavPos);
			setNavPos();
			function setNavPos(){
				if(window.pageYOffset>nav.offsetTop){
					nav.id='navFix';
				}else{
					nav.id='';
				}
			};
			
			
		},
		//购物车
		shopFn(){
			(function(local){
				//购物车加商品
				var totalPrice=0;		//商品合计
				var ul=yx.g('.cart ul');
				var li='';
				ul.innerHTML='';
				for(var i=0;i<local.length;i++){
					var attr=local.key(i);
					var value=JSON.parse(local[attr]);
					//console.log(local.key(i))
					if(value&&value.sign=='productLocal'){
						//这个条件成立说明现在拿到的local不是空的，并且是我们主动添加的local
						li+='<li data-id="'+value.id+'">'+
								'<a href="#" class="img"><img src="'+value.img+'"/></a>'+
								'<div class="message">'+
									'<p><a href="#">'+value.name+'</a></p>'+
									'<p>'+value.spec.join(' ')+' x '+value.num+'</p>'+
								'</div>'+
								'<div class="price">¥'+value.price+'.00</div>'+
								'<div class="close">X</div>'+
							'</li>';	
							totalPrice+=parseFloat(value.price)*Number(value.num);
					}
				}
				ul.innerHTML=li;
				
				//购物车上的红圈里的数字变化，总价根据商品数量变化
				productNum=ul.children.length;			//买了几个商品
				yx.g('.carWrap i').innerHTML=productNum;
				yx.g('.carWrap .total span').innerHTML='¥'+totalPrice+'.00';	//更新总价格
				
				//购物车删除商品
				var colseBtns=yx.ga('.cart .list .close');
				for(var i=0;i<colseBtns.length;i++){
					colseBtns[i].onclick=function(){
						localStorage.removeItem(this.parentNode.getAttribute('data-id'))
						yx.public.shopFn()
						
						if(ul.children.length==0){
							yx.g('.cart').style.display='none'
						}
					};
				}
				
				//给小红圈添加事件
				var cartWrap=yx.g('.carWrap');
				var timer;	//问题：鼠标离开购物车图标的时候，弹出层就消失了， 用一个延时定时器可以解决，把鼠标离开要做的事情放在一个延迟定时器里，鼠标放上去的时候就清除这个定时器，离开再加上
				
				
				
					cartWrap.onmouseenter=function(){
						//当购物车里面有东西才显示弹出层
						if(ul.children.length>0){
							clearTimeout(timer);
							yx.g('.cart').style.display='block'
						}
						
					};
				
					cartWrap.onmouseleave=function(){
						
						timer=setTimeout(function(){
							yx.g('.cart').style.display='none';
						},100)
					}
				
			})(localStorage)
		},
		
		
		//图片懒加载
		lazyImgFn:function(){
			yx.addEvent(window,'scroll',delayImg);
			delayImg();
			function delayImg(){
				var originals=yx.ga('.original');
				var scrollTop=window.innerHeight+window.pageYOffset;
				
				
				for(var i=0;i<originals.length;i++){
					if(yx.getTopValue(originals[i])<scrollTop){
						originals[i].src=originals[i].getAttribute('data-original');
						//如果这个图片的地址已经换成真实的地址了，那就把它身上的class去掉，为了不重复获取这张图片
						originals[i].removeAttribute('class');
					}
				}
				if(originals[originals.length-1].getAttribute('src')!="images/empty.gif"){
					yx.removeEvent(window,'scroll',delayImg);
				}
			};
		},
		
		//回到顶部功能
		backUpFn:function(){			
			var back=yx.g('.back');
			var timer;
			back.onclick=function(){
				var top=window.pageYOffset;
				
				timer=setInterval(function(){
					top-=150;
					if(top<=0){
						top=0;
						clearInterval(timer);
					}
					
					window.scrollTo(0,top);
				},16);
			};
		}
	}
	

}
