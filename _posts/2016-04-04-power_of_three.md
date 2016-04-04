---
layout: post
title: "判断一个整数是3的指数"
date: 2016-04-05
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 描述 
如题所示。写出一个判断指定整数是否为 3 的指数的函数。 

# 示例
当给定的数字分别为：1,3,5,9,15,27 时，分别返回：true,true,false,true,false,true.

# 分析
 3 的指数就是 n 个 3 相乘。  
 
 1. 当 num 是 3 的倍数时，执行步骤 2，否则执行步骤 3  
 2. 重置 num = num/3，返回步骤 1  
 3. 如果 num 等于 1，返回true。否则返回 false。

# code
基于以上分析，得以下代码

```java
public class Solution {
    public boolean isPowerOfThree(int n) {
        while(n%3 == 0){
            n = n/3;
        }
        return n == 1;
    }
}
```

# 提高
如果不用循环和递归进行上述判断？

`
由题干知，给定的数字为整数。正整数的范围时 0～2^31。其中最大的 3 的次方数为 3^19 = 1162261467。  
如果给定的整数为 3 的指数，即 num = 3^x，则有 3^19 % num = 3^19 % 3^x = 0。  
`


