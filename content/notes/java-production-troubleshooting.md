---
title: "Java项目线上问题排查"
description: "Java应用常见问题诊断和解决方案"
excerpt: "详细介绍Java项目在线上环境中常见的问题排查方法、诊断工具和解决方案，包括CPU、内存、线程、网络等方面的故障排查。"
tags: ["Java", "线上排查", "性能调优", "故障诊断", "JVM"]
category: "notes"
---

# Java项目线上问题排查

> 线上问题排查是Java开发者的必备技能，掌握正确的排查方法和工具是关键

## 问题分类与排查思路

### 1. 常见问题类型

```
Java线上问题分类：
├── CPU问题
│   ├── CPU使用率过高
│   ├── CPU负载过高
│   └── 上下文切换频繁
├── 内存问题
│   ├── 内存溢出（OOM）
│   ├── 内存泄漏
│   └── GC频繁
├── 线程问题
│   ├── 死锁
│   ├── 线程阻塞
│   └── 线程数过多
├── 网络问题
│   ├── 连接超时
│   ├── 连接池耗尽
│   └── 网络延迟
└── 应用问题
    ├── 响应缓慢
    ├── 错误率升高
    └── 间歇性故障
```

### 2. 排查方法论

**问题排查流程**
```
1. 问题现象确认
   ├── 确定问题影响范围
   ├── 收集关键指标
   └── 复现问题现象

2. 初步诊断
   ├── 查看系统资源
   ├── 分析应用日志
   └── 检查监控指标

3. 深入分析
   ├── 使用专业工具
   ├── 分析堆栈信息
   └── 定位根本原因

4. 解决方案
   ├── 制定修复方案
   ├── 实施变更
   └── 验证效果
```

## CPU问题排查

### 1. CPU使用率过高

**详细排查步骤**

### 第一步：确认高CPU进程
```bash
# 查看系统整体CPU使用情况
top

# 查看具体Java进程的CPU使用率，将<pid>替换为实际的Java进程ID
top -p <pid>

# 观察要点：
# - %CPU列：查看CPU使用率百分比
# - %MEM列：查看内存使用率
# - TIME+列：查看累计CPU时间
# - S列：查看进程状态（R=运行，S=睡眠，D=不可中断睡眠）
```

### 第二步：定位高CPU线程
```bash
# 查看进程中各个线程的CPU使用情况
top -H -p <pid>

# 操作要点：
# 1. 按Shift+P按CPU使用率排序
# 2. 记录CPU使用率最高的线程ID（PID列）
# 3. 通常关注CPU使用率超过80%的线程
```

### 第三步：生成线程栈文件
```bash
# 生成当前时刻的线程快照
jstack <pid> > thread_dump_$(date +%Y%m%d_%H%M%S).txt

# 连续生成多次线程快照（间隔5秒，共3次），用于对比分析
for i in {1..3}
do
   jstack <pid> > thread_dump_${i}_$(date +%Y%m%d_%H%M%S).txt
   sleep 5
done
```

### 第四步：线程ID转换
```bash
# 将十进制线程ID转换为十六进制
printf "%x\n" <thread_id>

# 示例：
# 如果高CPU线程ID是12345
printf "%x\n" 12345
# 输出：3039
```

### 第五步：在线程栈中定位问题线程
```bash
# 查找特定线程的栈信息
grep -A 30 "nid=0x<hex_thread_id>" thread_dump.txt

# 示例：查找线程ID 3039
grep -A 30 "nid=0x3039" thread_dump.txt

# 查看所有线程状态统计
grep "java.lang.Thread.State:" thread_dump.txt | sort | uniq -c

# 查找RUNNABLE状态的线程
grep -A 10 "RUNNABLE" thread_dump.txt
```

### 第六步：分析线程栈找到问题代码
根据线程栈信息，重点分析以下几个方面：

**1. 死循环识别**
```
"Thread-1" #12 prio=5 os_prio=0 tid=0x00007f8c2c018000 nid=0x2a1b runnable [0x00007f8c140fe000]
   java.lang.Thread.State: RUNNABLE
        at com.example.DeadLoop.process(DeadLoop.java:23)
        - locked <0x00000000d5f6b4e0> (a java.lang.Object)
        at com.example.DeadLoop.run(DeadLoop.java:15)
```
**分析要点：**
- 查看循环代码位置（文件名:行号）
- 确认循环是否有合适的退出条件
- 检查是否有异常处理导致的无限循环

**2. 频繁GC导致的高CPU**
```
"GC Thread#0" os_prio=0 tid=0x00007f8c2c050800 nid=0x2a1c runnable
"GC Thread#1" os_prio=0 tid=0x00007f8c2c052800 nid=0x2a1d runnable
```
**分析要点：**
- 检查是否有多个GC线程同时运行
- 使用jstat命令监控GC情况
- 分析是否内存分配过于频繁

**3. 锁竞争导致的等待**
```
"Thread-3" #14 prio=5 os_prio=0 tid=0x00007f8c2c028000 nid=0x2a1e waiting for monitor entry [0x00007f8c141ff000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.example.LockExample.method1(LockExample.java:32)
        - waiting to lock <0x00000000d5f6b5a0> (a java.lang.Object)
        - locked <0x00000000d5f6b5b0> (a java.lang.Object)
```
**分析要点：**
- 查看BLOCKED状态的线程
- 确认等待的锁对象
- 检查是否存在死锁情况

