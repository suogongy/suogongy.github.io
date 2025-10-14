---
title: "Redis内部数据结构详解"
description: "深入分析Redis各种数据结构的实现原理"
excerpt: "深入剖析Redis内部数据结构的实现原理，包括简单动态字符串、链表、字典、跳跃表、整数集合、压缩列表等核心数据结构的详细解析。"
tags: ["Redis", "数据结构", "源码分析", "算法", "底层实现"]
category: "notes"
---

# Redis内部数据结构详解

> 理解Redis内部数据结构是掌握Redis性能优化的关键

## 引言

Redis的高性能很大程度上得益于其精心设计的数据结构。Redis不仅提供了丰富的外部数据类型（String、List、Hash、Set、Sorted Set），其内部还使用了多种高效的数据结构来支撑这些外部类型。本文将深入分析Redis内部数据结构的实现原理。

## Redis数据结构概览

### 1. 数据结构层次

**外部数据类型**：
- String：字符串类型
- List：列表类型
- Hash：哈希表类型
- Set：集合类型
- Sorted Set：有序集合类型

**内部数据结构**：
- SDS（Simple Dynamic String）：简单动态字符串
- LinkedList：双向链表
- Dict：字典（哈希表）
- SkipList：跳跃表
- IntSet：整数集合
- ZipList：压缩列表
- QuickList：快速列表

### 2. 数据结构映射关系

```
String  -> SDS
List    -> LinkedList / ZipList / QuickList
Hash    -> Dict / ZipList
Set     -> Dict / IntSet
Sorted Set -> SkipList + Dict / ZipList
```

## SDS（简单动态字符串）

### 1. SDS结构定义

```c
// sds.h
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len;        // 已使用长度
    uint8_t alloc;      // 总容量
    unsigned char flags; // 标志位，用于标识sdshdr类型
    char buf[];         // 字符数组
};

struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len;       // 已使用长度
    uint16_t alloc;     // 总容量
    unsigned char flags; // 标志位
    char buf[];         // 字符数组
};

struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len;       // 已使用长度
    uint32_t alloc;     // 总容量
    unsigned char flags; // 标志位
    char buf[];         // 字符数组
};

struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len;       // 已使用长度
    uint64_t alloc;     // 总容量
    unsigned char flags; // 标志位
    char buf[];         // 字符数组
};
```

### 2. SDS特性分析

**空间预分配**：
```c
// sds.c
sds sdsMakeRoomFor(sds s, size_t addlen) {
    struct sdshdr *sh, *newsh;
    size_t free = sdsavail(s);
    size_t len, newlen;
    
    if (free >= addlen) return s;
    
    len = sdslen(s);
    sh = (void*)(s - (sizeof(struct sdshdr)));
    newlen = (len + addlen);
    
    // 空间预分配策略
    if (newlen < SDS_MAX_PREALLOC)
        newlen *= 2;
    else
        newlen += SDS_MAX_PREALLOC;
    
    newsh = zrealloc(sh, sizeof(struct sdshdr) + newlen + 1);
    if (newsh == NULL) return NULL;
    
    newsh->free = newlen - len;
    return newsh->buf;
}
```

**惰性空间释放**：
```c
sds sdstrim(sds s, const char *cset) {
    struct sdshdr *sh = (void*)(s - (sizeof(struct sdshdr)));
    char *start, *end, *sp, *ep;
    size_t len;
    
    sp = s;
    ep = s + sdslen(s) - 1;
    start = sp;
    end = ep;
    
    // 跳过前置空白字符
    while(sp <= end && strchr(cset, *sp)) sp++;
    
    // 跳过后置空白字符
    while(ep > start && strchr(cset, *ep)) ep--;
    
    len = (sp > ep) ? 0 : ((ep - sp) + 1);
    
    // 移动字符串，但保留空间
    if (sh->buf != sp) memmove(sh->buf, sp, len);
    sh->buf[len] = '\0';
    sh->free = sh->alloc - len;
    sh->len = len;
    
    return s;
}
```

### 3. SDS与C字符串对比

**优势对比**：
| 特性 | C字符串 | SDS |
|------|---------|-----|
| 获取长度 | O(n) | O(1) |
| 避免缓冲区溢出 | 容易溢出 | 自动检查扩容 |
| 减少内存重分配次数 | 每次修改都重分配 | 预分配和惰性释放 |
| 二进制安全 | 不支持 | 支持 |

## Dict（字典/哈希表）

### 1. 字典结构定义

