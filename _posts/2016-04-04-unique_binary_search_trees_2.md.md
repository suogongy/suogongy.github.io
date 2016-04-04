---
layout: post
title: "求所有不同的二叉搜索树"
date: 2016-04-04
author: 仰海元
category: code
tags: leetcode
finished: true
---
# 描述 
对给定的整数 n，生成所有结构独立的二叉搜索树[^111].其中每个二叉树都保存了从1～n的所有整数  

此处二叉树的序列化基于层序遍历。对下图所示 BST 的遍历结果表示为: `{1,2,3,#,#,4,#,#,5}`,其中`#`表示节点不存在时的路径终结符。  

　　　　1  
　　　/　　\  
　　2　　　　3  
　　　　　　/   
　　　　　　4  
　　　　　　　\  
　　　　　　　　5

 
[^111]: 二叉搜索树即`BST`，又称二叉排序树。即对任意节点，若左子树非空，则左子树所有节点的值都小于该节点值，若右子树非空，则右子树所有节点的值都大于该节点值。  

# 示例
当 n 为 3 时，输出如下 5 个 BST。
![](/img/code/code_unique_bst_2.png)

# 分析
 设 node(i) 表示以 i 为值的根节点，其中 i 属于[1,n]。  
 则由 BST 的定义可知，i 的左子树由所有值为 1～(i-1)的元素组成，i 的右子树由所有值为 (i+1)～n的元素组成  
 其中左右子树本身是同样的问题（因此可以考虑递归）。  
 
 * 当 i 的右子树固定，i 的左子节点为不同左子树表示的根节点时，分别表示不同的以 i 的根节点的 BST 表示。  
 * 当 i 的左子树固定，i 的右子节点为不同右子树表示的根节点时，分别表示不同的以 i 的根节点的 BST 表示。  
 
 假设`numOfBst(i)` 表示以 node(i) 为根节点的 BST 的不同表示法的个数  
 `numOfBst(left,right)` 表示节点值的范围为[left, right] 的 BST 的不同表示法个数 (假设当 left >= right, numOfBst(left,right) = 1)  
 则由上分析可知：`numOfBst(i) = numOfBst(1,i-1) * numOfBst(i+1,n)`  
 
 * 当 left > right 时，节点值属于[left,right]的 BST 的表示法为：null  
 * 当 left ＝ right 时，节点值属于[left,right]的 BST 的表示法为 node(left)

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
    public List<TreeNode> generateTrees(int n) {
        List<TreeNode> trees = new ArrayList<TreeNode>();
        if(n <= 0){
            return trees;
        }
        return generateTrees(1,n);
    }
    
    private List<TreeNode> generateTrees(int left,int right){
        List<TreeNode> trees = new ArrayList<TreeNode>();
        
        if(left>right){
            trees.add(null);
            return trees;
        }
        
        if(left == right){
            trees.add(new TreeNode(left));
            return trees;
        }
        
        for(int i=left;i<=right;i++){
            List<TreeNode> leftTrees = generateTrees(left,i-1);
            List<TreeNode> rightTrees = generateTrees(i+1,right);
            
            for(int l=0;l<leftTrees.size();l++){
                for(int r=0;r<rightTrees.size();r++){
                    TreeNode current = new TreeNode(i);
                    current.left = leftTrees.get(l);
                    current.right = rightTrees.get(r); 
                    trees.add(current);
                }
            }
        }
        return trees;
    }
}
```


