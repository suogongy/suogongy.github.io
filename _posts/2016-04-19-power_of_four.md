---
layout: post
title: "判断一个整数是4的指数"
date: 2016-04-19
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 问题  

给定一个 32 位的有符号整数 num。写一个函数判断 num 是否是 4 的指数。且该函数不用循环和递归。

# 示例

|输入|结果|
|---|---|
|0  |false|
|1  |true|
|8  |false|
|16 |true|
|32 |false|
|64 |true|
|256|true|

# 分析  

参考:[判断一个数是三的指数](http://www.ifence.me/code/power_of_three.html)  
但此处的特殊性是，因为 4 除了 1 和 4 外，还有 2 这个因子。因为无法根据整数中最大的 4 的指数取模来进行判断。  
但是，因为 2^30/4^x == (2^15/2^x)^2 ,我们可以将问题化简为 判断一个整数是否是 2 的指数。  

# code  

基于以上分析，得以下代码

```java
public class Solution {
    public boolean isPowerOfFour(int num) {
        
        int sqrtNum = (int)Math.sqrt(num);
        
        return (sqrtNum > 0) && (sqrtNum*sqrtNum ==  num) && (32768 % sqrtNum == 0);
    }
}
```


