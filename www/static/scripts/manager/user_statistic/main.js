require.config({
  baseUrl: '/static/scripts',
});
require(['common'],function () {
	require(['jquery','datepicker'], function($) {
    	config = {
			locale: 'zh-cn',
			format:'YYYY-MM-DD',
			sideBySide:true,
			showClear:true,
			showTodayButton:true,
			showClose:true,
			useCurrent: false
		};
	    $('#startDate').datetimepicker(config);
	    $('#endDate').datetimepicker(config);
	});

	require(['jquery', 'json','mock','mockjax'],
		function($,_,mock,mockjax) {
		var commonQueryUrl = 'user/commonQuery';
		var groupQueryUrl = 'user/groupQuery';
		var productUrl = 'user/product';
		var channelUrl = 'user/channel';

		simulateData();
		initSelectList($('#product'),productUrl,'所有游戏');
		initSelectList($('#channel'),channelUrl,'所有渠道');
		$('#product').change(function(){
			//var lastSelectProduct = $('#product').prop("value");
			//if (lastSelectProduct != $(this).prop("lastSelectProduct")) {
			//	$(this).prop("lastSelectProduct",lastSelectProduct);
				var param = {product:$('#product').prop("value")};
				initSelectList($('#channel'),channelUrl,'所有渠道',param);
			//}
		});

		function initSelectList(selectObj,postUrl,title,postData) {
			$.ajax({
				url:  postUrl,
				timeout: 1000,
				type: 'POST',
				dataType :'json',
				data: postData,
				success: function (data) {
					selectObj.empty();
					selectObj.append("<option>"+ title + "</option>");
					$.each(data.data, function(i,item){
						selectObj.append("<option value=" + item.id + ">" + item.name + "</option>");
					});
				}
			});
		};

		function simulateData() {
			var productList ={data:[{id:1,name:'破阵'},{id:2,name:'大唐'}]};
			var	channelList ={data:[{id:1,name:'苹果'},{id:2,name:'腾讯'}]};

			var productHandle = $.mockjax({
				url: productUrl,
				responseText: JSON.stringify(productList)
			});
			$.mockjax.clear(productHandle);

			var channelHandle = $.mockjax({
				url: channelUrl,
				responseText: JSON.stringify(channelList)
			});
			$.mockjax.clear(channelHandle);
		};

	});

	require(['jquery','common/base', 'json','bootstrap','moment','paginator','mock','mockjax','spin'],
		function($,base,_,_,moment,_,mock,mockjax,spin) {

		initStatisticData(1,false);
		initDataTriggerEvent();

		function simulateData() {
			var jsonValue =
			{
				totalPages:1,
				data:
				[
					{
						productName:'大唐双龙传',
						channelName:'苹果渠道',
						loginRequestIdCount:1,
						newUserCount:1,
						newMobileCount:1,
						time:'2013/03/29 19:00:00'
					}
				]
			};

			var handle = $.mockjax({
				url: $('#queryType').prop("value"),
				responseText: JSON.stringify(jsonValue)
			});
			$.mockjax.clear(handle);
		};

		function initParam(page,updateData) {
			var param = {
				product:$('#product').prop("value"),
				channel:$('#channel').prop("value"),
				startDate:$('#startDate').prop("value"),
				endDate:$('#endDate').prop("value"),
				updateData:updateData,
				page:page,
				pageSize:10,
			};
			//console.log(param)
			return param;
		};

		function setUiState(state) {
			var $infoDiv = $('#infoDiv');
			var $modal = $('#waitModal');
			var spinner = $modal.get(0).spinner;
			switch(state) {
			case 'init':
				var option = base.getSpinOption();
				option.scale = 0.5;
				var spinner = new spin(option);
				$modal.get(0).spinner = spinner;
				break;
			case 'beforeSend':
				//$infoDiv.fadeIn();
				//$infoDiv.text('处理中');
				spinner.spin($modal.get(0));
				$modal.modal('show');
				break;
			case 'success':
				//$infoDiv.fadeIn();
				//$infoDiv.text('完成统计');
				spinner.spin();
				//$infoDiv.fadeOut(3000);
				$modal.modal('hide');
				break;
			case 'error':
				$infoDiv.fadeIn();
				$infoDiv.text('请求错误');
				spinner.spin();
				$infoDiv.fadeOut(3000);
				$modal.modal('hide');
	 		}
		};

		function initTable(data) {
			var url = $('#queryType').prop("value");
			$('#thead').empty();
			$('#thead').append(function(){
				var result = '<tr>';
				result += '<th>游戏</th>';
				result += '<th>渠道</th>';
				result += '<th>登录用户</th>';
				result += '<th>新增用户</th>';
				result += '<th>设备激活</th>';
				switch (url) {
				case 'user/commonQuery': result += '<th>日期</th>';
				}
				result += '</tr>';
				return result;
			});

			$('#content').empty();
			$.each(data.data, function(index,item) {
				$('#content').append(function(){
					var result = '<tr>';
					result += '<td>'+ item.productName +'</td>';
					result += '<td>'+ item.channelName +'</td>';
					result += '<td>'+ item.loginRequestIdCount +'</td>';
					result += '<td>'+ item.newUserCount +'</td>';
					result += '<td>'+ item.newMobileCount +'</td>';
					switch (url) {
					case 'user/commonQuery': result += '<td>'+ moment(item.time,'YYYY-MM-DD').format('YYYY-MM-DD') +'</td>';
					}
					result += '</tr>';
					return result;
				});
			});
			if (data.newUserCount < 0) {
				data = $('#content').prop("data");
			}
			$('#content').append(function(){
				var result = '<tr>';
				result += '<td>'+ '汇总' +'</td>';
				result += '<td>' +'</td>';
				result += '<td>'+ data.loginRequestIdCount +'</td>';
				result += '<td>'+ data.newUserCount +'</td>';
				result += '<td>'+ data.newMobileCount +'</td>';
				result += '</tr>';
				return result;
			});
			$('#content').prop("data",data);
		};

		function initPaginator(currentPage,totalPages,numberOfPages) {
			console.log(currentPage+" "+totalPages+" "+numberOfPages)
		    var container = $('#paginator');
		    if (totalPages == 0) {
				container.bootstrapPaginator("destroy");
				return
		    }
		    var options = {
		        bootstrapMajorVersion:3
		        , currentPage:currentPage
		        , totalPages:totalPages
		        , numberOfPages: numberOfPages
		        , itemTexts: function (type, page, current) {
		          switch (type) {
		            case 'first': return '首页';
		            case 'prev': return '上一页';
		            case 'next': return '下一页';
		            case 'last': return '末页';
		            case 'page': return page;
		          }
		        }
		        , onPageClicked:function (event, originalEvent, type, page) {

		        }
		        , onPageChanged:function(event,oldPage,newPage){
		        	if (oldPage != newPage) {
		        		initStatisticData(newPage,false);
		        	}
		        }
		    };
		    container.bootstrapPaginator(options);
		};

		function initStatisticData(page,updateData) {
			simulateData();
			setUiState('init');
			$.ajax({
				url:  $('#queryType').prop("value"),
				timeout: 5000,
				data: initParam(page,updateData),
				type: 'POST',
				dataType :'json',
				beforeSend: function () {
					setUiState('beforeSend');
				},
				success: function (data) {
					setUiState('success');
					initTable(data);
					var totalPages = data.totalPages;
					var currentPage = totalPages > 0 ? page : 0;
					var numberOfPages = totalPages < 15 ? totalPages : 15;

					initPaginator(currentPage, totalPages, numberOfPages);
				},
				error: function (e, jqxhr, settings, exception) {
					setUiState('error');
				}
			});
		};

		function initExportParam() {
			var exportUrl = 'user/export';
			var param = initParam()
			var url = exportUrl + "?" + "product="+param.product + "&"
			url = url + "channel="+param.channel + "&"
			url = url + "startDate="+param.startDate + "&"
			url = url + "endDate="+param.endDate
			$('#exportData').prop("href",url)
		}

		function initDataTriggerEvent(selectObj,postUrl,title) {
			$('#queryType,#product,#channel').change(function(){
			   initStatisticData(1,false);
			});

			$("#startDate,#endDate").on("dp.change", function (e) {
				initStatisticData(1,false);
			});

			$('#updateData').click(function(){
				initStatisticData(1,true);
			});

			$('#exportData').click(function(){
				initExportParam();
			});
		};
	});
});
