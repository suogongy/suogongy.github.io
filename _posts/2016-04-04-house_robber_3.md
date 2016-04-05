---
layout: post
title: "窃贼3"
date: 2016-04-05
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 描述 
某小偷发现了一个新的行窃目标。该目标是一片区域。其中有一个唯一的入口，叫 “root” 。除了 root。每个房间都有唯一的一个入口房间。  
一趟摸底后，小偷发现该区域的所有房间形成了一个二叉树，并且如果相邻的两个房间在同一晚被盗窃，就会自动报警。  
在已知各房间有多少钱的前提下，请预测，该小偷今晚最多能神不知鬼不觉地盗取多少钱。

# 示例

#### 例子1：如下图，最多能盗窃 3+3+1 = 7  
 　　　 `3`  
 　　　/　\  
　　  2　　3  
　　　\　　\  
　　　`3`　`1`  

#### 例子2：如下图，最多能盗窃 4+5 = 9  
　　　　3   
　　　/　\  
　　`4`　`5`  
　　/　\　　\  
　1　　3　　1  

# 分析
二叉树问题，首先依然想到递归。  

#### 定义：  

* `node` 表示二叉树的节点。其中含有 val， left， right。三个属性，分别表示节点的值，左节点，右节点。
* `m(node)` 表示在以 node 为根节点的二叉树形区域所能安全(不惊动警察)盗取的金钱。  
* `mChildren(node)` 表示 `m(node.left) + m(node.right)`，其中 node 非空。  
* `mChildren(null) = 0`   

#### 解析：
因为相邻的房间不能同时去行窃，则从 node 节点出发，可能有两种盗窃方案会让小偷达到最大化收益。

* 从 node 节点开始行窃： `m1 = node.val + mChildren(node.left) + mChildren(node.right)`
* 越过 node 节点: `m2 = m(node.left) + m(node.right)`  
* `m(node) = max(m1,m2)`

# code
基于以上分析，得以下代码

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
public class Solution {
    public int rob(TreeNode root) {
        
        if(root == null){
            return 0;
        }
        
        if(root.left == null && root.right == null){
            return root.val;
        }
        
        int m1 = rob(root.left) + rob(root.right);
        
        int m2 = root.val;
        if(root.left != null){
            m2 = m2 + rob(root.left.left) + rob(root.left.right);
        }
        if(root.right != null){
            m2 = m2 + rob(root.right.left) + rob(root.right.right);
        }
        return m1 > m2 ? m1 : m2;
    }
}
```


