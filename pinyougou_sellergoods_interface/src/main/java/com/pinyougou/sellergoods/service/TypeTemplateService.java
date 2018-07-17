package com.pinyougou.sellergoods.service;

import com.pinyougou.pojo.TbTypeTemplate;
import entity.PageResult;

import java.util.List;
import java.util.Map;

public interface TypeTemplateService {
    PageResult findPage(TbTypeTemplate typeTemplate, int page, int rows);

    List<Map> findSpecIds(Long id);

    void delete(Long[] ids);

    TbTypeTemplate findOne(Long id);

    void update(TbTypeTemplate typeTemplate);

    void add(TbTypeTemplate typeTemplate);

    PageResult findPage(int page, int rows);

    List<TbTypeTemplate> findAll();
}
