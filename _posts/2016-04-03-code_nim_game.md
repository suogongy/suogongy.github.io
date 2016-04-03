---
layout: post
title: "Nim取子游戏"
date: 2016-04-03
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 游戏说明
两个人从一堆石头中依次拿石头，每次拿的石头不超过指定数目，最后拿石头的人为赢家。

# 问题
假设玩家分别为A，B，总共有 N 块石头，1次最多拿5块，A先拿。

请判断 A 是否能赢得游戏。

# 分析
因为 A，B 总有一个人赢得游戏，如果从 A 直接分析，感觉有点复杂，这时不妨转换思维，改由分析 B。  
因为 1 次最多拿 5 块。则不论 A 实际拿多少块，B 都能使得这一轮总的取子数为 5+1 = 6.  
因此，如果总的石头数是 6 的整数倍数，则可以保证 B 赢得游戏。  
相反，如果总的石头数不是 6 的整数倍数，则 A 第一次可以取 N % 6 个石头，然后每次取子数为（6 - B的对应取子数）,这样可保证 A 赢得游戏。

# code
基于以上分析，得以下代码

```java
public class Solution {
    public boolean canWinNim(int n) {
        return n%6 != 0;
    }
}
```


