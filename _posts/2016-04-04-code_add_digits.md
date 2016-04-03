---
layout: post
title: "数字分解求和"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 说明
对于给定的非负整数 num，连续计算其各位数的和，直到只有一位数，返回该一位的数字。

# 例子
给定数字 38, 整个计算过程如下： 
 
* 3 + 8 = 11  
* 1 + 1 = 2  

因为 2 只有一位数，所以返回 2 。过程结束。

# 分析
这种问题一看似乎找不到明显的规律，我们不妨通过举例子来理清思绪。但是举什么例子呢？  
从题干分析，问题要求返回 1 位数，我们就从 1 位数开始入手。  
 
* 对于 num 为 1～9，result = num. 

对于 10～20，因为 10～18 的 2 位数求和后，为 1 位数， 而 19～20 的各位数求和后都超过 1位数，需要继续处理。我们不妨基于 10～18作第二轮分析  

* 对于 num 为 10～18，result = num - 9 = num - 9.  

上述分析段都是 9 个一段，接下来基于此分析。分析第 3, 4 段。  

* 对于 num 为 19～27，result = num - 18 = num - 2*9.  
* 对于 num 为 28～36，result = num -27 = num - 3*9.  

基于上。我们初步推测公式：
result = num - (num-1)/9*9

# code
基于以上分析，得以下代码

```java
public class Solution {
    public int addDigits(int num) {
        return num - (num-1)/9*9;
    }
}
```


