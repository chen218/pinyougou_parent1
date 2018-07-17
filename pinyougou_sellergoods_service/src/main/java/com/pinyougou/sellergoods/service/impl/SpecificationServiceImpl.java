package com.pinyougou.sellergoods.service.impl;
import com.alibaba.dubbo.config.annotation.Service;
import com.github.abel533.entity.Example;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.pinyougou.mapper.TbSpecificationMapper;
import com.pinyougou.mapper.TbSpecificationOptionMapper;
import com.pinyougou.pojo.TbSpecification;
import com.pinyougou.pojo.TbSpecificationOption;
import com.pinyougou.pojogroup.Specification;
import com.pinyougou.sellergoods.service.SpecificationService;
import com.sun.org.apache.bcel.internal.generic.NEW;
import entity.PageResult;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

/**
 * 业务逻辑实现
 * @author Steven
 *
 */
@Service
public class SpecificationServiceImpl implements SpecificationService {

	@Autowired
	private TbSpecificationMapper specificationMapper;
	@Autowired
	private TbSpecificationOptionMapper specificationOptionMapper;

	/**
	 * 查询全部
	 */
	@Override
	public List<TbSpecification> findAll() {
		return specificationMapper.select(null);
	}

	/**
	 * 按分页查询
	 */
	@Override
	public PageResult findPage(int pageNum, int pageSize) {
		
		PageResult<TbSpecification> result = new PageResult<TbSpecification>();
        //设置分页条件
        PageHelper.startPage(pageNum, pageSize);

        //查询数据
        List<TbSpecification> list = specificationMapper.select(null);
        //保存数据列表
        result.setRows(list);

        //获取总记录数
        PageInfo<TbSpecification> info = new PageInfo<TbSpecification>(list);
        result.setTotal(info.getTotal());
		return result;
	}

	/**
	 * 增加
	 */
	@Override
	public void add(Specification specification) {
		//保存规格
		specificationMapper.insertSelective(specification.getSpecification());


		for (TbSpecificationOption option:specification.getSpecificationOptionList()
			 ) {
			//设置规格id
			option.setSpecId(specification.getSpecification().getId());
            specificationOptionMapper.insertSelective(option);
		}

	}
//保存规格选项

	
	/**
	 * 修改
	 */
	@Override
	public void update(Specification specification){
		//更新规格信息
		specificationMapper.updateByPrimaryKeySelective(specification.getSpecification());
		//更新规格选项信息
		//首先删除之前所有的选项
		TbSpecificationOption option = new TbSpecificationOption();
		option.setSpecId(specification.getSpecification().getId());
		specificationOptionMapper.delete(option);
		for (TbSpecificationOption soption:specification.getSpecificationOptionList()
				) {
			//设置规格id
			option.setSpecId(specification.getSpecification().getId());
			specificationOptionMapper.insertSelective(soption);
		}

	}	
	
	/**
	 * 根据ID获取实体
	 * @param id
	 * @return
	 */
	@Override
	public Specification findOne(Long id){
		Specification specification = new Specification();
       //获取规格
		TbSpecification tbSpecification = specificationMapper.selectByPrimaryKey(id);
		//获取规格选项卡
		TbSpecificationOption option = new TbSpecificationOption();
		option.setSpecId(id);
		List<TbSpecificationOption> options = specificationOptionMapper.select(option);
		specification.setSpecification(tbSpecification);
		specification.setSpecificationOptionList(options);
		return specification;

	}

	/**
	 * 批量删除
	 */
	@Override
	public void delete(Long[] ids) {
		//数组转list
        List longs = Arrays.asList(ids);
        //构建查询条件
        Example example = new Example(TbSpecification.class);
        Example.Criteria criteria = example.createCriteria();
        criteria.andIn("id", longs);

        //跟据查询条件删除数据
        specificationMapper.deleteByExample(example);
		//删除关联数据规格选项
		for (Long id : ids) {
			TbSpecificationOption option = new TbSpecificationOption();
			option.setSpecId(id);
			specificationOptionMapper.delete(option);

		}
	}
	
	
	@Override
	public PageResult findPage(TbSpecification specification, int pageNum, int pageSize) {
		PageResult<TbSpecification> result = new PageResult<TbSpecification>();
        //设置分页条件
        PageHelper.startPage(pageNum, pageSize);

        //构建查询条件
        Example example = new Example(TbSpecification.class);
        Example.Criteria criteria = example.createCriteria();
		
		if(specification!=null){			
						//如果字段不为空
			if (specification.getSpecName()!=null && specification.getSpecName().length()>0) {
				criteria.andLike("specName", "%" + specification.getSpecName() + "%");
			}
	
		}

        //查询数据
        List<TbSpecification> list = specificationMapper.selectByExample(example);
        //保存数据列表
        result.setRows(list);

        //获取总记录数
        PageInfo<TbSpecification> info = new PageInfo<TbSpecification>(list);
        result.setTotal(info.getTotal());
		
		return result;
	}
	
}