### 第七步：结合其他工具进行深度分析
```bash
# 查看GC情况（每秒输出一次，共10次）
jstat -gc <pid> 1s 10

# 查看堆内存对象分布
jmap -histo <pid> | head -20

# 查看JVM参数
jinfo -flags <pid>

# 查看进程的文件描述符使用情况
lsof -p <pid> | wc -l
```

### 第八步：问题定位和解决方案

**常见问题和解决方法：**

1. **死循环问题**
   - 定位循环代码位置
   - 添加合适的退出条件
   - 增加日志输出用于监控

2. **算法效率问题**
   - 查看是否有低效算法（如嵌套循环）
   - 考虑使用更高效的数据结构
   - 增加缓存机制

3. **锁竞争问题**
   - 减少锁的粒度
   - 使用读写锁替代同步锁
   - 考虑使用无锁数据结构

4. **频繁GC问题**
   - 检查内存分配模式
   - 优化对象创建
   - 调整JVM内存参数

### 2. Java代码中的CPU问题

**死循环检测**
```java
// 死循环示例
public class DeadLoop {
    public void process() {
        while (true) {
            // 没有退出条件的循环
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}

// 频繁Full GC
public class FrequentGC {
    public void process() {
        List<byte[]> list = new ArrayList<>();
        while (true) {
            list.add(new byte[1024 * 1024]); // 1MB
        }
    }
}
```

**CPU密集型操作优化**
```java
// 优化前
public List<Integer> calculatePrimes(int limit) {
    List<Integer> primes = new ArrayList<>();
    for (int i = 2; i <= limit; i++) {
        if (isPrime(i)) {
            primes.add(i);
        }
    }
    return primes;
}

// 优化后：使用并行流
public List<Integer> calculatePrimes(int limit) {
    return IntStream.rangeClosed(2, limit)
        .parallel()
        .filter(this::isPrime)
        .boxed()
        .collect(Collectors.toList());
}
```

## 内存问题排查

### 1. 内存溢出（OOM）

**堆内存溢出**
```bash
# 1. 查看内存使用
jstat -gc <pid> 1s 5

# 2. 生成堆转储文件
jmap -dump:format=b,file=heap.hprof <pid>

# 3. 分析堆转储文件
jhat heap.hprof

# 4. 使用MAT分析
# 启动MAT工具，导入heap.hprof文件
```

**OOM详细排查步骤**

### 第一步：确认OOM现象
```bash
# 查看系统日志中的OOM信息
sudo dmesg | grep -i "killed process"

# 查看Java应用日志中的OutOfMemoryError
tail -1000 /path/to/application.log | grep -i "OutOfMemoryError"

# 查看系统内存使用情况
free -h
cat /proc/meminfo | grep -E "(MemTotal|MemFree|MemAvailable)"
```

### 第二步：分析JVM内存使用
```bash
# 实时监控JVM内存使用情况（每秒输出一次，共10次）
jstat -gc <pid> 1s 10

# 查看JVM堆内存详细信息
jstat -gcutil <pid> 1000 5

# 查看新生代和老年代的使用情况
jstat -gcnew <pid> 1000 3
jstat -gcold <pid> 1000 3
```

**输出结果分析：**
- **YGC**: 年轻代GC次数
- **FGC**: 老年代GC次数
- **FGCT**: 老年代GC耗时
- **GCT**: 总GC耗时
- **E**: 新生代使用率
- **O**: 老年代使用率

### 第三步：生成堆转储文件
```bash
# 生成当前时刻的堆转储文件
jmap -dump:format=b,file=heap_$(date +%Y%m%d_%H%M%S).hprof <pid>

# 如果堆内存过大（超过8GB），可以只转储活跃对象
jmap -dump:live,format=b,file=heap_live_$(date +%Y%m%d_%H%M%S).hprof <pid>

# 检查生成的堆转储文件大小
ls -lh heap_*.hprof
```

### 第四步：分析堆转储文件

**使用jhat进行分析（适用于小型堆转储）**
```bash
# 启动jhat服务器（默认端口7000）
jhat heap_20231201_143022.hprof

# 浏览器访问分析结果
# http://localhost:7000

# 查看堆使用概览
curl http://localhost:7000/histo/

# 查看对象实例统计
curl http://localhost:7000/showHeapHistogram/

# 停止jhat服务
pkill jhat
```

**使用MAT（Memory Analyzer Tool）进行深度分析**
```bash
# 下载并安装MAT（如果尚未安装）
# wget https://www.eclipse.org/downloads/download.php?file=/mat/1.14.0/rcp/MemoryAnalyzer-1.14.0.20230315-macosx.cocoa.x86_64.dmg

# 启动MAT工具
# /path/to/mat/MemoryAnalyzer

# 在MAT中打开堆转储文件并进行分析
```

**MAT分析重点：**
1. **Leak Suspects Report** - 自动检测可能的内存泄漏
2. **Dominator Tree** - 查看占用内存最大的对象
3. **Histogram** - 对象实例数量统计
4. **Thread Dump** - 查看线程相关的对象引用

