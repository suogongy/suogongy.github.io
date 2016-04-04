---
layout: post
title: "求n个数的汉明重量"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 描述 
*汉明重量* 即对应的二进制表示中非零元素的个数。  
对于给定的非负整数 num。分别求出 0～num 这 num+1 个数的二进制表示中 1 的个数，并以数组表示。 

# 示例
当 num ＝ 5 时，返回数组`[0,1,1,2,1,2]`.

# 分析
 参考 [求一个整数的汉明重量](/code/num_of_1_bits.html)

# code
基于以上分析，得以下代码

```java
public class Solution {
    public int[] countBits(int num) {
        int[] results = new int[num+1];
        for(int i=0;i<=num;i++){
            results[i] = numOfBit1(i);
        }
        return results;
    }
    
    private int numOfBit1(int n){
       int result = 0;
       int currentNum = n;
       while(currentNum != 0){
           result++;
           currentNum = currentNum & (currentNum-1);
       }
       
       return result;
    }
}
```


