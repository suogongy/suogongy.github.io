---
layout: post
title: "求二叉树所有根节点到叶节点路径"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 描述 
对于给定的二叉树，返回所有从根到叶节点的路径。 

# 示例
　　　　　　　　　1  
　　　　　　　　/　　\  
　　　　　　　2　　　　3  
　　　　　　/ 　＼ 　　　＼   
　　　　　4　　　5　　　　7    
返回的所有路径为：`["1->2->4","1->2->5","1->3->7"]`

# 分析
 先做如下定义：  
 
 * node(i) 表示以 i 为值的节点。
 * numOfPaths(i) 表示以 node(i) 为根节点对应的路径数。  
 * path(i)表示一个以 node(i) 为根节点的路径  
 
 对于二叉树的问题，我们基本的思路依然是考虑递归。考虑上述示例。  
 
 * 对根节点 node(1) ，显然有 numOfPaths(1) = numOfPaths(2) + numOfPaths(3)  
 * 当path(2) 非空时， 有path(1) = "1->" + path(2)  
 * 当path(3) 非空时， 有path(1) = "1->" + path(3)  
 * 空树对应的路径为 null。  
 * 单节点树对应的路径为该节点值

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
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> paths = new ArrayList<String>();
        
        if(root == null){
            return paths;
        }
        
        if(root.left == null && root.right == null){
            paths.add(String.valueOf(root.val));
            return paths;
        }
        
        List<String> leftPaths = binaryTreePaths(root.left);
        for(String leftPath:leftPaths){
            String path = root.val + "->" + leftPath;
            paths.add(path);
        }
        
        List<String> rightPaths = binaryTreePaths(root.right);
        for(String rightPath:rightPaths){
            String path = root.val + "->" + rightPath;
            paths.add(path);
        }
        
        return paths;
    }
}
```