### 第五步：分析对象分布情况
```bash
# 查看堆中对象数量和内存占用排序
jmap -histo <pid> | head -20

# 将结果保存到文件
jmap -histo <pid> > heap_objects_$(date +%Y%m%d_%H%M%S).txt

# 查看特定类的对象实例
jmap -histo <pid> | grep "com.example.YourClass"

# 查看字符串对象的内存占用
jmap -histo <pid> | grep "java.lang.String"
```

### 第六步：检查GC配置和行为
```bash
# 查看当前JVM参数
jinfo -flags <pid>

# 查看GC详细信息
jstat -gcutil <pid> 1s 10 | tee gc_usage_$(date +%Y%m%d_%H%M%S).log

# 查看GC日志（如果开启了GC日志）
tail -f /path/to/gc.log
```

### 第七步：分析常见OOM类型及解决方案

**1. Java heap space OOM**
```
java.lang.OutOfMemoryError: Java heap space
```
**排查步骤：**
- 检查堆内存配置：`-Xms` 和 `-Xmx`
- 分析堆转储文件，找到占用内存最多的对象
- 检查是否存在内存泄漏（静态集合、缓存未清理等）

**解决方案：**
```bash
# 增加堆内存
-Xms2g -Xmx4g

# 或者优化代码，减少内存占用
# 1. 及时释放不需要的对象引用
# 2. 使用弱引用或软引用
# 3. 避免一次性加载大量数据
```

**2. Metaspace OOM**
```
java.lang.OutOfMemoryError: Metaspace
```
**排查步骤：**
- 检查元空间使用情况
- 查看类加载器的信息

**解决方案：**
```bash
# 增加元空间大小
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m

# 或者优化类加载机制
# 1. 避免热部署导致的类重复加载
# 2. 使用合理的类加载器策略
```

**3. GC overhead limit exceeded**
```
java.lang.OutOfMemoryError: GC overhead limit exceeded
```
**排查步骤：**
- 检查GC频率和耗时
- 分析对象创建和回收模式

**解决方案：**
```bash
# 调整GC参数
-XX:+UseG1GC -XX:MaxGCPauseMillis=200

# 或者优化对象生命周期
# 1. 减少临时对象的创建
# 2. 优化数据结构选择
```

**4. Unable to create new native thread**
```
java.lang.OutOfMemoryError: unable to create new native thread
```
**排查步骤：**
- 检查线程数限制
- 查看线程池配置

**解决方案：**
```bash
# 增加线程数限制
ulimit -u 4096

# 或优化线程池配置
# 1. 合理设置最大线程数
# 2. 使用线程池复用线程
```

### 第八步：预防措施和监控
```bash
# 设置JVM参数开启详细的GC日志
-XX:+PrintGCDetails -XX:+PrintGCTimeStamps -Xloggc:/path/to/gc.log

# 设置OOM时自动生成堆转储
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dumps/

# 监控脚本示例
while true; do
    memory_usage=$(jstat -gcutil <pid> | tail -1 | awk '{print $4}')
    if [ $memory_usage -gt 90 ]; then
        echo "警告：内存使用率过高: $memory_usage%"
        jmap -dump:format=b,file=heap_warning_$(date +%Y%m%d_%H%M%S).hprof <pid>
    fi
    sleep 60
done
```

### 2. 内存泄漏检测

**内存泄漏常见场景**
```java
// 静态集合持有对象引用
public class MemoryLeak {
    private static final List<Object> cache = new ArrayList<>();
    
    public void addToCache(Object obj) {
        cache.add(obj); // 永远不会被清理
    }
}

// 未关闭的资源
public class ResourceLeak {
    public void processData() {
        try {
            Connection conn = getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM large_table");
            // 没有关闭连接、Statement和ResultSet
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

// 监听器未移除
public class ListenerLeak {
    private List<EventListener> listeners = new ArrayList<>();
    
    public void addListener(EventListener listener) {
        listeners.add(listener);
    }
    
    // 缺少removeListener方法
}
```

**内存泄漏检测工具**
```java
// 使用WeakReference检测内存泄漏
public class MemoryLeakDetector {
    private static final Map<String, WeakReference<Object>> weakRefs = 
        new ConcurrentHashMap<>();
    
    public static void track(String key, Object obj) {
        weakRefs.put(key, new WeakReference<>(obj));
    }
    
    public static void checkLeaks() {
        for (Map.Entry<String, WeakReference<Object>> entry : weakRefs.entrySet()) {
            WeakReference<Object> ref = entry.getValue();
            if (ref.get() == null) {
                System.out.println("对象已被回收: " + entry.getKey());
            } else {
                System.out.println("可能的内存泄漏: " + entry.getKey());
            }
        }
    }
}
```

## 线程问题排查

### 1. 死锁检测

**死锁详细排查步骤**

### 第一步：生成线程快照
```bash
# 生成当前时刻的线程栈快照
jstack <pid> > thread_dump_$(date +%Y%m%d_%H%M%S).txt

# 连续生成多次线程快照（间隔10秒，共3次），用于对比分析
for i in {1..3}
do
   jstack <pid> > thread_dump_deadlock_${i}_$(date +%Y%m%d_%H%M%S).txt
   sleep 10
done
```

