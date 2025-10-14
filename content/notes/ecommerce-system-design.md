---
title: "电商系统设计详解"
description: "电商平台整体架构设计"
date: "2024-10-14"
excerpt: "深入分析电商系统的整体架构设计，包括用户管理、商品管理、订单管理、支付系统、搜索系统等核心模块的设计思路和实现方案。"
tags: ["电商系统", "系统设计", "架构设计", "微服务", "高并发"]
category: "notes"
---

# 电商系统设计详解

> 电商系统是复杂业务系统的典型代表，其架构设计涵盖了多个技术领域

## 电商系统概述

### 1. 系统架构图

```
电商系统架构：
┌─────────────────────────────────────────────────────────────┐
│                    前端应用层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Web       │ │   Mobile    │ │   Mini      │           │
│  │   App       │ │   App       │ │   Program   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │
                    ┌─────────────┐
                    │  API        │
                    │  Gateway    │
                    └─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  User       │ │  Product    │ │  Order      │
    │  Service    │ │  Service    │ │  Service    │
    └─────────────┘ └─────────────┘ └─────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Payment    │ │  Search     │ │  Inventory  │
    │  Service    │ │  Service    │ │  Service    │
    └─────────────┘ └─────────────┘ └─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  MySQL      │ │  Redis      │ │  MQ         │
    │  Cluster    │ │  Cluster    │ │  Cluster    │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### 2. 核心业务模块

```
核心业务模块：
├── 用户中心
│   ├── 用户注册登录
│   ├── 用户信息管理
│   ├── 地址管理
│   └── 会员体系
├── 商品中心
│   ├── 商品管理
│   ├── 分类管理
│   ├── 品牌管理
│   └── 库存管理
├── 订单中心
│   ├── 订单创建
│   ├── 订单查询
│   ├── 订单状态管理
│   └── 订单统计
├── 支付中心
│   ├── 支付接口
│   ├── 支付回调
│   ├── 退款处理
│   └── 对账管理
├── 搜索中心
│   ├── 商品搜索
│   ├── 搜索推荐
│   ├── 搜索统计
│   └── 搜索优化
└── 营销中心
    ├── 优惠券
    ├── 秒杀活动
    ├── 拼团活动
    └── 积分系统
```

## 用户中心设计

### 1. 用户注册登录

**用户服务实现**
```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtAuthenticationService jwtService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 用户注册
    public User register(UserRegistrationRequest request) {
        // 1. 验证用户名唯一性
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }
        
        // 2. 验证邮箱唯一性
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已存在");
        }
        
        // 3. 验证手机号唯一性
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("手机号已存在");
        }
        
        // 4. 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setCreateTime(new Date());
        
        return userRepository.save(user);
    }
    
    // 用户登录
    public LoginResponse login(LoginRequest request) {
        // 1. 验证用户名密码
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new BusinessException("用户名或密码错误"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        
        // 2. 检查用户状态
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("用户账号已被禁用");
        }
        
        // 3. 生成JWT Token
        String token = jwtService.generateToken(createUserDetails(user));
        
        // 4. 更新最后登录时间
        user.setLastLoginTime(new Date());
        userRepository.save(user);
        
        // 5. 记录登录日志
        recordLoginLog(user.getId(), request.getIp());
        
        return new LoginResponse(token, user);
    }
    
    // 发送验证码
    public void sendVerificationCode(String phone) {
        // 1. 生成验证码
        String code = generateVerificationCode();
        
        // 2. 存储验证码（5分钟过期）
        String key = "verification:code:" + phone;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        
        // 3. 发送短信
        smsService.sendVerificationCode(phone, code);
    }
    
    // 验证手机号
    public boolean verifyPhone(String phone, String code) {
        String key = "verification:code:" + phone;
        String storedCode = redisTemplate.opsForValue().get(key);
        
        if (storedCode != null && storedCode.equals(code)) {
            redisTemplate.delete(key);
            return true;
        }
        
        return false;
    }
    
    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
    
    private UserDetails createUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities("ROLE_USER")
            .build();
    }
    
    private void recordLoginLog(Long userId, String ip) {
        LoginLog log = new LoginLog();
        log.setUserId(userId);
        log.setIp(ip);
        log.setLoginTime(new Date());
        loginLogRepository.save(log);
    }
}
```

### 2. 用户信息管理

**用户信息更新**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PutMapping("/profile")
    public Result updateUserProfile(@RequestBody UserProfileRequest request,
                                  @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        User user = userService.updateUserProfile(userId, request);
        return Result.success(user);
    }
    
    @PostMapping("/avatar")
    public Result uploadAvatar(@RequestParam("file") MultipartFile file,
                              @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        String avatarUrl = userService.uploadAvatar(userId, file);
        return Result.success(avatarUrl);
    }
    
    @GetMapping("/addresses")
    public Result<List<Address>> getUserAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        List<Address> addresses = userService.getUserAddresses(userId);
        return Result.success(addresses);
    }
    
    @PostMapping("/addresses")
    public Result<Address> addAddress(@RequestBody AddressRequest request,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        Address address = userService.addAddress(userId, request);
        return Result.success(address);
    }
    
    @PutMapping("/addresses/{addressId}")
    public Result<Address> updateAddress(@PathVariable Long addressId,
                                         @RequestBody AddressRequest request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        Address address = userService.updateAddress(userId, addressId, request);
        return Result.success(address);
    }
    
    @DeleteMapping("/addresses/{addressId}")
    public Result deleteAddress(@PathVariable Long addressId,
                                @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        
        userService.deleteAddress(userId, addressId);
        return Result.success();
    }
}
```