```c
// dict.h
typedef struct dictEntry {
    void *key;              // 键
    union {
        void *val;          // 值
        uint64_t u64;       // uint64_t值
        int64_t s64;        // int64_t值
        double d;           // double值
    } v;
    struct dictEntry *next; // 下一个节点，用于解决哈希冲突
} dictEntry;

typedef struct dictType {
    uint64_t (*hashFunction)(const void *key);  // 哈希函数
    void *(*keyDup)(void *privdata, const void *key); // 键复制函数
    void *(*valDup)(void *privdata, const void *obj); // 值复制函数
    int (*keyCompare)(void *privdata, const void *key1, const void *key2); // 键比较函数
    void (*keyDestructor)(void *privdata, void *key); // 键销毁函数
    void (*valDestructor)(void *privdata, void *obj); // 值销毁函数
} dictType;

typedef struct dictht {
    dictEntry **table;      // 哈希表数组
    unsigned long size;     // 哈希表大小
    unsigned long sizemask; // 哈希表大小掩码，用于计算索引
    unsigned long used;     // 已有节点数量
} dictht;

typedef struct dict {
    dictType *type;         // 字典类型
    void *privdata;         // 私有数据
    dictht ht[2];           // 两个哈希表，用于rehash
    long rehashidx;         // rehash进度，-1表示不在rehash
    int iterators;          // 迭代器数量
} dict;
```

### 2. 哈希算法

```c
// dict.c
// MurmurHash2哈希算法
uint64_t dictGenHashFunction(const void *key, int len) {
    uint64_t seed = 5381;
    const uint64_t m = 0xc6a4a7935bd1e995;
    const int r = 47;
    uint64_t h = seed ^ (len * m);
    const uint64_t *data = (const uint64_t *)key;
    const uint64_t *end = data + (len/8);
    
    while(data != end) {
        uint64_t k = *data++;
        k *= m;
        k ^= k >> r;
        k *= m;
        h ^= k;
        h *= m;
    }
    
    switch(len & 7) {
        case 7: h ^= ((uint64_t)data[6]) << 48;
        case 6: h ^= ((uint64_t)data[5]) << 40;
        case 5: h ^= ((uint64_t)data[4]) << 32;
        case 4: h ^= ((uint64_t)data[3]) << 24;
        case 3: h ^= ((uint64_t)data[2]) << 16;
        case 2: h ^= ((uint64_t)data[1]) << 8;
        case 1: h ^= ((uint64_t)data[0]);
                h *= m;
    }
    
    h ^= h >> r;
    h *= m;
    h ^= h >> r;
    return h;
}

// 计算索引值
static unsigned int dictKeyIndex(dict *d, const void *key) {
    unsigned int h, idx, table;
    dictEntry *he;
    
    // 计算哈希值
    h = dictHashKey(d, key);
    
    // 检查两个哈希表
    for (table = 0; table <= 1; table++) {
        idx = h & d->ht[table].sizemask;
        he = d->ht[table].table[idx];
        
        // 检查是否已存在相同key
        while(he) {
            if (dictCompareKeys(d, key, he->key))
                return -1;
            he = he->next;
        }
        
        // 如果不在rehash，只需要检查第一个表
        if (!dictIsRehashing(d)) break;
    }
    
    return idx;
}
```

### 3. 渐进式Rehash

```c
// 执行单步rehash
int dictRehash(dict *d, int n) {
    int empty_visits = n * 10; // 最大访问空槽位数
    
    if (!dictIsRehashing(d)) return 0;
    
    while(n-- && d->ht[0].used != 0) {
        dictEntry *de, *nextde;
        
        // 找到下一个非空槽位
        while(d->ht[0].table[d->rehashidx] == NULL) {
            d->rehashidx++;
            if (--empty_visits == 0) return 1;
        }
        
        de = d->ht[0].table[d->rehashidx];
        
        // 迁移该槽位的所有键值对
        while(de) {
            unsigned int h;
            nextde = de->next;
            
            // 计算在新表中的索引
            h = dictHashKey(d, de->key) & d->ht[1].sizemask;
            
            // 插入到新表头部
            de->next = d->ht[1].table[h];
            d->ht[1].table[h] = de;
            
            // 更新计数器
            d->ht[0].used--;
            d->ht[1].used++;
            
            de = nextde;
        }
        
        // 释放旧表槽位
        d->ht[0].table[d->rehashidx] = NULL;
        d->rehashidx++;
    }
    
    // 完成rehash
    if (d->ht[0].used == 0) {
        zfree(d->ht[0].table);
        d->ht[0] = d->ht[1];
        _dictReset(&d->ht[1]);
        d->rehashidx = -1;
        return 0;
    }
    
    return 1;
}

// 定时rehash
int dictRehashMilliseconds(dict *d, int ms) {
    long long start = timeInMilliseconds();
    int rehashes = 0;
    
    while(dictRehash(d, 100)) {
        rehashes += 100;
        if (timeInMilliseconds() - start > ms) break;
    }
    
    return rehashes;
}
```