### 第二步：检测死锁信息
```bash
# 查找死锁信息
grep -A 50 "Found one Java-level deadlock" thread_dump.txt

# 如果存在死锁，会显示类似以下信息：
# Found one Java-level deadlock:
# ===================
# "Thread-1":
#   waiting to lock monitor 0x00007f8c2c0063e8 (object 0x00000000d5f6b5a0, a java.lang.Object),
#   which is held by "Thread-2"
# "Thread-2":
#   waiting to lock monitor 0x00007f8c2c0055e8 (object 0x00000000d5f6b5b0, a java.lang.Object),
#   which is held by "Thread-1"
```

### 第三步：分析线程状态分布
```bash
# 统计各种线程状态的数量
grep "java.lang.Thread.State:" thread_dump.txt | sort | uniq -c | sort -nr

# 查看所有阻塞状态的线程
grep -B 5 -A 10 "BLOCKED" thread_dump.txt

# 查看所有等待状态的线程
grep -B 5 -A 10 "WAITING" thread_dump.txt

# 查看所有 timed_waiting 状态的线程
grep -B 5 -A 10 "TIMED_WAITING" thread_dump.txt
```

### 第四步：定位阻塞的线程
```bash
# 查找所有被阻塞的线程及其等待的锁
grep -A 15 "waiting to lock" thread_dump.txt

# 查找所有持有锁的线程
grep -A 10 "locked" thread_dump.txt

# 查看具体的锁对象信息
grep -E "(waiting to lock|locked)" thread_dump.txt | grep -E "0x[0-9a-f]+"
```

### 第五步：分析死锁的具体情况

**死锁识别标准：**
1. 两个或多个线程互相等待对方持有的锁
2. 线程处于BLOCKED状态，且等待的锁被其他线程持有
3. 形成循环等待链

**死锁信息解读：**
```
示例死锁输出：
"Thread-A" #10 prio=5 os_prio=0 tid=0x00007f8c2c018000 nid=0x2a1b waiting for monitor entry [0x00007f8c140fe000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.example.DeadlockExample.method1(DeadlockExample.java:25)
        - waiting to lock <0x00000000d5f6b5a0> (a java.lang.Object)
        - locked <0x00000000d5f6b5b0> (a java.lang.Object)

"Thread-B" #11 prio=5 os_prio=0 tid=0x00007f8c2c028000 nid=0x2a1c waiting for monitor entry [0x00007f8c141ff000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.example.DeadlockExample.method2(DeadlockExample.java:35)
        - waiting to lock <0x00000000d5f6b5b0> (a java.lang.Object)
        - locked <0x00000000d5f6b5a0> (a java.lang.Object)
```

**分析要点：**
- Thread-A 等待锁 0x00000000d5f6b5a0，持有锁 0x00000000d5f6b5b0
- Thread-B 等待锁 0x00000000d5f6b5b0，持有锁 0x00000000d5f6b5a0
- 形成循环等待，导致死锁

### 第六步：结合代码定位问题
```bash
# 查看死锁发生的具体代码位置
grep -B 10 -A 5 "waiting to lock.*0x00000000d5f6b5a0" thread_dump.txt

# 查看涉及死锁的方法调用链
grep -E "at com\." thread_dump.txt | grep -E "(DeadlockExample|method1|method2)"
```

### 第七步：其他锁问题分析

**锁竞争分析：**
```bash
# 查看被多个线程等待的锁对象
grep "waiting to lock" thread_dump.txt | awk '{print $6}' | sort | uniq -c | sort -nr

# 查看持有锁时间较长的线程
grep -A 20 "locked.*0x" thread_dump.txt
```

**活锁检测：**
```bash
# 查看频繁改变状态的线程
grep -E "(RUNNABLE|TIMED_WAITING)" thread_dump.txt | head -20
```

### 第八步：死锁解决方案

**1. 代码层面解决：**
- 按固定顺序获取锁
- 减少锁的持有时间
- 使用tryLock()方法
- 使用超时机制

**2. 检测和恢复：**
```bash
# 启用JVM死锁检测参数
-XX:+PrintConcurrentLocks -XX:+PrintGCDetails

# 定期检查死锁的监控脚本
while true; do
    deadlock_count=$(jstack <pid> | grep -c "Found one Java-level deadlock")
    if [ $deadlock_count -gt 0 ]; then
        echo "警告：检测到死锁！"
        jstack <pid> > deadlock_detected_$(date +%Y%m%d_%H%M%S).txt
    fi
    sleep 30
done
```

### 第九步：预防措施
```bash
# JVM参数配置
-XX:+PrintConcurrentLocks          # 打印并发锁信息
-XX:+PrintGCApplicationStoppedTime # 打印GC停止时间
-XX:+PrintSafepointStatistics      # 打印安全点统计
-XX:+PrintGCApplicationConcurrentTime # 打印应用并发时间

# 代码审查重点：
# 1. 检查锁的获取顺序是否一致
# 2. 确认所有锁都有对应的释放操作
# 3. 避免在持锁时调用外部方法
# 4. 使用ReentrantLock替代synchronized关键字
```

**死锁示例和分析**
```java
// 死锁示例
public class DeadlockExample {
    private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();
    
    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            synchronized (lock1) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (lock2) {
                    System.out.println("Thread 1 acquired both locks");
                }
            }
        });
        
        Thread thread2 = new Thread(() -> {
            synchronized (lock2) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (lock1) {
                    System.out.println("Thread 2 acquired both locks");
                }
            }
        });
        
        thread1.start();
        thread2.start();
    }
}
```

### 2. 线程池问题

