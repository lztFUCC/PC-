yx.public.navFn();
yx.public.backUpFn();

console.log(productList);
//解析url
var params=yx.parseUrl(window.location.href);//结果是params={id: "1143021"}

var pageId=params.id;//产品对应的id

var curData=productList[pageId];//产品对应的数据总集合，所有的数据都在这里面

//404页面出现的条件,id不对或id对了，但id下的内容不对应
if(!pageId || !curData){
	window.location.href='404.html';
}

//通过获取数据生成面包屑，获取元素，在拼接元素的innerHTML
var positionFn=yx.g('#position');

positionFn.innerHTML='<a href="#">首页</a> >';
	
for(var i=0;i<curData.categoryList.length;i++){
	positionFn.innerHTML+='<a href="#">'+curData.categoryList[i].name+'</a> >';
};
positionFn.innerHTML+=curData.name;

//生成产品图片功能
/*
 * 先获取到对应的元素，再操作元素的src属性更改图片路径
 * 需要单独写在
 */
(function(){
	var bigImg=yx.g('#productImg .left img');
	var smallImg=yx.ga('.smallImg img');
	
	bigImg.src=smallImg[0].src=curData.primaryPicUrl;
	
	var last=smallImg[0];	
	for(var i=0;i<smallImg.length;i++){
		if(i){
			//这个条件满足的话，说明现在是后四张图片
			smallImg[i].src=curData.itemDetail['picUrl'+i];
		}
		smallImg[i].onmouseenter=function(){
			bigImg.src=this.src;
			last.className='';
			this.className='active';
			last=this;
		}
	};
	
	yx.g('#productImg .info h2').innerHTML=curData.name;
	yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
	yx.g('#productImg .price').innerHTML='<div><span>售价</span><strong>'+'¥'+curData.retailPrice+'</strong></div><div><span>促销</span><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="tag">'+curData.hdrkDetailVOList[0].activityType+'</a><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="discount">'+curData.hdrkDetailVOList[0].name+'</a></div><div><span>服务</span><a href="#" class="service"><i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营品牌</a></div>'
	
	//创建规格
	var format=yx.g('#productImg .fomat');
	var dds=[];	
	for(var i=0;i<curData.skuSpecList.length;i++){
		var dl=document.createElement('dl');
		var dt=document.createElement('dt');
		
		//以手机壳页面为例，dt里面是型号，颜色这个级别的分类，dd里面是他们的细分
		dt.innerHTML=curData.skuSpecList[i].name;
		dl.appendChild(dt);
		
		
		for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
			var dd=document.createElement('dd');
			dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
			dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id);
			
			dd.onclick=function(){
				changeProduct.call(this)
			}
			
			
			dds.push(dd);//把循环创建的四个dd标签丢进一个数组里面，后面要用到
			dl.appendChild(dd);
		}
		format.appendChild(dl);
		
	}
	//console.log(dds)
	
	function changeProduct(){
		//如果不能点击的话就结束
		if(this.className.indexOf('noclick')!=-1){
			return;
		}
		
		var curId=this.getAttribute('data-id');
		
		var otherDd=[];
		var allId=[];
		
		//如何取到当前选中物品的所有分类的ID，用forin可以取到
		for(var attr in curData.skuMap){
			if(attr.indexOf(curId)!=-1){
	//此时console.log(attr)显示1132095;1132097和 1132095;1132098，说明已经获取到了需要的数据
				//console.log(attr)
	//接着拆分，我需要后面的数据，也就是1132097这个位置上的数据，用replace来替换掉1132095这个位置上的数据就实现了。
				var otherId=attr.replace(curId,'').replace(';','');
				//console.log(otherId)
		//通过对方的id找到对方的dd
				for(var i=0;i<dds.length;i++){
					if(dds[i].getAttribute('data-id')==otherId){
						otherDd.push(dds[i]);
					}
				}
				 //把找到的所有组合的id放在数组里
				 allId.push(attr);
			}
			//console.log(otherDd)
			
		};
		//console.log(allId);
		//点击的功能
		/*
		 * 点击的时候判断
		 * 	1、自己是末选中状态
		 * 		1、兄弟节点
		 * 			有选中的话要取消选中，有不能点击的不用处理
		 * 		2、自己选中
		 * 		3、对方节点
		 * 			先去掉有noclick的class的元素，再给不能点击的加上noclick
		 * 		
		 * 	2、自己是选中状态
		 * 		1、取消自己选中
		 * 			（兄弟节点不用处理）
		 * 		2、对方节点
		 * 			如果有不能点击的要去掉noclick的class
		 */
		
		
		var brothers=this.parentNode.querySelectorAll('dd');
		
		
		if(this.className=='active'){
			this.className='';
			
			for(var i=0;i<otherDd.length;i++){
				if(otherDd[i].className=='noclick'){
					otherDd[i].className='';
				}
			}
		}else{
			//末选中状态
			for(var i=0;i<brothers.length;i++){
				if(brothers[i].className=='active'){
					brothers[i].className='';
				}
			}
			
			this.className='active';
			
			for(var i=0;i<otherDd.length;i++){
				if(otherDd[i].className=='noclick'){
					otherDd[i].className='';
				}
				if(curData.skuMap[allId[i]].sellVolume===0){
					otherDd[i].className='noclick';
				}
			}
		}

		addNum();
	};
	
	
	addNum();
	function addNum(){
		actives=yx.ga('#productImg .fomat .active');
		btnPars=yx.g('#productImg .number div');
		btns=btnPars.children;
		//console.log(btns)
		if(actives.length==curData.skuSpecList.length){
			btnPars.className='';
		}else{
			btnPars.className='noClick';
		}
		
		btns[0].onclick=function(){
			if(btnPars.className){
				return
			};
			btns[1].value--;
			if(btns[1].value<0){
				btns[1].value=0
			};
		};
		
		btns[1].onfocus=function(){
			
			if(btnPars.className){
				this.blur();
			};
			
		}
		
		btns[2].onclick=function(){
			if(btnPars.className){
				return
			};

			btns[1].value++;
		}
	}	
})();