## SkipList（跳跃表）

### 1. 跳跃表结构定义

```c
// redis.h
typedef struct zskiplistNode {
    sds ele;                     // 成员对象
    double score;                // 分值
    struct zskiplistNode *backward; // 后退指针
    struct zskiplistLevel {
        struct zskiplistNode *forward; // 前进指针
        unsigned long span;      // 跨度
    } level[];                   // 层级数组
} zskiplistNode;

typedef struct zskiplist {
    struct zskiplistNode *header, *tail; // 头尾节点
    unsigned long length;         // 节点数量
    int level;                    // 最大层级
} zskiplist;
```

### 2. 跳跃表插入操作

```c
// t_zset.c
zskiplistNode *zslInsert(zskiplist *zsl, double score, sds ele) {
    zskiplistNode *update[ZSKIPLIST_MAXLEVEL], *x;
    unsigned int rank[ZSKIPLIST_MAXLEVEL];
    int i, level;
    
    // 获取当前最大层级
    serverAssert(!zslIsInRange(zsl, &range));
    
    // 从最高层开始查找插入位置
    x = zsl->header;
    for (i = zsl->level-1; i >= 0; i--) {
        rank[i] = i == (zsl->level-1) ? 0 : rank[i+1];
        while (x->level[i].forward &&
                (x->level[i].forward->score < score ||
                    (x->level[i].forward->score == score &&
                    sdscmp(x->level[i].forward->ele,ele) < 0))) {
            rank[i] += x->level[i].span;
            x = x->level[i].forward;
        }
        update[i] = x;
    }
    
    // 随机生成新节点的层数
    level = zslRandomLevel();
    if (level > zsl->level) {
        for (i = zsl->level; i < level; i++) {
            rank[i] = 0;
            update[i] = zsl->header;
            update[i]->level[i].span = zsl->length;
        }
        zsl->level = level;
    }
    
    // 创建新节点
    x = zslCreateNode(level, score, ele);
    for (i = 0; i < level; i++) {
        x->level[i].forward = update[i]->level[i].forward;
        update[i]->level[i].forward = x;
        
        x->level[i].span = update[i]->level[i].span - (rank[0] - rank[i]);
        update[i]->level[i].span = (rank[0] - rank[i]) + 1;
    }
    
    // 更新其他层的跨度
    for (i = level; i < zsl->level; i++) {
        update[i]->level[i].span++;
    }
    
    x->backward = (update[0] == zsl->header) ? NULL : update[0];
    if (x->level[0].forward)
        x->level[0].forward->backward = x;
    else
        zsl->tail = x;
    
    zsl->length++;
    return x;
}

// 随机生成层数
int zslRandomLevel(void) {
    int level = 1;
    while ((random() & 0xFFFF) < (ZSKIPLIST_P * 0xFFFF))
        level += 1;
    return (level < ZSKIPLIST_MAXLEVEL) ? level : ZSKIPLIST_MAXLEVEL;
}
```

### 3. 跳跃表删除操作

```c
void zslDeleteNode(zskiplist *zsl, zskiplistNode *x, zskiplistNode **update) {
    int i;
    
    // 更新每一层的指针
    for (i = 0; i < zsl->level; i++) {
        if (update[i]->level[i].forward == x) {
            update[i]->level[i].span += x->level[i].span - 1;
            update[i]->level[i].forward = x->level[i].forward;
        } else {
            update[i]->level[i].span -= 1;
        }
    }
    
    // 更新后退指针
    if (x->level[0].forward) {
        x->level[0].forward->backward = x->backward;
    } else {
        zsl->tail = x->backward;
    }
    
    // 减少层级
    while(zsl->level > 1 && zsl->header->level[zsl->level-1].forward == NULL)
        zsl->level--;
    
    zsl->length--;
}

int zslDelete(zskiplist *zsl, double score, sds ele, zskiplistNode **node) {
    zskiplistNode *update[ZSKIPLIST_MAXLEVEL], *x;
    int i;
    
    // 查找删除位置
    x = zsl->header;
    for (i = zsl->level-1; i >= 0; i--) {
        while (x->level[i].forward &&
                (x->level[i].forward->score < score ||
                    (x->level[i].forward->score == score &&
                    sdscmp(x->level[i].forward->ele,ele) < 0))) {
            x = x->level[i].forward;
        }
        update[i] = x;
    }
    
    x = x->level[0].forward;
    if (x && score == x->score && sdscmp(x->ele,ele) == 0) {
        zslDeleteNode(zsl, x, update);
        if (!node)
            zslFreeNode(x);
        else
            *node = x;
        return 1;
    }
    
    return 0;
}
```

