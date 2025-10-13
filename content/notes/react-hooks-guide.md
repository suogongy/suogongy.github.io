---
title: "React Hooks 完全指南"
description: "深入解析 React Hooks 的使用方法和最佳实践"
date: "2024-01-15"
excerpt: "全面掌握 React Hooks 的核心概念、使用方法和高级技巧"
tags: ["React", "JavaScript", "前端"]
category: "notes"
---

# React Hooks 完全指南

React Hooks 是 React 16.8 引入的新特性，它让我们在不编写类组件的情况下使用 state 和其他 React 特性。

## 目录

1. [Hooks 简介](#hooks-简介)
2. [基本 Hooks](#基本-hooks)
3. [自定义 Hooks](#自定义-hooks)
4. [Hooks 规则](#hooks-规则)
5. [最佳实践](#最佳实践)

## Hooks 简介

Hooks 是一些可以让你在函数组件里"钩入" React state 及生命周期等特性的函数。Hook 不能在类组件中使用 —— 这使得你不使用 class 也能使用 React。

### 为什么需要 Hooks？

1. **组件逻辑复用**：解决了高阶组件和 render props 的嵌套地狱问题
2. **复杂组件理解**：将相关逻辑组织在一起，而不是分散在不同的生命周期方法中
3. **类组件的困惑**：告别 `this` 指向的困扰

## 基本 Hooks

### useState

`useState` 是最常用的 Hook，用于在函数组件中添加状态。

```javascript
import React, { useState } from 'react';

function Counter() {
  // 声明一个新的叫做 "count" 的 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### useState 语法

```javascript
const [state, setState] = useState(initialState);
```

- `state`：当前状态值
- `setState`：更新状态的函数
- `initialState`：初始状态值

#### 函数式更新

如果新的 state 需要通过使用先前的 state 计算得出，那么可以传递函数给 `setState`：

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(prevCount => prevCount + 1);
  }

  return (
    <button onClick={handleClick}>
      Count: {count}
    </button>
  );
}
```

### useEffect

`useEffect` Hook 可以让你在函数组件中执行副作用操作。

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    // 更新文档标题
    document.title = `You clicked ${count} times`;
  }, [count]); // 仅在 count 更改时更新

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### 清除副作用

副作用函数还可以返回一个清除函数：

```javascript
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    // 清除订阅
    subscription.unsubscribe();
  };
}, [props.source]);
```

#### 常见的使用场景

1. **数据获取**：
```javascript
useEffect(() => {
  const fetchData = async () => {
    const result = await axios('https://api.example.com/data');
    setData(result.data);
  };
  
  fetchData();
}, []);
```

2. **订阅**：
```javascript
useEffect(() => {
  const handleScroll = () => {
    console.log(window.scrollY);
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

3. **定时器**：
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

### useContext

`useContext` 可以在组件之间共享状态，而不需要显式地通过组件树逐层传递 props。

```javascript
import React, { useContext, createContext } from 'react';

// 创建 Context
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button style={{ background: theme === 'dark' ? '#333' : '#FFF' }}>
    I am a {theme} button
  </button>;
}
```

## 自定义 Hooks

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

### 创建自定义 Hook

```javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// 使用自定义 Hook
function Counter() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 实用的自定义 Hook 示例

#### useLocalstorage

```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

#### useDebounce

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Hooks 规则

使用 Hook 时必须遵循两条规则：

### 1. 只在最顶层使用 Hook

不要在循环、条件或嵌套函数中调用 Hook：

```javascript
// ❌ 错误
function BadComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0);
  }
}

// ✅ 正确
function GoodComponent() {
  const [count, setCount] = useState(0);
  
  if (someCondition) {
    // 在条件中使用 state
    return <div>{count}</div>;
  }
}
```

### 2. 只在 React 函数中调用 Hook

不要在普通的 JavaScript 函数中调用 Hook：

```javascript
// ❌ 错误
function handleSomething() {
  const [count, setCount] = useState(0);
}

// ✅ 正确
function MyComponent() {
  const [count, setCount] = useState(0);
  
  const handleSomething = () => {
    // 在事件处理函数中使用 state
    setCount(count + 1);
  };
}
```

## 最佳实践

### 1. 合理组织 Hooks

```javascript
function UserProfile({ userId }) {
  // 将相关的 hooks 组织在一起
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 数据获取逻辑
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  // 其他的 hooks...
  const theme = useContext(ThemeContext);
  
  // ...
}
```

### 2. 使用自定义 Hook 抽象逻辑

```javascript
// 将数据获取逻辑抽象到自定义 Hook
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// 组件变得简洁
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);
  const theme = useContext(ThemeContext);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{user.name}</div>;
}
```

### 3. 性能优化

#### useMemo

```javascript
function ExpensiveComponent({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>Total: {expensiveValue}</div>;
}
```

#### useCallback

```javascript
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组，函数不会重新创建

  return (
    <div>
      <ChildComponent onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### 4. 错误边界和 Hooks

```javascript
function useErrorHandler() {
  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

// 使用示例
function MyComponent() {
  const setError = useErrorHandler();

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (err) {
      setError(err);
    }
  };

  return <button onClick={handleAsyncOperation}>Run Operation</button>;
}
```

## 总结

React Hooks 为函数组件提供了强大的能力，让我们能够：

1. **更好地组织代码逻辑**
2. **复用组件逻辑**
3. **简化组件结构**

掌握 Hooks 需要理解其工作原理和遵循使用规则。通过合理使用内置 Hooks 和创建自定义 Hooks，我们可以构建更加清晰、可维护的 React 应用。

记住这两个关键点：
- **只在顶层调用 Hook**
- **只在 React 函数中调用 Hook**

这样就能充分发挥 Hooks 的威力！