## 商品中心设计

### 1. 商品管理

**商品服务实现**
```java
@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private BrandService brandService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private SearchService searchService;
    
    // 创建商品
    public Product createProduct(ProductCreateRequest request) {
        // 1. 验证分类是否存在
        Category category = categoryService.getCategory(request.getCategoryId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        
        // 2. 验证品牌是否存在
        Brand brand = brandService.getBrand(request.getBrandId());
        if (brand == null) {
            throw new BusinessException("品牌不存在");
        }
        
        // 3. 创建商品
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setImages(request.getImages());
        product.setAttributes(request.getAttributes());
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreateTime(new Date());
        
        product = productRepository.save(product);
        
        // 4. 初始化库存
        inventoryService.initInventory(product.getId(), request.getStock());
        
        // 5. 同步到搜索引擎
        searchService.indexProduct(product);
        
        return product;
    }
    
    // 更新商品
    public Product updateProduct(Long productId, ProductUpdateRequest request) {
        Product product = getProduct(productId);
        
        // 更新商品信息
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getAttributes() != null) {
            product.setAttributes(request.getAttributes());
        }
        
        product.setUpdateTime(new Date());
        product = productRepository.save(product);
        
        // 同步到搜索引擎
        searchService.updateProduct(product);
        
        return product;
    }
    
    // 商品上下架
    public void changeProductStatus(Long productId, ProductStatus status) {
        Product product = getProduct(productId);
        product.setStatus(status);
        product.setUpdateTime(new Date());
        productRepository.save(product);
        
        // 同步到搜索引擎
        if (status == ProductStatus.ACTIVE) {
            searchService.indexProduct(product);
        } else {
            searchService.deleteProduct(productId);
        }
    }
    
    // 获取商品详情
    public Product getProductDetail(Long productId) {
        Product product = getProduct(productId);
        
        // 获取库存信息
        Integer stock = inventoryService.getStock(productId);
        product.setStock(stock);
        
        return product;
    }
    
    // 商品搜索
    public Page<Product> searchProducts(ProductSearchRequest request) {
        return searchService.searchProducts(request);
    }
    
    // 商品推荐
    public List<Product> recommendProducts(Long userId, int limit) {
        return searchService.recommendProducts(userId, limit);
    }
    
    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new BusinessException("商品不存在"));
    }
}
```

### 2. 分类管理

