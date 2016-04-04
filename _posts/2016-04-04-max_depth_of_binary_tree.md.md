---
layout: post
title: "二叉树的高度"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 说明
二叉树高度的定义：  
结点的层次从根开始定义，根为第一层，树中结点的最大层次为树的深度或高度。  
所以二叉树的高度又称二叉树的最大深度。

# 分析

![](/img/code/code_binary_demo.png)

我们不妨定义以 a 为根节点的二叉树的高度为 `height(a)`。如上图二叉树。我们不难看出：  

* 以 a1 为根节点的二叉树的高度，比以 a2 和 a3 为根节点的二叉树的高度大 1 。即 `height(a1) = max(height(a2),height(a3)) + 1`
* 求 height(a2), height(a3) 本身又是一个二叉树高度问题。  

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
    public int maxDepth(TreeNode root) {
        if(root == null){
            return 0;
        }
        
        int leftDepth = maxDepth(root.left);
        int rightDepth = maxDepth(root.right);
        
        return leftDepth > rightDepth ? (leftDepth+1) : (rightDepth+1);
    }
}
```