**线程池监控**
```java
@Component
public class ThreadPoolMonitor {
    
    @Autowired
    private ThreadPoolExecutor executor;
    
    @Scheduled(fixedRate = 5000)
    public void monitorThreadPool() {
        System.out.println("=== 线程池状态 ===");
        System.out.println("核心线程数: " + executor.getCorePoolSize());
        System.out.println("最大线程数: " + executor.getMaximumPoolSize());
        System.out.println("当前线程数: " + executor.getActiveCount());
        System.out.println("队列大小: " + executor.getQueue().size());
        System.out.println("完成任务数: " + executor.getCompletedTaskCount());
        
        // 告警逻辑
        if (executor.getActiveCount() > executor.getMaximumPoolSize() * 0.8) {
            System.out.println("警告: 线程池使用率过高");
        }
    }
}
```

## 网络问题排查

### 1. 连接超时问题

**网络连接监控**
```java
@Component
public class NetworkMonitor {
    
    private final RestTemplate restTemplate;
    
    public NetworkMonitor() {
        this.restTemplate = new RestTemplate();
        
        // 配置连接超时
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate.setRequestFactory(factory);
    }
    
    @Scheduled(fixedRate = 30000)
    public void checkConnectivity() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                "http://example.com/health", String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("网络连接正常");
            }
        } catch (Exception e) {
            System.err.println("网络连接异常: " + e.getMessage());
        }
    }
}
```

### 2. 连接池问题

**数据库连接池监控**
```java
@Component
public class ConnectionPoolMonitor {
    
    @Autowired
    private DataSource dataSource;
    
    @Scheduled(fixedRate = 10000)
    public void monitorConnectionPool() {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            HikariPoolMXBean poolProxy = hikariDataSource.getHikariPoolMXBean();
            
            System.out.println("=== 连接池状态 ===");
            System.out.println("活跃连接数: " + poolProxy.getActiveConnections());
            System.out.println("空闲连接数: " + poolProxy.getIdleConnections());
            System.out.println("总连接数: " + poolProxy.getTotalConnections());
            System.out.println("等待线程数: " + poolProxy.getThreadsAwaitingConnection());
            
            // 告警逻辑
            if (poolProxy.getActiveConnections() > poolProxy.getTotalConnections() * 0.8) {
                System.err.println("警告: 连接池使用率过高");
            }
        }
    }
}
```

## 日志分析

### 1. 日志配置优化

**Logback配置**
```xml
<!-- logback.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 异步日志 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <discardingThreshold>0</discardingThreshold>
        <queueSize>1024</queueSize>
        <appender-ref ref="FILE"/>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>
</configuration>
```

### 2. 日志分析脚本

**错误日志详细分析步骤**

### 第一步：错误日志基础分析
```bash
# 统计各类错误的出现次数
grep -E "ERROR|WARN|Exception" /path/to/application.log | awk '{print $1, $2}' | sort | uniq -c | sort -nr

# 查看最近的错误信息（最近50行）
tail -500 /path/to/application.log | grep -E "ERROR|Exception" | tail -20

# 按时间顺序查看错误分布
grep -E "ERROR|Exception" /path/to/application.log | awk '{print $1, $2}' | uniq -c
```

### 第二步：异常类型分析
```bash
# 统计各类异常的出现频率
grep -E "Exception" /path/to/application.log | sed 's/.*\(.*Exception\).*/\1/' | sort | uniq -c | sort -nr

# 查看最常见的5种异常
grep -E "Exception" /path/to/application.log | sed 's/.*\(.*Exception\).*/\1/' | sort | uniq -c | sort -nr | head -5

# 分析特定异常的详细信息
grep -A 10 -B 5 "NullPointerException" /path/to/application.log
```

### 第三步：HTTP错误分析
```bash
# 统计HTTP 5xx服务器错误
grep -E "HTTP/1\.[01]\" [5][0-9][0-9]" /path/to/access.log | awk '{print $9}' | sort | uniq -c | sort -nr

# 统计HTTP 4xx客户端错误
grep -E "HTTP/1\.[01]\" [4][0-9][0-9]" /path/to/access.log | awk '{print $9}' | sort | uniq -c | sort -nr

# 查看具体的错误页面
grep -E "HTTP/1\.[01]\" 5[0-9][0-9]" /path/to/access.log | awk '{print $7}' | sort | uniq -c | sort -nr | head -10

# 分析错误率（总请求数与错误数的比例）
total_requests=$(grep -c "HTTP/1\.[01]" /path/to/access.log)
error_requests=$(grep -c "HTTP/1\.[01]\" [5][0-9][0-9]" /path/to/access.log)
error_rate=$(echo "scale=2; $error_requests * 100 / $total_requests" | bc)
echo "错误率: ${error_rate}%"
```

### 第四步：性能日志分析
```bash
# 查找慢请求（响应时间超过1000ms）
grep -E "took.*ms" /path/to/application.log | awk '$NF > 1000 {print $0}' | sort -k4 -nr

# 统计不同接口的响应时间
grep -E "took.*ms" /path/to/application.log | awk '{gsub(/took/, "", $NF); gsub(/ms/, "", $NF); print $7, $NF}' | sort | uniq -c | sort -k2 -nr

# 查找最慢的10个请求
grep -E "took.*ms" /path/to/application.log | awk '{print $0}' | sort -k4 -nr | head -10

# 分析数据库慢查询
grep -E "slow.*query|timeout" /path/to/application.log | tail -20
```