## ZipList（压缩列表）

### 1. 压缩列表结构

```
<zlbytes> <zltail> <zllen> <entry>... <entry> <zlend>

各字段含义：
- zlbytes: 压缩列表总字节数
- zltail: 最后一个entry的偏移量
- zllen: entry的数量
- entry: 具体的数据项
- zlend: 压缩列表结束标记，值为255
```

### 2. Entry结构

```
<prevlen> <encoding> <len> <data>

各字段含义：
- prevlen: 前一个entry的长度
- encoding: 数据类型和长度编码
- len: 数据长度（某些编码方式下不需要）
- data: 实际数据
```

### 3. 压缩列表操作

```c
// zip_list.h
#define ZIP_END 255
#define ZIP_BIGLEN 254

/* encoding */
#define ZIP_STR_MASK 0xc0
#define ZIP_STR_06B (0 << 6)
#define ZIP_STR_14B (1 << 6)
#define ZIP_STR_32B (2 << 6)

#define ZIP_INT_MASK 0x30
#define ZIP_INT_16B (0xc0 | 0 << 4)
#define ZIP_INT_32B (0xc0 | 1 << 4)
#define ZIP_INT_64B (0xc0 | 2 << 4)
#define ZIP_INT_24B (0xc0 | 3 << 4)
#define ZIP_INT_8B  (0xc0 | 4 << 4)

// 创建压缩列表
unsigned char *ziplistNew(void) {
    unsigned int bytes = ZIPLIST_HEADER_SIZE + 1;
    unsigned char *zl = zmalloc(bytes);
    ZIPLIST_BYTES(zl) = bytes;
    ZIPLIST_TAIL_OFFSET(zl) = ZIPLIST_HEADER_SIZE;
    ZIPLIST_LENGTH(zl) = 0;
    zl[bytes-1] = ZIP_END;
    return zl;
}

// 插入数据
unsigned char *ziplistInsert(unsigned char *zl, unsigned char *p, unsigned char *s, unsigned int slen) {
    return __ziplistInsert(zl, p, s, slen);
}

// 删除数据
unsigned char *ziplistDelete(unsigned char *zl, unsigned char **p) {
    size_t offset = *p - zl;
    zl = __ziplistDelete(zl, *p, 1);
    *p = zl + offset;
    return zl;
}
```

## IntSet（整数集合）

### 1. 整数集合结构

```c
// intset.h
typedef struct intset {
    uint32_t encoding;  // 编码方式
    uint32_t length;    // 元素数量
    int8_t contents[];  // 实际存储元素
} intset;

/* encoding */
#define INTSET_ENC_INT16 (sizeof(int16_t))
#define INTSET_ENC_INT32 (sizeof(int32_t))
#define INTSET_ENC_INT64 (sizeof(int64_t))
```

### 2. 升级操作

```c
// intset.c
intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    uint8_t curenc = intrev32ifbe(is->encoding);
    uint8_t newenc = _intsetValueEncoding(value);
    int length = intrev32ifbe(is->length);
    int prepend = value < 0 ? 1 : 0;
    
    // 设置新的编码方式
    is->encoding = intrev32ifbe(newenc);
    is->length = intrev32ifbe(length+1);
    
    // 根据新编码方式扩展空间
    is = zrealloc(is, sizeof(intset)+newenc*(length+1));
    
    // 移动原有数据
    if (prepend) {
        memmove(is->contents+newenc, is->contents, length*newenc);
    } else {
        memmove(is->contents+newenc*prepend, is->contents, length*newenc);
    }
    
    // 设置新值
    if (prepend) {
        _intsetSet(is,0,value);
    } else {
        _intsetSet(is,length,value);
    }
    
    return is;
}

// 插入元素
intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    
    if (success) *success = 1;
    
    // 如果需要升级
    if (valenc > intrev32ifbe(is->encoding)) {
        return intsetUpgradeAndAdd(is, value);
    }
    
    // 检查是否已存在
    if (intsetSearch(is, value, &pos)) {
        if (success) *success = 0;
        return is;
    }
    
    // 扩展空间并插入
    is = intsetResize(is, intrev32ifbe(is->length)+1);
    if (pos < intrev32ifbe(is->length))
        intsetMoveTail(is, pos, pos+1);
    
    _intsetSet(is, pos, value);
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    
    return is;
}
```