**分类服务实现**
```java
@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 创建分类
    public Category createCategory(CategoryCreateRequest request) {
        // 验证父分类是否存在
        if (request.getParentId() != null) {
            Category parent = getCategory(request.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
        }
        
        // 验证分类名称唯一性
        if (categoryRepository.existsByNameAndParentId(request.getName(), request.getParentId())) {
            throw new BusinessException("分类名称已存在");
        }
        
        Category category = new Category();
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        category.setLevel(request.getParentId() == null ? 1 : 
            getCategory(request.getParentId()).getLevel() + 1);
        category.setSort(request.getSort());
        category.setIcon(request.getIcon());
        category.setStatus(CategoryStatus.ACTIVE);
        category.setCreateTime(new Date());
        
        category = categoryRepository.save(category);
        
        // 清除缓存
        clearCategoryCache();
        
        return category;
    }
    
    // 获取分类树
    public List<CategoryTree> getCategoryTree() {
        String cacheKey = "category:tree";
        String cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            return JSON.parseArray(cached, CategoryTree.class);
        }
        
        List<Category> allCategories = categoryRepository.findAllByStatus(CategoryStatus.ACTIVE);
        List<CategoryTree> tree = buildCategoryTree(allCategories, 0L);
        
        // 缓存结果
        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(tree), 1, TimeUnit.HOURS);
        
        return tree;
    }
    
    // 获取子分类
    public List<Category> getChildCategories(Long parentId) {
        return categoryRepository.findByParentIdAndStatus(parentId, CategoryStatus.ACTIVE);
    }
    
    // 获取分类路径
    public List<Category> getCategoryPath(Long categoryId) {
        List<Category> path = new ArrayList<>();
        Category category = getCategory(categoryId);
        
        while (category != null) {
            path.add(0, category);
            category = category.getParentId() != null ? 
                getCategory(category.getParentId()) : null;
        }
        
        return path;
    }
    
    private List<CategoryTree> buildCategoryTree(List<Category> categories, Long parentId) {
        List<CategoryTree> tree = new ArrayList<>();
        
        for (Category category : categories) {
            if (Objects.equals(category.getParentId(), parentId)) {
                CategoryTree node = new CategoryTree();
                node.setId(category.getId());
                node.setName(category.getName());
                node.setIcon(category.getIcon());
                node.setChildren(buildCategoryTree(categories, category.getId()));
                tree.add(node);
            }
        }
        
        return tree;
    }
    
    private void clearCategoryCache() {
        redisTemplate.delete("category:tree");
    }
    
    public Category getCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId).orElse(null);
    }
}
```

## 订单中心设计

### 1. 订单创建