//加入购物车功能
/*
 * 获取到选中的规格，选中的数量，把他们加入缓存
 */
(function(){
	yx.public.shopFn();
	
	
	var joinbtn=yx.g('.btn .join');
	//console.log(joinbtn)
	joinbtn.onclick=function(){
		var actives=yx.ga('#productImg .fomat .active');
		var selectNum=yx.g('#productImg .number input').value;
		
		if(actives.length<curData.skuSpecList.length ||selectNum<1){
			alert('请选择正确的规格及数量');
			return;
		}
		
		var id='';//
		var spec=[];//选中的规格可能有多个，需要放到数组里
		
		//循环选中的元素来获取他们身上的id，因为他们选中的时候就已经添上了对应的id
		for(var i=0;i<actives.length;i++){
			id+=actives[i].getAttribute('data-id')+';';
			spec.push(actives[i].innerHTML);
		}
		
		//去掉最后一个分号
		id=id.substring(0,id.length-1);
		
		var select={
			"id":id,
			"name":curData.name,
			"price":curData.retailPrice,
			"num":selectNum,
			"spec":spec,
			"img":curData.skuMap[id].picUrl,
			"sign":"productLocal"		//给自己的local取一个标识，避免取到其它人的local
		};
		
		localStorage.setItem(id,JSON.stringify(select));
		//localStorage.clear()
		//console.log(localStorage)
		yx.public.shopFn();
		
		var cartWrap=yx.g('.carWrap');
		cartWrap.onmouseenter();
		setTimeout(function(){
			yx.g('.cart').style.display='none';
		},2000);
		
	}
	
})();

//生成大家都在看
(function(){
	var ul=yx.g('#look ul');
	var str='';
	for(var i=0;i<recommendData.length;i++){
		str+='<li><a href="#"><img src="'+recommendData[i].listPicUrl+'"/></a><a href="#">'+recommendData[i].name+'</a><span>¥'+recommendData[i].retailPrice+'</span></li>';
	}
	ul.innerHTML=str;
	
	var allLook=new Carousel();
	allLook.init({
		id:'allLook',
		autoplay:true,
		intervalTime:2000,
		loop:true,
		totalNum:8,
		moveNum:1,
		circle:false,
		moveWay:'position'
	})
})();

