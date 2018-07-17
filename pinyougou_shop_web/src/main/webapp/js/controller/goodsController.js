 //控制层 typeTemplateService
app.controller('goodsController' ,function($scope,$controller,$location,goodsService,uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(){
		var id = $location.search()['id'];//获取参数值
		if (id ==null){
			return;
		}
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
                //向富文本编辑器添加商品介绍
				editor.html($scope.entity.tbGoodsDesc.introduction);
                //显示图片列表
				$scope.entity.tbGoodsDesc.itemImages=JSON.parse($scope.entity.tbGoodsDesc.itemImages);
                //显示扩展属性
				$scope.entity.tbGoodsDesc.customAttributeItems=JSON.parse($scope.entity.tbGoodsDesc.customAttributeItems);
                //规格
				$scope.entity.tbGoodsDesc.specificationItems=JSON.parse($scope.entity.tbGoodsDesc.specificationItems);
                //SKU列表规格列转换
				for(var i=0;i<$scope.entity.itemList.length;i++){
					$scope.entity.itemList[i].spec = JSON.parse($scope.entity.itemList[i].spec);
				}
			}

		);				
	};
    /**
     * 验证规格选项是否要勾选
     * @param specName 规格名称
     * @param optionName 规格项名称
     * @returns {boolean}
     */
    $scope.checkAttributeValue=function (specName,optionName) {
        var item = $scope.entity.tbGoodsDesc.specificationItems;
        var spec = $scope.searchObjectByKey(item, 'attributeName', specName);
        if(spec == null ){
            return false;
        }else{
            //如果找到了相应规格项，注意此处是>=0
            if(spec.attributeValue.indexOf(optionName) >= 0){
                return true;
            }else{
                return false;
            }
        }
        return true;
    }


    //保存
	$scope.save=function(){				
		var serviceObject;//服务层对象
        $scope.entity.tbGoodsDesc.introduction=editor.html();
		if($scope.entity.goods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{

			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
					//重新查询 
		        //	$scope.entity = {};//重新加载
                    $scope.entity={goods:{},tbGoodsDesc:{itemImages:[],specificationItems:[],customAttributeItems:[]}};
                    //清空富文本编辑器
					editor.html("");
					location.href ="goods.html" ;//跳转到商品列表页
				}else{
					alert(response.message);
				}
			}		
		);				
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);

	}
    
	$scope.uploadFile=function () {
		uploadService.uploadFile().success(function (response) {
            //如果上传成功,绑定url到表单
			if (response.success){
				$scope.image_entity.url =response.message;
			}else{
				alert("上传发生错误");
			}
        })
    }
    $scope.entity={goods:{},tbGoodsDesc:{itemImages:[],specificationItems:[],customAttributeItems:[]}};//定义页面实体结构
    //添加图片列表
    $scope.add_image_entity=function(){
        $scope.entity.tbGoodsDesc.itemImages.push($scope.image_entity);
    }
//列表中移除图片
    $scope.remove_image_entity=function(index){
        $scope.entity.tbGoodsDesc.itemImages.splice(index,1);
    };
//查询一级分类
	$scope.selectItemCat1List=function () {
		itemCatService.findByParentId(0).success(function (resopnse) {
			$scope.itemCat1List=resopnse;
        })


    }
    //跟据一级类目，更新二级类目