## QuickList（快速列表）

### 1. 快速列表结构

```c
// quicklist.h
typedef struct quicklistNode {
    struct quicklistNode *prev;   // 前一个节点
    struct quicklistNode *next;   // 后一个节点
    unsigned char *zl;            // 指向压缩列表
    unsigned int sz;              // 压缩列表字节数
    unsigned int count : 16;      // 压缩列表包含的元素数量
    unsigned int encoding : 2;    // 编码方式
    unsigned int container : 2;   // 容器类型
    unsigned int recompress : 1;  // 是否重新压缩
    unsigned int attempted_compress : 1; // 尝试压缩次数
    unsigned int extra : 10;      // 预留字段
} quicklistNode;

typedef struct quicklistLZF {
    unsigned int sz;              // 压缩后长度
    char compressed[];            // 压缩数据
} quicklistLZF;

typedef struct quicklist {
    quicklistNode *head;          // 头节点
    quicklistNode *tail;          // 尾节点
    unsigned long count;          // 元素总数
    unsigned long len;            // 节点数量
    int fill : 16;                // 填充因子
    unsigned int compress : 16;   // 压缩深度
} quicklist;
```

### 2. 快速列表操作

```c
// quicklist.c
quicklist *quicklistCreate(void) {
    struct quicklist *quicklist;
    
    quicklist = zmalloc(sizeof(*quicklist));
    quicklist->head = quicklist->tail = NULL;
    quicklist->len = 0;
    quicklist->count = 0;
    quicklist->compress = 0;
    quicklist->fill = -2;
    return quicklist;
}

int quicklistPushHead(quicklist *quicklist, void *value, size_t sz) {
    quicklistNode *orig_head = quicklist->head;
    
    if (likely(
            _quicklistNodeAllowInsert(quicklist->head, quicklist->fill, sz))) {
        quicklist->head->zl = ziplistPush(quicklist->head->zl, value, sz, ZIPLIST_HEAD);
        quicklist->head->count++;
    } else {
        quicklistNode *node = quicklistCreateNode();
        node->zl = ziplistPush(ziplistNew(), value, sz, ZIPLIST_HEAD);
        node->count++;
        _quicklistInsertNodeBefore(quicklist, quicklist->head, node);
    }
    quicklist->count++;
    return 1;
}
```

## 性能分析和优化建议

### 1. 数据结构复杂度分析

| 数据结构 | 时间复杂度 | 空间复杂度 | 适用场景 |
|----------|------------|------------|----------|
| SDS | O(1) | O(n) | 字符串操作 |
| Dict | O(1)平均 | O(n) | 键值对存储 |
| SkipList | O(log n) | O(n) | 排序集合 |
| ZipList | O(n) | O(n) | 小数据集合 |
| IntSet | O(log n) | O(n) | 整数集合 |
| QuickList | O(n) | O(n) | 列表操作 |

### 2. 内存优化策略

**选择合适的数据结构**：
```redis
# 小Hash使用ZipList
# 当Hash元素数量小于512且每个元素值小于64字节时，使用ZipList
hash-max-ziplist-entries 512
hash-max-ziplist-value 64

# 小List使用ZipList
# 当List元素数量小于512且每个元素值小于64字节时，使用ZipList
list-max-ziplist-size -2

# 小Set使用IntSet
# 当Set元素都是整数且数量小于512时，使用IntSet
set-max-intset-entries 512

# 小Sorted Set使用ZipList
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
```

### 3. 性能监控

```bash
# 查看内存使用情况
redis-cli info memory | grep used_memory_human

# 查看数据结构信息
redis-cli memory usage key_name

# 监控数据结构变化
redis-cli monitor | grep -E "(SET|HSET|LPUSH|SADD|ZADD)"
```

## 总结

Redis的内部数据结构设计体现了高性能和高效率的追求：

1. **SDS**：通过预分配和惰性释放机制优化字符串操作
2. **Dict**：采用渐进式rehash和链地址法解决哈希冲突
3. **SkipList**：提供O(log n)的查找性能，同时支持范围查询
4. **ZipList**：通过连续内存存储节省空间，适合小数据集合
5. **IntSet**：针对整数集合优化，支持自动升级
6. **QuickList**：结合链表和ZipList的优势，平衡性能和内存使用

理解这些内部数据结构的工作原理，有助于我们更好地使用Redis，选择合适的数据类型，进行性能调优和问题诊断。在实际应用中，应该根据具体场景选择最适合的数据结构，充分发挥Redis的性能优势。