//详情功能
(function(){
	var as=yx.ga('#bottom .title a');
	var tbas=yx.ga('#bottom .content>div');
	
	var ls=0;
	for(var i=0;i<as.length;i++){
		as[i].index=i;
		as[i].onclick=function(){
			as[ls].className='';
			tbas[ls].style.display='none';
			
			this.className='active';
			tbas[this.index].style.display='block'
			ls=this.index;
		}
		
	}
	
	//生成详情表格
	var tbody=yx.g('.details tbody');//获取表格区域
	
	for(var i=0;i<curData.attrList.length;i++){
		
		
		if(i%2==0){
			var tr=document.createElement('tr');
		}
		
		var td1=document.createElement('td');;
		td1.innerHTML=curData.attrList[i].attrName;
		var td2=document.createElement('td');
		td2.innerHTML=curData.attrList[i].attrValue;
		
		tr.appendChild(td1);
		tr.appendChild(td2)
		tbody.appendChild(tr);
		
	}
	
	//生成详情图片
	var img=yx.g('.details .img');
	
	//产品图片存放地址curData.itemDetail.detailHtml
	img.innerHTML=curData.itemDetail.detailHtml;
})();

//评价功能
(function(){
	//修改标题上的文字
	var evaluateNum=commentData[pageId].data.result.length;  //评论的数量
	var evaluateText=evaluateNum>1000?'999+':evaluateNum;
	yx.ga('#bottom .title a')[1].innerHTML='评价<span>('+evaluateText+')</span>';
	
	var allData=[[],[]];   //二维数组，第一个代表全部评价，第二个代表有图的评价
	for(var i=0;i<evaluateNum;i++){
		allData[0].push(commentData[pageId].data.result[i]);
		
		if(commentData[pageId].data.result[i].picList.length){
			allData[1].push(commentData[pageId].data.result[i]);
		}
	}
	yx.ga('#bottom .eTitle span')[0].innerHTML='全部('+allData[0].length+')';
	yx.ga('#bottom .eTitle span')[1].innerHTML='有图('+allData[1].length+')';
	
	var curData=allData[0];   //当前显示的那个数据
	var btns=yx.ga('#bottom .eTitle div');
	var ln=0;
	
	for(var i=0;i<btns.length;i++){
		btns[i].index=i;
		btns[i].onclick=function(){
			btns[ln].className='';
			this.className='active';
			
			ln=this.index;
			
			curData=allData[this.index];
			showComment(10,0);
			
			createPage(10,curData.length);//根据有图和全部生成页码
		}
	}
	console.log(yx)
	//显示评价内容
	showComment(10,0);
	function showComment(pn,cn){
		//  一页显示几条
		//  现在选中的页面
		
		var ul=yx.g('#bottom .border>ul');
		var dataStart=pn*cn;		//数据起始值
		var dataEnd=dataStart+pn;	//数据结束值
		
		if(dataEnd>curData.length){
			dataEnd=curData.length;
		}
		
		var str='';
		ul.innerHTML='';
		
		for(var i=dataStart;i<dataEnd;i++){
			var avatart=curData[i].frontUserAvatat?curData[i].frontUserAvatat:'images/avatar.png';
			
			
			var smallImg='';		//小图的父级，要放在if外面
			var dialog='';		//轮播图的父级，要放在if外面
			
			if(curData[i].picList.length){
				var span='';
				var li='';
				for(var j=0;j<curData[i].picList.length;j++){
					span+='<span><img src="'+curData[i].picList[j]+'" alt=""></span>';
					li+='<li><img src="'+curData[i].picList[j]+'" alt=""></li>';
				}
				smallImg='<div class="smallImg clearfix">'+span+'</div>';
				dialog='<div class="dialog" id="commmetImg'+i+'" data-imgnum="'+curData[i].picList.length+'"><div class="carouselImgCon"><ul>'+li+'</ul></div><div class="close">X</div></div>';
			}
			
			
			str+='<li>'+
					'<div class="avatar">'+
						'<img src="'+avatart+'" alt="">'+
						'<a href="#" class="vip1"></a><span>'+curData[i].frontUserName+'</span>'+
					'</div>'+
					'<div class="text">'+
						'<p>'+curData[i].content+'</p>'+smallImg+
						'<div class="color clearfix">'+
							'<span class="left">'+curData[i].skuInfo+'</span>'+
							'<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+
						'</div>'+dialog+
					'</div>'+
				'</li>';
		};
		ul.innerHTML=str;
		showImg();
	};
	
	function showImg(){
		var spans=yx.ga('#bottom .smallImg span');
		for(var i=0;i<spans.length;i++){
			spans[i].onclick=function(){
				var dialog=this.parentNode.parentNode.lastElementChild;//找到轮播图区域的父级
				dialog.style.opacity=1;
				dialog.style.height='510px';
				
				var en=0;
				
				//运动transition属性,
				dialog.addEventListener('transitionend',function(){
					en++;
					if(en==1){
						var id=this.id;
						var commentImg=new Carousel();
						commentImg.init({
							id:id,
							totalNum:dialog.getAttribute('data-imgnum'),
							autoplay:false,
							loop:false,
							moveNum:1,
							circle:false,
							moveWay:'position'
						});
					};
				});
				
				
				var closeBtn=dialog.querySelector('.close');
				closeBtn.onclick=function(){
					dialog.style.opacity=0;
					dialog.style.height=0;
				};
			};
		};
	};
	
	createPage(10,curData.length)
	function createPage(pn,tn){
		//pn			显示页码的数量
		//tn			数据的总数
		var page=yx.g('.page');
		var totalNum=Math.ceil(tn/pn);		//最多能显示的页码数量
		
		//如果用户给的页数比总页数还要大，就改成总数
		if(pn>totalNum){
			pn=totalNum;
		}
		page.innerHTML='';
		
		var cn=0;		//当前点击的页码的索引
		var spans=[];	//把数字的页码都放在一个数组里，其它的地方要用到
		var div=document.createElement("div");//数字的父级
		div.className='mainPage';
		
		var indexPage=pageFn('首页',function(){
			
		});
		for(var i=0;i<pn;i++){
			var span=document.createElement('span');
			span.index=i;
			span.innerHTML=i+1;
			spans.push(span);
			
			span.className=i?'':'active';
			span.onclick=function(){
				cn=this.index;
				showComment(10,this.innerHTML-1);
				changePage()
			};
			div.appendChild(span);
		}
		page.appendChild(div);
		
		var indexPage=pageFn('尾页',function(){
			
		});
		
		//更新页码功能
		function changePage(){
			
			var cur=spans[cn];				//当前点击的那个页码
			var curInner=cur.innerHTML;		//因为后面会修改，所以存一下当前点击的页码的内容
			var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;
			
			//点击的是最后面的页码（页码要增加）
			if(cur.index==spans.length-1){
				if(Number(cur.innerHTML)+differ>totalNum){
					differ=totalNum-cur.innerHTML;
					//如果加上差值后的页码要比总页码还要大，说明右边已经超过总页码了，那就需要重新设置一下差值
				}
			}
			if(cur.index==0){
				if(cur.innerHTML-differ<1){
					differ=cur.innerHTML-1;
				}
			}
			for(var i=0;i<spans.length;i++){
				//更新页码的值，加上differ
				if(cur.index==spans.length-1){
					spans[i].innerHTML=Number(spans[i].innerHTML)+differ;
				}
				
				if(cur.index==0){
					spans[i].innerHTML-=differ;
				}
				
				//设置class
				spans[i].className='';
				if(spans[i].innerHTML==curInner){
					spans[i].className='active';
					cn=spans[i].index;
				}				
			}
		}
		//创建页码的公用函数
		function pageFn(inner,fn){
			if(pn<2){			//如果页码数量没超过2页就不创建功能页码
				return;
			}
			
			var span=document.createElement("span");
			span.innerHTML=inner;
			span.onclick=fn;
			page.appendChild(span);
			
			return span;			//把创建的标签返回出去，在外面能用得到
		}
	}
})();
	