**订单服务实现**
```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    // 创建订单
    public Order createOrder(OrderCreateRequest request, Long userId) {
        // 1. 验证商品信息
        List<OrderItem> orderItems = validateOrderItems(request.getItems());
        
        // 2. 计算订单金额
        OrderAmount amount = calculateOrderAmount(orderItems, request.getCouponId());
        
        // 3. 检查库存
        checkInventory(orderItems);
        
        // 4. 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setTotalAmount(amount.getTotalAmount());
        order.setDiscountAmount(amount.getDiscountAmount());
        order.setPayAmount(amount.getPayAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setRemark(request.getRemark());
        order.setCreateTime(new Date());
        
        order = orderRepository.save(order);
        
        // 5. 创建订单项
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
            orderItemRepository.save(item);
        }
        
        // 6. 锁定库存
        inventoryService.lockInventory(orderItems, order.getOrderNo());
        
        // 7. 清空购物车
        cartService.clearCart(userId, request.getItemIds());
        
        // 8. 发送订单创建消息
        sendOrderCreatedMessage(order);
        
        return order;
    }
    
    // 订单支付
    public PaymentResponse payOrder(Long orderId, PaymentRequest request) {
        Order order = getOrder(orderId);
        
        // 验证订单状态
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("订单状态不正确");
        }
        
        // 创建支付
        Payment payment = paymentService.createPayment(order, request);
        
        return new PaymentResponse(payment.getPaymentNo(), payment.getPayUrl());
    }
    
    // 订单支付成功
    public void handlePaymentSuccess(String paymentNo) {
        Payment payment = paymentService.getPaymentByNo(paymentNo);
        Order order = getOrder(payment.getOrderId());
        
        // 更新订单状态
        order.setStatus(OrderStatus.PAID);
        order.setPayTime(new Date());
        orderRepository.save(order);
        
        // 扣减库存
        inventoryService.deductInventory(payment.getOrderId());
        
        // 发送支付成功消息
        sendPaymentSuccessMessage(order);
    }
    
    // 订单发货
    public void shipOrder(Long orderId, ShipOrderRequest request) {
        Order order = getOrder(orderId);
        
        // 验证订单状态
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException("订单状态不正确");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.SHIPPED);
        order.setShippingCompany(request.getShippingCompany());
        order.setShippingNo(request.getShippingNo());
        order.setShippingTime(new Date());
        orderRepository.save(order);
        
        // 发送发货消息
        sendOrderShippedMessage(order);
    }
    
    // 确认收货
    public void confirmReceipt(Long orderId) {
        Order order = getOrder(orderId);
        
        // 验证订单状态
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new BusinessException("订单状态不正确");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.COMPLETED);
        order.setConfirmTime(new Date());
        orderRepository.save(order);
        
        // 发送确认收货消息
        sendOrderCompletedMessage(order);
    }
    
    // 取消订单
    public void cancelOrder(Long orderId, String reason) {
        Order order = getOrder(orderId);
        
        // 验证订单状态
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("订单状态不正确");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        order.setCancelTime(new Date());
        orderRepository.save(order);
        
        // 释放库存
        inventoryService.releaseInventory(orderId);
        
        // 发送订单取消消息
        sendOrderCancelledMessage(order);
    }
    
    private List<OrderItem> validateOrderItems(List<OrderItemRequest> items) {
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest item : items) {
            Product product = productService.getProductDetail(item.getProductId());
            
            // 验证商品状态
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BusinessException("商品已下架");
            }
            
            // 验证库存
            if (product.getStock() < item.getQuantity()) {
                throw new BusinessException("商品库存不足");
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductImage(product.getImages().get(0));
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setTotalAmount(product.getPrice() * item.getQuantity());
            
            orderItems.add(orderItem);
        }
        
        return orderItems;
    }
    
    private OrderAmount calculateOrderAmount(List<OrderItem> orderItems, Long couponId) {
        BigDecimal totalAmount = orderItems.stream()
            .map(OrderItem::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        // 计算优惠券折扣
        if (couponId != null) {
            discountAmount = couponService.calculateDiscount(couponId, totalAmount);
        }
        
        BigDecimal payAmount = totalAmount.subtract(discountAmount);
        
        return new OrderAmount(totalAmount, discountAmount, payAmount);
    }
    
    private void checkInventory(List<OrderItem> orderItems) {
        for (OrderItem item : orderItems) {
            Integer stock = inventoryService.getStock(item.getProductId());
            if (stock < item.getQuantity()) {
                throw new BusinessException("商品库存不足");
            }
        }
    }
    
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + 
               String.format("%04d", new Random().nextInt(10000));
    }
    
    private void sendOrderCreatedMessage(Order order) {
        OrderMessage message = new OrderMessage();
        message.setOrderId(order.getId());
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAction("ORDER_CREATED");
        
        rabbitTemplate.convertAndSend("order.exchange", "order.created", message);
    }
    
    private void sendPaymentSuccessMessage(Order order) {
        OrderMessage message = new OrderMessage();
        message.setOrderId(order.getId());
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAction("PAYMENT_SUCCESS");
        
        rabbitTemplate.convertAndSend("order.exchange", "payment.success", message);
    }
    
    private void sendOrderShippedMessage(Order order) {
        OrderMessage message = new OrderMessage();
        message.setOrderId(order.getId());
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAction("ORDER_SHIPPED");
        
        rabbitTemplate.convertAndSend("order.exchange", "order.shipped", message);
    }
    
    private void sendOrderCompletedMessage(Order order) {
        OrderMessage message = new OrderMessage();
        message.setOrderId(order.getId());
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAction("ORDER_COMPLETED");
        
        rabbitTemplate.convertAndSend("order.exchange", "order.completed", message);
    }
    
    private void sendOrderCancelledMessage(Order order) {
        OrderMessage message = new OrderMessage();
        message.setOrderId(order.getId());
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAction("ORDER_CANCELLED");
        
        rabbitTemplate.convertAndSend("order.exchange", "order.cancelled", message);
    }
    
    private Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException("订单不存在"));
    }
}
```

## 总结

电商系统设计是一个复杂的工程，需要考虑：

1. **业务复杂性**：涵盖用户、商品、订单、支付等多个业务域
2. **高并发性**：需要支持大量用户同时访问
3. **数据一致性**：保证订单、库存等数据的一致性
4. **系统扩展性**：支持业务快速发展和扩展
5. **用户体验**：提供流畅的购物体验

通过合理的架构设计和技术选型，可以构建稳定、高效、可扩展的电商系统。