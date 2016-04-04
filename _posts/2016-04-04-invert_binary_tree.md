---
layout: post
title: "二叉树反转"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 说明
二叉树反转又称二叉树的镜像。具体参考图片说明。

![](/img/code/code-invert-binary-tree.png)

# 分析
由上图，我们不难得出基本的思路：  
对给定的二叉树，如果存在孩子节点，则交换孩子节点。然后对孩子节点重复上述的过程。直到孩子节点为叶节点。  
很明显，这是一个递归的过程。

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
    public TreeNode invertTree(TreeNode root) {
        if(root != null){
            TreeNode leftTree = invertTree(root.left);
            TreeNode rightTree = invertTree(root.right);
            root.right = leftTree;
            root.left = rightTree;
        }
        return root;
    }
}
```