### 第五步：时间段分析
```bash
# 按小时统计错误数量
grep -E "ERROR|Exception" /path/to/application.log | awk '{print substr($2,1,2)}' | sort | uniq -c | sort -nr

# 按日期统计错误趋势
grep -E "ERROR|Exception" /path/to/application.log | awk '{print $1}' | sort | uniq -c

# 查看特定时间段的错误（比如最近1小时）
find . -name "*.log" -mmin -60 -exec grep -E "ERROR|Exception" {} \;

# 实时监控错误日志
tail -f /path/to/application.log | grep -E "ERROR|Exception"
```

### 第六步：堆栈跟踪分析
```bash
# 提取完整的异常堆栈信息
grep -A 20 "Exception" /path/to/application.log | grep -v "^--$"

# 统计最常见的错误堆栈起始点
grep -A 5 "Exception" /path/to/application.log | grep "at " | awk '{print $2}' | sort | uniq -c | sort -nr | head -10

# 分析特定包下的异常
grep -A 15 "Exception" /path/to/application.log | grep "at com\.yourcompany\." | sort | uniq -c | sort -nr
```

### 第七步：日志文件管理
```bash
# 查看日志文件大小
ls -lh /path/to/logs/

# 查看日志文件的修改时间
ls -lt /path/to/logs/*.log

# 压缩旧日志文件
find /path/to/logs/ -name "*.log" -mtime +7 -exec gzip {} \;

# 清理超过30天的日志文件
find /path/to/logs/ -name "*.log.gz" -mtime +30 -delete

# 查看磁盘使用情况
df -h /path/to/logs/
```

### 第八步：跨文件日志分析
```bash
# 同时分析多个日志文件
grep -E "ERROR|Exception" /path/to/logs/*.log

# 按时间顺序合并多个日志文件
cat /path/to/logs/app-*.log | sort | uniq > /tmp/combined_logs.log

# 查找特定错误在所有日志文件中的分布
grep -r "NullPointerException" /path/to/logs/

# 统计每个日志文件中的错误数量
for file in /path/to/logs/*.log; do
    error_count=$(grep -c "ERROR" "$file")
    echo "$file: $error_count errors"
done
```

### 第九步：日志分析进阶技巧

**使用awk进行复杂分析：**
```bash
# 统计每个小时的错误类型分布
grep -E "ERROR|Exception" /path/to/application.log | awk '{
    hour = substr($2,1,2);
    if(/ERROR/) type="ERROR";
    else if(/Exception/) type="EXCEPTION";
    count[hour][type]++;
} END {
    for(h in count) {
        for(t in count[h]) {
            printf "%s时 %s: %d\n", h, t, count[h][t];
        }
    }
}'

# 分析错误间隔时间
grep -E "ERROR" /path/to/application.log | awk '{
    split($2, time, ":");
    current_seconds = time[1]*3600 + time[2]*60 + time[3];
    if(prev_seconds > 0) {
        interval = current_seconds - prev_seconds;
        print "错误间隔: " interval "秒";
    }
    prev_seconds = current_seconds;
}'
```

**实时监控和告警：**
```bash
# 实时监控特定错误并告警
tail -f /path/to/application.log | while read line; do
    if echo "$line" | grep -q "OutOfMemoryError"; then
        echo "严重告警：检测到内存溢出错误！"
        # 发送告警通知
    fi
done

# 错误频率监控
error_count=0
while true; do
    new_errors=$(grep -c "ERROR" /path/to/application.log)
    if [ $new_errors -gt $error_count ]; then
        echo "检测到新的错误，当前错误总数: $new_errors"
        error_count=$new_errors
    fi
    sleep 60
done
```

### 第十步：日志分析工具推荐

**常用工具组合：**
```bash
# 使用multitail同时查看多个日志文件
multitail /path/to/application.log /path/to/access.log

# 使用ccze为日志添加颜色
tail -f /path/to/application.log | ccze

# 使用lnav进行高级日志分析
lnav /path/to/application.log
```

**性能优化的grep命令：**
```bash
# 使用fgrep进行固定字符串搜索（更快）
fgrep "ERROR" /path/to/large_file.log

# 使用ripgrep（如果安装）进行更快的搜索
rg "ERROR" /path/to/logs/

# 并行搜索多个文件
find /path/to/logs/ -name "*.log" -exec grep -l "ERROR" {} \;
```

## 性能监控工具

### 1. JVM监控

**JMX监控**
```java
@Component
public class JVMMonitor {
    
    private final MemoryMXBean memoryMXBean;
    private final ThreadMXBean threadMXBean;
    private final RuntimeMXBean runtimeMXBean;
    
    public JVMMonitor() {
        MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();
        this.memoryMXBean = ManagementFactory.newPlatformMXBeanProxy(
            mBeanServer, ManagementFactory.MEMORY_MXBEAN_NAME, MemoryMXBean.class);
        this.threadMXBean = ManagementFactory.newPlatformMXBeanProxy(
            mBeanServer, ManagementFactory.THREAD_MXBEAN_NAME, ThreadMXBean.class);
        this.runtimeMXBean = ManagementFactory.newPlatformMXBeanProxy(
            mBeanServer, ManagementFactory.RUNTIME_MXBEAN_NAME, RuntimeMXBean.class);
    }
    
    @Scheduled(fixedRate = 10000)
    public void monitorJVM() {
        // 内存监控
        MemoryUsage heapUsage = memoryMXBean.getHeapMemoryUsage();
        double heapUsagePercent = (double) heapUsage.getUsed() / heapUsage.getMax() * 100;
        
        // 线程监控
        int threadCount = threadMXBean.getThreadCount();
        
        // GC监控
        List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
        
        System.out.println("=== JVM监控 ===");
        System.out.println("堆内存使用率: " + String.format("%.2f%%", heapUsagePercent));
        System.out.println("线程数: " + threadCount);
        
        // 告警逻辑
        if (heapUsagePercent > 80) {
            System.err.println("警告: 堆内存使用率过高");
        }
    }
}
```

