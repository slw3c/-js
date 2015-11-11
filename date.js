(function($){
	$.fn.mdater = function(config){
		var defaults = {
		
			maxDate : null,
			minDate : new Date(),
			getData :null,
			checkInDate:null,
			checkOutDate:null
		};
		var option = $.extend(defaults, config);
		var input = this;

		//通用函数
		var F = {
			//计算某年某月有多少天
			getDaysInMonth : function(year, month){
			    return new Date(year, month+1, 0).getDate();
			},
			//计算某月1号是星期几
			getWeekInMonth : function(year, month){
				return new Date(year, month, 1).getDay();
			},
			getMonth : function(m){
				return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'][m];
			},
			//计算年某月的最后一天日期
			getLastDayInMonth : function(year, month){
				return new Date(year, month, this.getDaysInMonth(year, month));
			}
		};
		
		//为$扩展一个方法，以配置的方式代理事件
		$.fn.delegates = function(configs) {//[function(){...},function(){...}]
		    el = $(this[0]);
		    for (var name in configs) {
		        var value = configs[name];
		        if (typeof value == 'function') {
		            var obj = {};
		            obj.tap = value;
		            value = obj; //vaule= {tap:function(){...}}
		        }
		        for (var type in value) {
		            el.delegate(name, type, value[type]);
		        }
		    }
		    return this;
		};
		function initTest(){
				var a = 0;
				return a
			};
		this.mdater = {
			value : {
				year : '',
				month : '',
				date : ''
			},
			lastCheckedDate : '',
			init : function(){
				this.initListeners();
				this.initEvents();
			},
			renderHTML : function(){
				var $html = $(
				
				'<div class="md_head"><div class="md_selectarea"><a class="md_headtext yeartag" href="javascript:void(0);"></a><a class="md_headtext monthtag" href="javascript:void(0);">月</a></div></div>'+
				'<div class="md_body"><ul class="md_datearea in">'+
				'<div class="md_next_head"><div class="md_selectarea"><a class="md_headtext yearsecondtag" href="javascript:void(0);"></a><a class="md_headtext monthsecondtag" href="javascript:void(0);">月</a></div></div>'+
				'</ul>'+
				'</div>');
				if($('.md_head').length==0){$(".md_content").html($html);}
				return $html;
			},
			_showPanel : function(container){
				this.refreshView();
				$('.md_panel, .md_mask').addClass('show');
			},
			_hidePanel : function(){
				$('.md_panel, .md_mask').remove();
				$('.shophome_time').remove();
			},
			_changeMonth : function(add, checkDate){

				//先把已选择的日期保存下来
				this.saveCheckedDate();

				var monthTag = $('.md_selectarea').find('.monthtag'),
					nextMonthTag = $('.md_selectarea').find('.monthsecondtag'),
					num = ~~monthTag.data('month')+add,
					nextNum = ~~nextMonthTag.data('month')+add+1;
				//月份变动发生了跨年
				if(num>11){
					num = 0;
					this.value.year++;
					$('.yeartag').text(this.value.year).data('year', this.value.year);
					$('.yearsecondtag').text(this.value.year).data('year', this.value.year);

					
				}
				else if(num<0){
					num = 11;
					this.value.year--;
					$('.yeartag').text(this.value.year).data('year', this.value.year);
				}

				var nextMonth = F.getMonth(num)+'月';
				monthTag.text(nextMonth).data('month', num);
				nextMonthTag.text(nextMonthTag).data('month', nextNum);

				this.value.month = num;
				if(checkDate){
					this.value.date = checkDate;
				}
				else{
					//如果有上次选择的数据，则进行赋值
					this.setCheckedDate();
				}
				this.updateDate(add);
			},
			_changeYear : function(add){
				//先把已选择的日期保存下来
				this.saveCheckedDate();

				var yearTag = $('.md_selectarea').find('.yeartag'),
					num = ~~yearTag.data('year')+add;
				yearTag.text(num+'年').data('year', num);
				this.value.year = num;

				this.setCheckedDate();

				this.updateDate(add);
			},
			//入住与离店的样式变化
			_checkInOutRemoveStyle:function(param){
				        var nodeLi =param.parents(".md_panel").find("li");
				                nodeLi.removeClass("one");
				                nodeLi.find("div.price_wrap").removeClass("hidden");
				                nodeLi.find("b").text("");
				      },
			_checkInShowFn:function(param){
				        param.addClass("one");
				        param.find("div.price_wrap").addClass("hidden");
				        param.find("b").text("入住");
				        this.checkInDate = param.find(".num").text();
					    this.checkInDateData = this.value.date;
				        this.currentCheckInIndex = param.parents(".md_panel").find("li.one").index();
				         var checkInIndex = param.parents(".md_panel").find("li.one").index();
				         for (var i = 0; i < checkInIndex; i++) {
				          // param.parent().find("li").eq(i).removeClass("oneday").addClass("disable");
				         }
				      },
			_checkInOutRemoveStyle:function(param){
				        var nodeLi =param.parents(".md_panel").find("li");
				                nodeLi.removeClass("one");
				                nodeLi.find("div.price_wrap").removeClass("hidden");
				                nodeLi.find("b").text("");
				      },
			//保存上一次选择的数据
			saveCheckedDate : function(){
				if(this.value.date){
					this.lastCheckedDate = {
						year : this.value.year,
						month : this.value.month,
						date : this.value.date
					};
				}
			},
			//将上一次保存的数据恢复到界面
			setCheckedDate : function(){
				if(this.lastCheckedDate && this.lastCheckedDate.year==this.value.year && this.lastCheckedDate.month==this.value.month){
					this.value.date = this.lastCheckedDate.date;
				}
				else{
					this.value.date = '';
				}
			},
			//根据日期得到渲染天数的显示的HTML字符串
			getDateStr : function(y, m, d){

				var dayStr = '';
				//计算1号是星期几，并补上上个月的末尾几天
				var week = F.getWeekInMonth(y, m);
				var lastMonthDays = F.getDaysInMonth(y, m-1);
				for(var j=week-1; j>=0; j--){
					dayStr += '<li class="prevdate" data-day="'+(lastMonthDays-j)+'">'+(lastMonthDays-j)+'</li>';
				}
				//再补上本月的所有天;
				var currentMonthDays = F.getDaysInMonth(y, m);
				//判断是否超出允许的日期范围
				var startDay = 1,
					startDisableDay = 1,
					endDay = currentMonthDays,
					thisDate = new Date(y, m, d),
					firstDate = new Date(y, m, 1),
					lastDate =  new Date(y, m, currentMonthDays),
					minDateDay = option.minDate.getDate();


				if(option.minDate>lastDate){
					startDay = currentMonthDays+1;
				}
				else if(option.minDate>=firstDate && option.minDate<=lastDate){
					startDay = minDateDay;
				}
				//var maxReceiverData = option.maxDate;
				var maxReceiverData = new Date(new Date().getFullYear(),(new Date().getMonth()+1),(15-(F.getDaysInMonth(new Date().getFullYear(), new Date().getMonth())-new Date().getDate())));
				if(maxReceiverData){
					var maxDateDay = maxReceiverData.getDate();
					if(maxReceiverData<firstDate){
						endDay = startDay-1;
					}
					else if(maxReceiverData>=firstDate && maxReceiverData<=lastDate){
						endDay = maxDateDay;
					}
				}


				//将日期按允许的范围分三段拼接

				//
				for(var i=1; i<startDay; i++){
					dayStr += '<li class="disabled" data-day=" '+y+'-'+(m+1)+'-'+i+'">'+i+'</li>';
				}
				//可预定的15天
				// for(var s=1; s<option.datasDateList.length; s++){
				// 	if(m+1==option.datasDateList[s].date.split("-")[1]){
				// 	dayStr += '<li class="one" data-day="'+option.datasDateList[s].date.split("-")[2]+'">'+option.datasDateList[s].date.split("-")[2]+'</li>';
				// 	startDisableDay = startDisableDay + s;
				// 	}
				// }
				//
				// for(var j=startDay; j<=endDay; j++){
				// 	var current = '';
				// 	if(y==this.value.year && m==this.value.month && d==j){
				// 		current = 'current';
				// 	}
				// 	dayStr += '<li class="'+current+'" data-day="'+j+'">'+j+'</li>';
				// }
				//
				//不可预定的15天后的第一天为startDisableDay
				for(var j=startDay; j<=endDay; j++){
					var current = '',
						checkClass ='',
						checkWord ='',
						price = '',
						hidden = '',
						oneday = '';


					if(y==this.value.year && m==this.value.month && d==j){
						//current = 'current';
					}
					//console.log(option.datasDateList)
					var dataLimite = option.datasDateList;
					if(_.indexOf(dataLimite, j) != -1) {
							oneday = "oneday";
							price = (option.priceData)[dataLimite.indexOf(j)];
						}else{
							oneday = "disabled";
					}
					if(option.checkInDate!=null&&option.checkInDate.split("-")[0]==y&&option.checkInDate.split("-")[1]==(m+1)&&option.checkInDate.split("-")[2]==j){
						checkClass = 'one';
						checkWord = "入住";
						hidden = 'hidden';
					}
					if(option.checkOutDate!=null&&option.checkOutDate.split("-")[0]==y&&option.checkOutDate.split("-")[1]==(m+1)&&option.checkOutDate.split("-")[2]==j){
						checkClass = 'one';
						checkWord = "离开";
						hidden = 'hidden';
					}
					dayStr += 
					//'<li class="'+current+'one" data-day="'+j+'">'+j+'</li>';
					'<li class="'+current+' '+checkClass+' '+oneday+' " data-day="'+y+'-'+(m+1)+'-'+j+'">'+
					'<div>'+
					'<p class="num">'+j+'</p>'+
					'<p class="date-text"></p>'+
					'<div class="price_wrap '+hidden+'">'+price+'</div>'+
					'<b>'+checkWord+'</b>'+
					'</div>'+
					'</li>';
				}
				for(var k=endDay+1; k<=currentMonthDays; k++){
					dayStr += '<li class="disabled" data-day="'+y+'-'+(m+1)+'-'+k+'">'+k+'</li>';
				}

				//再补上下个月的开始几天
				var nextMonthStartWeek = (currentMonthDays + week) % 7;
				if(nextMonthStartWeek!==0){
					for(var i=1; i<=7-nextMonthStartWeek; i++){
						dayStr += '<li class="nextdate" data-day="'+y+'-'+(m+1)+'-'+i+'">'+i+'</li>';
					}
				}

				return dayStr;
			},
			updateDate : function(add){
				var dateArea = $('.md_datearea.in');
				var c1, c2;
				if(add == 1){
					c1 = 'out_left';
					c2 = 'out_right';
				} else{
					c1 = 'out_right';
					c2 = 'out_left';
				}
				var newDateArea = $('<ul class="md_datearea '+c2+'"></ul>');
				newDateArea.html(this.getDateStr(this.value.year, this.value.month, this.value.date));
				$('.md_body').append(newDateArea);
				setTimeout(function(){
					newDateArea.removeClass(c2).addClass('in');
					dateArea.removeClass('in').addClass(c1);
				}, 0);

			},
			//每次调出panel前，对界面进行重置
			refreshView : function(){
				var initVal = "2015-10-28",
					date = null;
				if(initVal){
					var arr = initVal.split('-');
					date = new Date(arr[0], arr[1]-1 , arr[2]);
				}
				else{
					date = new Date();
				}
				var y = this.value.year = date.getFullYear(),
					m = this.value.month = date.getMonth(),
					d = this.value.date = date.getDate();
				$('.yeartag').text(y+'年').data('year', y);
				$('.yearsecondtag').text(y+'年').data('year', y);

				$('.monthtag').text(F.getMonth(m+1)+'月').data('month', m+1);
				$('.monthsecondtag').text(F.getMonth(m+2)+'月').data('month', m+2);

				var dayStr = this.getDateStr(y, m+1, d);
				var nextDayStr =  this.getDateStr(y, m+2, d);
				$(".md_next_head").before(dayStr);
				$(".md_next_head").after(nextDayStr);
				//$(".md_head").append(nextDayStr);
			},
			input : null,//暂存当前指向input
			initListeners : function(){
				var _this = this;
				
					_this.input = $(this);//暂存当前指向input
				
						_this.renderHTML();
					
							_this._showPanel();
						
			},
			initEvents:function(){
				var _this = this;
				
				$('.change_month').click(function(){
						var add = $(this).hasClass('md_next') ? 1 : -1;
						_this._changeMonth(add);
				});
				$('.change_year').click(function(){
						var add = $(this).hasClass('md_next') ? 1 : -1;
						_this._changeYear(add);
				});
					
				$('li.oneday').click(function(){
						var $this = $(this);

						if($this.hasClass('disabled')){
							return;
						}
						_this.value.date = $this.data('day');
						//判断是否点击的是前一月或后一月的日期
						var add = 0;
					
							
						var currentIndex = $this.index();
					        var allLi = $this.parents(".md_panel").find("li");
					        var hasCheckLength = $this.parents(".md_panel").find("li.one").length;
					        
					            if(currentIndex<_this.currentCheckInIndex){
					             _this._checkInOutRemoveStyle($this);

					              $this.addClass("one");
					              $this.find("div.price_wrap").addClass("hidden");
					              $this.find("b").text("入住");
					              _this.checkInDate = $this.find(".num").text();
					              _this.checkInDateData = _this.value.date;
					              _this.currentCheckInIndex = currentIndex;
					              return false;
					            }
					            if(hasCheckLength==0) {
					            	_this._checkInShowFn($this);
					            }else if($this.hasClass("one")==0 && hasCheckLength==1){
					              $this.addClass("one");
					              $this.find("div.price_wrap").addClass("hidden");
					              $this.find("b").text("离店");
					              _this.checkOutDate = $this.find(".num").text();
					              _this.checkOutDateData = _this.value.date;
					            }else if(hasCheckLength>=2){
					             _this._checkInOutRemoveStyle($this);
					              $this.parents(".md_panel").find("li").removeClass("one");
					              $this.find("div.price_wrap").removeClass("hidden");
					              $this.find("b").text("");
					              _this._checkInShowFn($this);
					             
					            }
						
				});
					
				
					
			},
			btnCancel:function(){
				this._hidePanel();
			},
			btnSure:function(){
				var _this = this;
				var tip = true;
				if(_this.checkInDateData&&!_this.checkOutDateData){
					tip = false;
				}else if(_this.checkInDateData){
					tip = true;
						var checkInDateData = _this.checkInDateData.split("-")[0]+"-"+_this.checkInDateData.split("-")[1]+"-"+(((_this.checkInDateData.split("-")[2]).length)==1?0+_this.checkInDateData.split("-")[2]:_this.checkInDateData.split("-")[2]);
						var checkOutDateData = _this.checkOutDateData.split("-")[0]+"-"+_this.checkOutDateData.split("-")[1]+"-"+(((_this.checkOutDateData.split("-")[2]).length)==1?0+_this.checkOutDateData.split("-")[2]:_this.checkOutDateData.split("-")[2]);
						var userCheckDate = {
							checkIn:checkInDateData,
							checkOut:checkOutDateData
						};
						 sessionStorage.setItem("userCheckDate",JSON.stringify(userCheckDate));//存入住和离店的日期，下次点击选择日期的时候默认此日期
						_this._hidePanel();
					}else{
						_this._hidePanel();
					}
					return tip;
				},
			
		};
		this.mdater.init();
	};
})($);