//$watch方法用于监控某个变量的值，当被监控的值发生变化，就自动执行相应的函数
	//$watch方法用于监控某个变量的值，当被监控的值发生变化，就自动执行相应的函数。
	$scope.$watch("entity.goods.category1Id",function(newValue,oldValue){
	itemCatService.findByParentId(newValue).success(function (resopnse) {
		$scope.itemCat2List=resopnse;
    })
	})
    $scope.$watch("entity.goods.category2Id",function(newValue,oldValue){
        itemCatService.findByParentId(newValue).success(function (resopnse) {
            $scope.itemCat3List=resopnse;
        })
    })
	$scope.$watch("entity.goods.category3Id",function (newValue,oldValue) {
		itemCatService.findOne(newValue).success(function (resopnse) {
			$scope.entity.goods.typeTemplateId=resopnse.typeId;
        })

    })

    $scope.$watch("entity.goods.typeTemplateId",function (newValue,oldValue) {
        typeTemplateService.findOne(newValue).success(function (response) {
            $scope.typeTemplate=response;
            $scope.typeTemplate.brandIds = JSON.parse(response.brandIds);

          //如果没有ID，则加载模板中的扩展数据
			if ($location.search()["id"]==null){
                $scope.entity.tbGoodsDesc.customAttributeItems = JSON.parse(response.customAttributeItems);
            }
            //规格列表
			typeTemplateService.findSpecList(newValue).success(function (response) {
				$scope.specList =response;

            })

        })

    })
    /**
     * 勾选页面上的规格时调用此函数
     * @param $event 当前点击的checkbox
     * @param name 规格的名称
     * @param value 规格选项的值
	 *
     */

    $scope.updateSpecAttribute=function ($event,name,value) {
//查找规格有没有保存过
        var obj = this.searchObjectByKey($scope.entity.tbGoodsDesc.specificationItems,'attributeName',name);
//找到相关记录
        if(obj != null){
            //如果已选中
            if($event.target.checked){
                obj.attributeValue.push(value);
            }else{ //取消勾选
                //查找当前value的下标
                var idx = obj.attributeValue.indexOf(value);
                //删除数据
                obj.attributeValue.splice(idx, 1);

                //取消勾选后，如果当前列表里没有记录时，删除当前整个规格
                if(obj.attributeValue.length == 0){
                    var valueIndex = $scope.entity.tbGoodsDesc.specificationItems.indexOf(obj);
                    $scope.entity.tbGoodsDesc.specificationItems.splice(valueIndex, 1);
                }
            }
        }else{
            //添加一条记录
            $scope.entity.tbGoodsDesc.specificationItems.push(
                {'attributeName': name, 'attributeValue': [value]});
        }
    }

//更新SKU记录
    $scope.createItemList=function () {
        // 1.   创建一条有基本数据，不带规格的初始数据
        // 参考: $scope.entity.itemList=[{spec:{},price:0,num:99999,status:'0',isDefault:'0' } ]
        $scope.entity.itemList=[{spec:{},price:0,num:99999,status:'0',isDefault:'0' }];
        // 2.   查找遍历所有已选择的规格列表
        var items = $scope.entity.tbGoodsDesc.specificationItems;
        for(var i = 0; i < items.length; i++){
            // 9.   回到createItemList方法中，在循环中调用addColumn方法，并让itemList重新指向返回结果;
            $scope.entity.itemList = addColumn($scope.entity.itemList, items[i].attributeName, items[i].attributeValue);
        }
    }

    // 3.   抽取addColumn(当前的表格，列名称，列的值列表)方法，用于每次循环时追加列
    addColumn=function (list,columnName,columnValue) {
        // 4.   编写addColumn逻辑，当前方法要返回添加所有列后的表格，定义新表格变量newList
        var newList = [];
        // 5.   在addColumn添加两重嵌套循环，一重遍历之前表格的列表，二重遍历新列值列表
        for(var i = 0; i < list.length; i++){

            for(var j = 0; j < columnValue.length; j++){
                // 6.   在第二重循环中，全用深克隆技巧，把之前表格的一行记录copy所有属性，
                // 用到var newRow = JSON.parse(JSON.stringify(之前表格的一行记录));
                var newRow = JSON.parse(JSON.stringify(list[i]));
                // 7.   接着第6步，向newRow里追加一列
                newRow.spec[columnName]=columnValue[j];
                // 8.   把新生成的行记录，push到newList中
                newList.push(newRow);
            }
        }
        return newList;

    }
//显示状态
    $scope.status=['未审核','已审核','审核未通过','关闭'];//商品状态
    //加载商品分类列表
$scope.itemCatList = [];
    $scope.findItemList=function () {
    	itemCatService.findAll().success(function (response) {
    		for (var i=0;i<response.length;i++){
                $scope.itemCatList[response[i].id]=response[i].name;
			}

        })
		
    }
    $scope.updateMarketable=function (Marketable) {
        goodsService.updateMarketable($scope.selectIds,Marketable).success(function (response) {
            alert(response.message);
            //如果修改成功
            if(response.success){
                $scope.reloadList();//刷新列表
                $scope.selectIds=[];//清空ID集合
            }
        })
    }
});	