### 2. 应用性能监控（APM）

**自定义性能监控**
```java
@Component
public class PerformanceMonitor {
    
    private final MeterRegistry meterRegistry;
    
    public PerformanceMonitor(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }
    
    public void recordApiCall(String apiName, long duration, String status) {
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("api.call.time")
            .tag("api", apiName)
            .tag("status", status)
            .register(meterRegistry));
        
        Counter.builder("api.call.count")
            .tag("api", apiName)
            .tag("status", status)
            .register(meterRegistry)
            .increment();
    }
    
    @Aspect
    @Component
    public class ApiMonitorAspect {
        
        @Around("@annotation(Monitored)")
        public Object monitorApi(ProceedingJoinPoint joinPoint) throws Throwable {
            long startTime = System.currentTimeMillis();
            String apiName = joinPoint.getSignature().getName();
            
            try {
                Object result = joinPoint.proceed();
                long duration = System.currentTimeMillis() - startTime;
                
                performanceMonitor.recordApiCall(apiName, duration, "SUCCESS");
                return result;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                
                performanceMonitor.recordApiCall(apiName, duration, "ERROR");
                throw e;
            }
        }
    }
}
```

## 应急处理流程

### 1. 故障响应流程

```
故障响应流程：
1. 故障发现
   ├── 监控系统告警
   ├── 用户反馈
   └── 主动巡检

2. 故障确认
   ├── 确认影响范围
   ├── 评估严重程度
   └── 启动应急响应

3. 快速止损
   ├── 服务降级
   ├── 流量限制
   └── 紧急回滚

4. 问题定位
   ├── 收集日志
   ├── 分析监控数据
   └── 复现问题

5. 修复验证
   ├── 实施修复
   ├── 验证效果
   └── 恢复服务

6. 复盘总结
   ├── 分析根因
   ├── 制定改进措施
   └── 更新应急预案
```

### 2. 应急脚本

**应急处理详细操作步骤**

### 第一步：故障快速评估
```bash
# 1. 检查服务状态
systemctl status your-service-name
# 或使用旧版本的service命令
service your-service-name status

# 2. 检查端口占用情况
netstat -tlnp | grep :8080
# 或使用ss命令（更现代）
ss -tlnp | grep :8080

# 3. 检查进程状态
ps aux | grep java
ps -ef | grep your-application-name

# 4. 检查系统资源
free -h                    # 内存使用情况
df -h                      # 磁盘空间
top -b -n1 | head -20      # CPU使用情况
```

### 第二步：备份关键信息
```bash
# 1. 备份服务状态信息
systemctl status your-service-name > service_backup_$(date +%Y%m%d_%H%M%S).txt

# 2. 备份配置文件
cp /path/to/your/application.properties config_backup_$(date +%Y%m%d_%H%M%S).properties
cp /path/to/your/application.yml config_backup_$(date +%Y%m%d_%H%M%S).yml

# 3. 备份最近的日志
cp /path/to/logs/application.log /tmp/application_before_restart_$(date +%Y%m%d_%H%M%S).log

# 4. 生成故障时刻的线程快照
jstack <pid> > thread_dump_emergency_$(date +%Y%m%d_%H%M%S).txt

# 5. 生成故障时刻的堆转储（如果内存问题）
jmap -dump:format=b,file=heap_emergency_$(date +%Y%m%d_%H%M%S).hprof <pid>
```

### 第三步：停止应用服务
```bash
# 方法1：优雅停止（推荐）
systemctl stop your-service-name

# 方法2：使用kill命令（如果systemctl无效）
kill -15 <pid>  # 发送TERM信号，优雅停止

# 方法3：强制停止（最后手段）
kill -9 <pid>   # 发送KILL信号，强制停止

# 等待服务完全停止
sleep 10

# 验证进程已停止
ps aux | grep java | grep your-application-name
```

### 第四步：检查端口和资源释放
```bash
# 检查端口是否已释放
netstat -tlnp | grep :8080

# 如果端口仍被占用，查找占用进程
lsof -i :8080

# 强制释放端口（如有必要）
fuser -k 8080/tcp

# 检查文件描述符是否释放
lsof -p <pid> | wc -l

# 检查临时文件清理
ls -la /tmp/ | grep your-app
```

### 第五步：启动应用服务
```bash
# 方法1：使用systemctl（推荐）
systemctl start your-service-name

# 方法2：使用service命令
service your-service-name start

# 方法3：直接启动（如果有启动脚本）
/path/to/your/startup.sh

# 方法4：使用java命令直接启动
java -jar -Xms2g -Xmx4g your-application.jar

# 等待服务启动完成
sleep 30
```

