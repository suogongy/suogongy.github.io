---
title: "Java项目线上问题排查"
description: "Java应用常见问题诊断和解决方案"
date: "2024-10-14"
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

**排查步骤**
```bash
# 1. 查看CPU使用率
top -p <pid>

# 2. 查看线程CPU使用情况
top -H -p <pid>

# 3. 导出线程栈
jstack <pid> > thread_dump.txt

# 4. 将线程ID转换为16进制
printf "%x\n" <thread_id>

# 5. 在线程栈中查找对应线程
grep -A 20 <hex_thread_id> thread_dump.txt
```

**自动化排查脚本**
```bash
#!/bin/bash
# cpu_troubleshoot.sh

PID=$1
if [ -z "$PID" ]; then
    echo "Usage: $0 <pid>"
    exit 1
fi

echo "=== CPU使用情况 ==="
top -p $PID -n 1 | head -20

echo "=== 高CPU线程 ==="
top -H -p $PID -n 1 | head -20

echo "=== 生成线程栈 ==="
jstack $PID > thread_dump_$(date +%Y%m%d_%H%M%S).txt

echo "=== 获取GC信息 ==="
jstat -gc $PID 1s 10

echo "=== 查看堆内存使用 ==="
jmap -histo $PID | head -20
```

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

**OOM分析脚本**
```bash
#!/bin/bash
# oom_analysis.sh

PID=$1
DUMP_FILE="heap_$(date +%Y%m%d_%H%M%S).hprof"

echo "=== 生成堆转储文件 ==="
jmap -dump:format=b,file=$DUMP_FILE $PID

echo "=== 堆转储文件大小 ==="
ls -lh $DUMP_FILE

echo "=== 使用MAT分析 ==="
echo "请使用MAT工具打开 $DUMP_FILE 进行分析"

# 自动分析脚本
cat > oom_analysis.py << 'EOF'
import sys
import re

def analyze_heap_dump(file_path):
    # 这里可以添加自动分析逻辑
    print(f"分析堆转储文件: {file_path}")
    
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python oom_analysis.py <heap_dump_file>")
        sys.exit(1)
    
    analyze_heap_dump(sys.argv[1])
EOF

python oom_analysis.py $DUMP_FILE
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

**死锁检测脚本**
```bash
#!/bin/bash
# deadlock_detector.sh

PID=$1

echo "=== 检测死锁 ==="
jstack $PID | grep -A 20 "Found one Java-level deadlock"

echo "=== 线程状态统计 ==="
jstack $PID | grep -E "java.lang.Thread.State:" | sort | uniq -c

echo "=== 阻塞线程 ==="
jstack $PID | grep -A 5 "BLOCKED"
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

**错误日志分析**
```bash
#!/bin/bash
# log_analyzer.sh

LOG_FILE=$1
if [ -z "$LOG_FILE" ]; then
    echo "Usage: $0 <log_file>"
    exit 1
fi

echo "=== 错误统计 ==="
grep -E "ERROR|Exception" $LOG_FILE | awk '{print $1, $2}' | sort | uniq -c | sort -nr

echo "=== 最近错误 ==="
tail -100 $LOG_FILE | grep -E "ERROR|Exception" | tail -10

echo "=== HTTP 5xx错误 ==="
grep -E "HTTP/1\.[01]\" [5][0-9][0-9]" $LOG_FILE | awk '{print $7}' | sort | uniq -c | sort -nr

echo "=== 慢查询日志 ==="
grep -E "took.*ms" $LOG_FILE | awk '$NF > 1000 {print $0}'
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

**服务快速重启脚本**
```bash
#!/bin/bash
# emergency_restart.sh

SERVICE_NAME=$1
if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service_name>"
    exit 1
fi

echo "=== 紧急重启服务: $SERVICE_NAME ==="

# 1. 备份当前状态
echo "备份服务状态..."
systemctl status $SERVICE_NAME > service_status_$(date +%Y%m%d_%H%M%S).txt

# 2. 停止服务
echo "停止服务..."
systemctl stop $SERVICE_NAME

# 3. 等待服务完全停止
sleep 5

# 4. 检查端口是否释放
PORT=$(netstat -tlnp | grep $SERVICE_NAME | awk '{print $4}' | cut -d: -f2)
if [ -n "$PORT" ]; then
    echo "端口 $PORT 仍被占用，强制终止进程..."
    pkill -f $SERVICE_NAME
fi

# 5. 启动服务
echo "启动服务..."
systemctl start $SERVICE_NAME

# 6. 检查服务状态
echo "检查服务状态..."
systemctl status $SERVICE_NAME

# 7. 验证服务可用性
echo "验证服务可用性..."
sleep 10
curl -f http://localhost:8080/health || echo "服务健康检查失败"

echo "=== 重启完成 ==="
```

## 总结

Java线上问题排查是一个系统性工程，需要掌握以下关键技能：

1. **工具使用**：熟练使用jstat、jstack、jmap、MAT等工具
2. **问题分类**：能够快速识别问题类型和影响范围
3. **分析方法**：掌握科学的分析方法和思路
4. **经验积累**：通过实际案例积累经验
5. **预防措施**：建立完善的监控和预防机制

通过系统化的排查方法和工具使用，可以快速定位和解决线上问题，保障系统的稳定运行。