### 第六步：验证服务状态
```bash
# 1. 检查服务状态
systemctl status your-service-name

# 2. 检查进程是否运行
ps aux | grep java | grep your-application-name

# 3. 检查端口是否监听
netstat -tlnp | grep :8080

# 4. 检查应用日志
tail -50 /path/to/logs/application.log

# 5. 执行健康检查
curl -f http://localhost:8080/actuator/health
# 或使用其他健康检查端点
curl -f http://localhost:8080/health
curl -f http://localhost:8080/api/health
```

### 第七步：功能验证
```bash
# 1. 检查关键接口
curl -X GET http://localhost:8080/api/critical-endpoint

# 2. 检查数据库连接
curl -X GET http://localhost:8080/api/db-status

# 3. 检查外部依赖
curl -X GET http://localhost:8080/api/external-deps-status

# 4. 检查缓存状态
curl -X GET http://localhost:8080/api/cache-status

# 5. 验证业务核心功能
curl -X POST http://localhost:8080/api/business-function -d "test data"
```

### 第八步：监控服务稳定性
```bash
# 1. 持续监控服务状态
watch -n 5 'systemctl status your-service-name'

# 2. 监控错误日志
tail -f /path/to/logs/application.log | grep -E "ERROR|WARN"

# 3. 监控资源使用
top -p <pid>

# 4. 监控GC情况
jstat -gc <pid> 5s

# 5. 监控HTTP响应
while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
    echo "$(date): HTTP响应码: $response"
    if [ $response -ne 200 ]; then
        echo "警告：服务响应异常"
    fi
    sleep 10
done
```

### 第九步：不同场景的应急处理

**内存溢出场景：**
```bash
# 1. 检查内存使用
free -h
jstat -gc <pid>

# 2. 增加堆内存重启
java -Xms4g -Xmx8g -XX:+HeapDumpOnOutOfMemoryError your-application.jar

# 3. 设置OOM时自动dump
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dumps/
```

**CPU过高场景：**
```bash
# 1. 生成线程快照
jstack <pid> > high_cpu_threads.txt

# 2. 分析高CPU线程
top -H -p <pid>

# 3. 查找问题线程
thread_id=$(top -H -p <pid> -b -n1 | grep java | head -1 | awk '{print $1}')
hex_id=$(printf "%x\n" $thread_id)
grep -A 20 "nid=0x$hex_id" high_cpu_threads.txt
```

**数据库连接池耗尽：**
```bash
# 1. 检查数据库连接
show processlist;  # MySQL

# 2. 重启应用前检查连接
netstat -an | grep :3306 | wc -l

# 3. 调整连接池配置
spring.datasource.hikari.maximum-pool-size=50
```

**磁盘空间不足：**
```bash
# 1. 清理日志文件
find /path/to/logs -name "*.log" -mtime +7 -delete

# 2. 清理临时文件
find /tmp -name "*tmp*" -mtime +1 -delete

# 3. 压缩大文件
gzip /path/to/large/log/file.log
```

### 第十步：预防措施和监控设置

**设置监控脚本：**
```bash
# 创建服务监控脚本
cat > /usr/local/bin/monitor_service.sh << 'EOF'
#!/bin/bash
SERVICE_NAME="your-service-name"
LOG_FILE="/var/log/service_monitor.log"

check_service() {
    if ! systemctl is-active --quiet $SERVICE_NAME; then
        echo "$(date): 服务 $SERVICE_NAME 未运行，尝试重启" >> $LOG_FILE
        systemctl restart $SERVICE_NAME
    fi

    # 检查健康状态
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null)
    if [ "$response" != "200" ]; then
        echo "$(date): 服务健康检查失败，响应码: $response" >> $LOG_FILE
    fi
}

check_service
EOF

chmod +x /usr/local/bin/monitor_service.sh

# 添加到crontab，每5分钟检查一次
echo "*/5 * * * * /usr/local/bin/monitor_service.sh" | crontab -
```

**设置告警阈值：**
```bash
# 内存使用率监控
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $memory_usage -gt 85 ]; then
    echo "警告：内存使用率过高: ${memory_usage}%" | mail -s "服务器告警" admin@example.com
fi

# 磁盘空间监控
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 90 ]; then
    echo "警告：磁盘使用率过高: ${disk_usage}%" | mail -s "服务器告警" admin@example.com
fi
```

**建立标准操作流程（SOP）：**
1. 故障发现 → 立即评估影响范围
2. 快速备份 → 保存故障现场数据
3. 优雅停止 → 避免数据丢失
4. 彻底检查 → 确保资源释放
5. 重新启动 → 按标准流程启动
6. 全面验证 → 确保功能正常
7. 持续监控 → 防止问题复现
8. 总结复盘 → 完善应急预案

## 总结

Java线上问题排查是一个系统性工程，需要掌握以下关键技能：

1. **工具使用**：熟练使用jstat、jstack、jmap、MAT等工具
2. **问题分类**：能够快速识别问题类型和影响范围
3. **分析方法**：掌握科学的分析方法和思路
4. **经验积累**：通过实际案例积累经验
5. **预防措施**：建立完善的监控和预防机制

通过系统化的排查方法和工具使用，可以快速定位和解决线上问题，保障系统的稳定运行。